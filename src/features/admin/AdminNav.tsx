import React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { LuBookOpen, LuGem, LuUsers } from 'react-icons/lu';

import { Nav, NavGroup, NavItem } from '@/components/Nav';

export const AdminNav = () => {
  const { t } = useTranslation(['admin']);
  const pathname = usePathname();
  const isActive = (to: string) => pathname?.startsWith(to);
  return (
    <Nav>
      <NavGroup title={t('admin:nav.administration')}>
        <NavItem
          as={Link}
          href="/admin/users"
          isActive={isActive('/admin/users')}
          icon={LuUsers}
        >
          {t('admin:nav.users')}
        </NavItem>
        <NavItem
          as={Link}
          href="/admin/subscriptions"
          isActive={isActive('/admin/subscriptions')}
          icon={LuGem}
        >
          {t('admin:nav.subscriptions')}
        </NavItem>
        <NavItem
          as={Link}
          href="/admin/api"
          isActive={isActive('/admin/api')}
          icon={LuBookOpen}
        >
          {t('admin:nav.apiDocumentation')}
        </NavItem>
      </NavGroup>
    </Nav>
  );
};
