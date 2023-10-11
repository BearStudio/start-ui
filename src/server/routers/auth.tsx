import { TRPCError } from '@trpc/server';
import dayjs from 'dayjs';
import { cookies } from 'next/headers';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

import EmailLoginCode from '@/emails/templates/login-code';
import { EmailLoginNotFound } from '@/emails/templates/login-not-found';
import EmailRegisterCode from '@/emails/templates/register-code';
import { env } from '@/env.mjs';
import {
  VALIDATION_RETRY_DELAY_IN_SECONDS,
  VALIDATION_TOKEN_EXPIRATION_IN_MINUTES,
} from '@/features/auth/utils';
import { DEFAULT_LANGUAGE_KEY } from '@/lib/i18n/constants';
import i18n from '@/lib/i18n/server';
import {
  AUTH_COOKIE_NAME,
  deleteUsedCode,
  generateCode,
  validateCode,
} from '@/server/config/auth';
import { sendEmail } from '@/server/config/email';
import { ExtendedTRPCError } from '@/server/config/errors';
import { createTRPCRouter, publicProcedure } from '@/server/config/trpc';

export const authRouter = createTRPCRouter({
  checkAuthenticated: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/auth/check',
        tags: ['auth'],
      },
    })
    .input(z.void())
    .output(z.object({ isAuthenticated: z.boolean() }))
    .query(async ({ ctx }) => {
      ctx.logger.debug(`User ${!!ctx.user ? 'is' : 'is not'} logged`);

      return {
        isAuthenticated: !!ctx.user,
      };
    }),

  login: publicProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/auth/login',
        tags: ['auth'],
      },
    })
    .input(
      z.object({
        email: z.string().email().trim().toLowerCase(),
        language: z.string().default(DEFAULT_LANGUAGE_KEY),
      })
    )
    .output(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      ctx.logger.debug('Retrieving user info by email');
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      ctx.logger.debug('Creating token');
      const token = await randomUUID();

      if (!user) {
        ctx.logger.warn('User not found, silent error for security reasons');

        await sendEmail({
          to: input.email,
          subject: i18n.t('emails:loginNotFound.subject', {
            lng: input.language,
          }),
          template: <EmailLoginNotFound language={input.language} />,
        });

        return {
          token,
        };
      }

      if (user.accountStatus !== 'ENABLED') {
        ctx.logger.warn('Invalid user, silent error for security reasons');
        return {
          token,
        };
      }

      ctx.logger.debug('Creating code');
      const code = generateCode();

      ctx.logger.debug('Saving code and token to database');
      await ctx.db.verificationToken.create({
        data: {
          userId: user.id,
          expires: dayjs()
            .add(VALIDATION_TOKEN_EXPIRATION_IN_MINUTES, 'minutes')
            .toDate(),
          code,
          token,
        },
      });

      ctx.logger.debug('Send email with code');
      await sendEmail({
        to: input.email,
        subject: i18n.t('emails:loginCode.subject', { lng: user.language }),
        template: (
          <EmailLoginCode
            language={user.language}
            name={user.name ?? ''}
            code={code}
          />
        ),
      });

      return {
        token,
      };
    }),

  loginValidate: publicProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/auth/login/validate/{token}',
        tags: ['auth'],
        description: `Failed requests will increment retry delay timeout based on the number of attempts multiplied by ${VALIDATION_RETRY_DELAY_IN_SECONDS} seconds. The number of attempts will not be returned in the response for security purposes. You will have to save the number of attemps in the client.`,
      },
    })
    .input(z.object({ code: z.string().length(6), token: z.string().uuid() }))
    .output(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { verificationToken, userJwt } = await validateCode({
        ctx,
        ...input,
      });

      ctx.logger.debug('Updating user');
      try {
        await ctx.db.user.update({
          where: { id: verificationToken.userId, accountStatus: 'ENABLED' },
          data: {
            lastLoginAt: new Date(),
          },
        });
      } catch (e) {
        ctx.logger.warn('Failed to update the user, probably not enabled');
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Failed to authenticate the user',
        });
      }

      await deleteUsedCode({ ctx, token: verificationToken.token });

      ctx.logger.debug('Set auth cookie');
      cookies().set({
        name: AUTH_COOKIE_NAME,
        value: userJwt,
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
      });

      return {
        token: userJwt,
      };
    }),

  logout: publicProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/auth/logout',
        tags: ['auth'],
      },
    })
    .input(z.void())
    .output(z.void())
    .mutation(async ({ ctx }) => {
      ctx.logger.debug('Delete auth cookie');
      cookies().delete('auth');
    }),

  register: publicProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/auth/register',
        tags: ['auth'],
      },
    })
    .input(
      z.object({
        email: z.string().email().trim().toLowerCase(),
        name: z.string(),
        language: z.string(),
      })
    )
    .output(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      ctx.logger.debug('Checking if the user exists');
      const user = await ctx.db.user.findUnique({
        where: {
          email: input.email,
        },
      });

      ctx.logger.debug('Creating token');
      const token = await randomUUID();

      let newUser;
      // If the user doesn't exist, we create a new one.
      if (!user) {
        try {
          ctx.logger.debug('Creating a new user');
          newUser = await ctx.db.user.create({
            data: {
              email: input.email,
              name: input.name,
              language: input.language,
            },
          });
        } catch (e) {
          ctx.logger.warn('Failed to create user');
          throw new ExtendedTRPCError({
            cause: e,
          });
        }
      }
      // If the user exists and email is not verified, it means the user (or
      // someone else) did register using this email but did not complete the
      // validation flow. So we update the data according to the new
      // informations.
      else if (user && user.accountStatus === 'NOT_VERIFIED') {
        newUser = await ctx.db.user.update({
          where: {
            email: input.email,
          },
          data: {
            language: input.language,
            name: input.name,
          },
        });
      }

      if (!newUser) {
        ctx.logger.error(
          'An error occured while creating or updating the user, the address may already exists, silent error for security reasons'
        );
        return {
          token,
        };
      }

      // If we got here, the user exists and email is verified, no need to
      // register, send the email to login the user.
      ctx.logger.debug('Creating code');
      const code = generateCode();

      ctx.logger.debug('Creating verification token in database');
      await ctx.db.verificationToken.create({
        data: {
          userId: newUser.id,
          token,
          expires: dayjs()
            .add(VALIDATION_TOKEN_EXPIRATION_IN_MINUTES, 'minutes')
            .toDate(),
          code,
        },
      });

      ctx.logger.debug('Sending email to register');
      await sendEmail({
        to: input.email,
        subject: i18n.t('emails:registerCode.subject', {
          lng: newUser.language,
        }),
        template: (
          <EmailRegisterCode
            language={newUser.language}
            name={newUser.name ?? ''}
            code={code}
          />
        ),
      });

      return {
        token,
      };
    }),
  registerValidate: publicProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/auth/register/validate/{token}',
        tags: ['auth'],
        description: `Failed requests will increment retry delay timeout based on the number of attempts multiplied by ${VALIDATION_RETRY_DELAY_IN_SECONDS} seconds. The number of attempts will not be returned in the response for security purposes. You will have to save the number of attemps in the client.`,
      },
    })
    .input(z.object({ code: z.string().length(6), token: z.string().uuid() }))
    .output(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { verificationToken, userJwt } = await validateCode({
        ctx,
        ...input,
      });

      ctx.logger.debug('Updating user');
      try {
        await ctx.db.user.update({
          where: {
            id: verificationToken.userId,
            accountStatus: 'NOT_VERIFIED',
          },
          data: {
            lastLoginAt: new Date(),
            accountStatus: 'ENABLED',
          },
        });
      } catch (e) {
        ctx.logger.warn('Failed to update the user, probably already verified');
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Failed to authenticate the user',
        });
      }

      await deleteUsedCode({ ctx, token: verificationToken.token });

      ctx.logger.debug('Set auth cookie');
      cookies().set({
        name: AUTH_COOKIE_NAME,
        value: userJwt,
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
      });

      return {
        token: userJwt,
      };
    }),
});