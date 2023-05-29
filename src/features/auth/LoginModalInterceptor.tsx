import React, { useEffect, useRef } from 'react';

import {
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import Axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuthContext } from '@/features/auth/AuthContext';
import { LoginForm } from '@/features/auth/LoginForm';

export const LoginModalInterceptor = () => {
  const { t } = useTranslation(['auth']);
  const loginModal = useDisclosure();
  const { isAuthenticated, updateToken } = useAuthContext();
  const queryCache = useQueryClient();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const openLoginModal = loginModal.onOpen;

  useEffect(() => {
    const interceptor = Axios.interceptors.response.use(
      (r) => r,
      (error) => {
        if (
          error?.response?.status === 401 &&
          pathnameRef.current !== '/login'
        ) {
          queryCache.cancelQueries();
          openLoginModal();
        }
        throw error;
      }
    );

    return () => Axios.interceptors.response.eject(interceptor);
  }, [openLoginModal, updateToken, queryCache]);

  const handleLogin = async () => {
    await queryCache.refetchQueries();
    loginModal.onClose();
  };

  const handleClose = () => {
    updateToken(null);
    loginModal.onClose();
    navigate('/login');
  };

  const handleResetPassword = () => {
    updateToken(null);
    loginModal.onClose();
    navigate('/account/reset');
  };

  return (
    <Modal
      isOpen={loginModal.isOpen && isAuthenticated}
      onClose={handleClose}
      closeOnOverlayClick={false}
      trapFocus={false}
    >
      <ModalOverlay style={{ backdropFilter: 'blur(6px)' }} />
      <ModalContent>
        <ModalCloseButton />
        <ModalBody p="6">
          <Heading size="lg">{t('auth:interceptor.title')}</Heading>
          <Text mb="2">{t('auth:interceptor.description')}</Text>
          <LoginForm
            onSuccess={handleLogin}
            onResetPassword={handleResetPassword}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
