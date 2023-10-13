import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { zUser } from '@/features/users/schemas';
import { ExtendedTRPCError } from '@/server/config/errors';
import { adminProcedure, createTRPCRouter } from '@/server/config/trpc';

export const usersRouter = createTRPCRouter({
  getById: adminProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/users/{id}',
        protect: true,
        tags: ['users'],
      },
    })
    .input(
      zUser().pick({
        id: true,
      })
    )
    .output(zUser())
    .query(async ({ ctx, input }) => {
      ctx.logger.info('Getting user');
      const user = await ctx.db.user.findUnique({
        where: { id: input.id },
      });

      if (!user) {
        ctx.logger.warn('Unable to find user with the provided input');
        throw new TRPCError({
          code: 'NOT_FOUND',
        });
      }

      return user;
    }),

  getAll: adminProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/users',
        protect: true,
        tags: ['users'],
      },
    })
    .input(
      z.object({
        page: z.number().int().gte(1).default(1),
        size: z.number().int().gte(1).default(20),
      })
    )
    .output(
      z.object({
        items: z.array(zUser()),
        total: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      ctx.logger.info('Getting users using pagination');
      const [items, total] = await Promise.all([
        ctx.db.user.findMany({
          skip: (input.page - 1) * input.size,
          take: input.size,
          orderBy: {
            id: 'desc',
          },
        }),
        ctx.db.user.count(),
      ]);

      return {
        items,
        total,
      };
    }),

  create: adminProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/users',
        protect: true,
        tags: ['users'],
      },
    })
    .input(
      zUser().required().pick({
        name: true,
        email: true,
      })
    )
    .output(zUser())
    .mutation(async ({ ctx, input }) => {
      ctx.logger.info('Creating user');
      try {
        return await ctx.db.user.create({
          data: input,
        });
      } catch (e) {
        throw new ExtendedTRPCError({
          cause: e,
        });
      }
    }),

  deactivate: adminProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/users/{id}/deactivate',
        protect: true,
        tags: ['users'],
      },
    })
    .input(
      zUser().pick({
        id: true,
      })
    )
    .output(zUser())
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.id === input.id) {
        ctx.logger.warn('Logged user cannot deactivate itself');
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You cannot deactivate yourself',
        });
      }

      ctx.logger.info('Deactivating user');
      return await ctx.db.user.update({
        where: { id: input.id },
        data: {
          accountStatus: 'DISABLED',
        },
      });
    }),

  activate: adminProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/users/{id}/activate',
        protect: true,
        tags: ['users'],
      },
    })
    .input(
      zUser().pick({
        id: true,
      })
    )
    .output(zUser())
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.id === input.id) {
        ctx.logger.warn('Logged user cannot activate itself');
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You cannot activate yourself',
        });
      }

      ctx.logger.info('Activating user');
      return await ctx.db.user.update({
        where: { id: input.id },
        data: {
          accountStatus: 'ENABLED',
        },
      });
    }),

  updateById: adminProcedure
    .meta({
      openapi: {
        method: 'PUT',
        path: '/users/{id}',
        protect: true,
        tags: ['users'],
      },
    })
    .input(
      zUser().required().pick({
        id: true,
        name: true,
        email: true,
        language: true,
        authorizations: true,
      })
    )
    .output(zUser())
    .mutation(async ({ ctx, input }) => {
      ctx.logger.info({ input }, 'Updating user');
      try {
        return await ctx.db.user.update({
          where: { id: input.id },
          data: input,
        });
      } catch (e) {
        throw new ExtendedTRPCError({
          cause: e,
        });
      }
    }),

  removeById: adminProcedure
    .meta({
      openapi: {
        method: 'DELETE',
        path: '/users/{id}',
        protect: true,
        tags: ['users'],
      },
    })
    .input(
      zUser().required().pick({
        id: true,
      })
    )
    .output(zUser())
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.id === input.id) {
        ctx.logger.warn('Logged user cannot delete itself');
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You cannot remove yourself',
        });
      }

      ctx.logger.info({ input }, 'Removing user');
      return await ctx.db.user.delete({
        where: { id: input.id },
      });
    }),
});
