import React, { useContext } from 'react';

import {
  Box,
  Flex,
  Stack,
  Button,
  SlideFade,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  IconButton,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuGroup,
  MenuDivider,
  Spinner,
  useTheme,
  Icon,
} from '@chakra-ui/react';
import { FiLogOut, FiMenu, FiUser, FiUsers } from 'react-icons/fi';
import { Link as RouterLink, useLocation, useHistory } from 'react-router-dom';

import { useAccount } from '@/app/account/service';

const NavbarContext = React.createContext(null);

const NavbarLogo = (props) => (
  <Box w="8rem" h="1rem" bg="gray.600" borderRadius="full" {...props} />
);

const NavbarItem = ({ to, ...rest }: any) => {
  const { onClose } = useContext(NavbarContext);
  const { pathname } = useLocation();
  const isActive = pathname.startsWith(to);
  return (
    <Button
      as={RouterLink}
      to={to}
      variant="ghost"
      justifyContent="flex-start"
      position="relative"
      opacity={isActive ? 1 : 0.8}
      _active={{ bg: 'gray.700' }}
      _hover={{
        bg: 'gray.900',
        _after: {
          opacity: 1,
          w: '2rem',
        },
      }}
      _after={{
        opacity: isActive ? 1 : 0,
        content: '""',
        position: 'absolute',
        left: { base: 8, md: '50%' },
        bottom: '0.2em',
        transform: 'translateX(-50%)',
        transition: '0.2s',
        w: isActive ? '2rem' : 0,
        h: '2px',
        borderRadius: 'full',
        bg: 'currentColor',
      }}
      onClick={onClose}
      {...rest}
    />
  );
};

const NavbarMenu = (props) => (
  <Stack direction="row" spacing="1" {...props}>
    <NavbarItem to="/dashboard">Dashboard</NavbarItem>
    <NavbarItem to="/entity">Entity</NavbarItem>
  </Stack>
);

const NavbarMenuButton = (props) => {
  const { onOpen } = useContext(NavbarContext);
  return (
    <IconButton
      aria-label="Navigation"
      icon={<FiMenu size="1.5em" />}
      onClick={onOpen}
      variant="ghost"
      _active={{ bg: 'gray.700' }}
      _hover={{ bg: 'gray.900' }}
      {...props}
    />
  );
};

const NavbarMenuDrawer = ({ children, ...rest }) => {
  const { isOpen, onClose } = useContext(NavbarContext);
  return (
    <Drawer isOpen={isOpen} placement="left" onClose={onClose} {...rest}>
      <DrawerOverlay>
        <DrawerContent
          bg="gray.800"
          color="gray.50"
          pt="safe-top"
          pb="safe-bottom"
        >
          <DrawerCloseButton mt="safe-top" />
          <DrawerHeader>
            <NavbarLogo />
          </DrawerHeader>
          <DrawerBody p="2">{children}</DrawerBody>
        </DrawerContent>
      </DrawerOverlay>
    </Drawer>
  );
};

const NavbarAccountMenu = (props) => {
  const { account, isAdmin, isLoading } = useAccount();
  const history = useHistory();

  return (
    <Menu {...props}>
      <MenuButton borderRadius="full" _focus={{ shadow: 'outline' }}>
        <Avatar size="sm" icon={<></>} name={!isLoading && `${account?.login}`}>
          {isLoading && <Spinner size="xs" />}
        </Avatar>
      </MenuButton>
      <MenuList color="gray.800">
        <MenuGroup title={account?.email}>
          <MenuItem
            icon={<Icon as={FiUser} fontSize="lg" color="gray.400" />}
            onClick={() => history.push('/account')}
          >
            My Account
          </MenuItem>
        </MenuGroup>
        <MenuDivider />
        {isAdmin && (
          <>
            <MenuGroup title="Administration">
              <MenuItem
                icon={<Icon as={FiUsers} fontSize="lg" color="gray.400" />}
                onClick={() => history.push('/admin/users')}
              >
                User Management
              </MenuItem>
            </MenuGroup>
            <MenuDivider />
          </>
        )}
        <MenuItem
          icon={<Icon as={FiLogOut} fontSize="lg" color="gray.400" />}
          onClick={() => history.push('/logout')}
        >
          Logout
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export const Navbar = () => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const theme = useTheme();
  const navbarHeight = `calc(4rem + ${theme.space['safe-top']})`;

  return (
    <NavbarContext.Provider value={{ isOpen, onClose, onOpen }}>
      <SlideFade in offsetY={-40} style={{ zIndex: 2 }}>
        <Flex
          position="fixed"
          top="0"
          left="0"
          right="0"
          bg="gray.800"
          color="gray.50"
          align="center"
          pt="safe-top"
          px="4"
          h={navbarHeight}
        >
          <NavbarMenuButton
            display={{ base: 'flex', md: 'none' }}
            ml="-0.5rem"
          />
          <NavbarLogo mx={{ base: 'auto', md: '0' }} />
          <NavbarMenu ml="auto" mr="4" display={{ base: 'none', md: 'flex' }} />
          <NavbarAccountMenu />
        </Flex>
      </SlideFade>
      <Box h={navbarHeight} />
      <NavbarMenuDrawer>
        <NavbarMenu direction="column" />
      </NavbarMenuDrawer>
    </NavbarContext.Provider>
  );
};