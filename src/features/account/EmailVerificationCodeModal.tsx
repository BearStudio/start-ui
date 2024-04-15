import React from 'react';

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
} from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Form } from '@/components/Form';
import { useToastSuccess } from '@/components/Toast';
import {
  VerificationCodeForm,
  useOnVerificationCodeError,
} from '@/features/auth/VerificationCodeForm';
import {
  FormFieldsVerificationCode,
  zFormFieldsVerificationCode,
} from '@/features/auth/schemas';
import { trpc } from '@/lib/trpc/client';

export const SEARCH_PARAM_VERIFY_EMAIL = 'verify-email';

export const EmailVerificationCodeModale = () => {
  const { t } = useTranslation(['account']);
  const [searchParams, setSearchParams] = useQueryStates({
    [SEARCH_PARAM_VERIFY_EMAIL]: parseAsString,
    token: parseAsString,
    attempts: parseAsInteger.withDefault(0),
    verifyEmail: parseAsString,
  });
  const trpcUtils = trpc.useUtils();
  const toastSuccess = useToastSuccess();

  const onClose = () => {
    trpcUtils.account.get.reset();
    setSearchParams({
      [SEARCH_PARAM_VERIFY_EMAIL]: null,
      token: null,
      attempts: null,
    });
  };

  const form = useForm<FormFieldsVerificationCode>({
    mode: 'onBlur',
    resolver: zodResolver(zFormFieldsVerificationCode()),
    defaultValues: {
      code: '',
    },
  });
  const onVerificationCodeError = useOnVerificationCodeError({
    onError: (error) => form.setError('code', { message: error }),
  });
  const updateEmailValidate = trpc.account.updateEmailValidate.useMutation({
    onSuccess: async () => {
      onClose();
      toastSuccess({
        title: t('account:email.feedbacks.updateSuccess.title'),
      });
    },
    onError: onVerificationCodeError,
  });

  const onSubmit: SubmitHandler<FormFieldsVerificationCode> = (values) => {
    updateEmailValidate.mutate({ ...values, token: searchParams.token ?? '' });
  };

  return (
    <Modal size="sm" isOpen onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalBody>
          <Form {...form}>
            <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
              <VerificationCodeForm
                email={searchParams.verifyEmail ?? ''}
                isLoading={
                  updateEmailValidate.isLoading || updateEmailValidate.isSuccess
                }
              />
            </form>
          </Form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
