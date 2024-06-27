'use client';

import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from '@nextui-org/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { CgProfile } from 'react-icons/cg';

const CustomNavbar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuOptions = [
    {
      text: 'Create request',
      href: '/',
      isActive: pathname === '/',
    },
    {
      text: 'My requests',
      href: '/myRequests',
      isActive: pathname === '/myRequests',
    },
    {
      text: 'My searches',
      href: '/mySearches',
      isActive: pathname === '/mySearches',
    },
  ];

  const navBarItems = menuOptions.map((option) => (
    <NavbarItem key={option.text} isActive={option.isActive}>
      <Link
        href={option.href}
        aria-current={option.isActive ? 'page' : undefined}
      >
        {option.text}
      </Link>
    </NavbarItem>
  ));

  const navBarMenuItems = menuOptions.map((option) => (
    <NavbarMenuItem key={option.text} isActive={option.isActive}>
      <Link
        href={option.href}
        aria-current={option.isActive ? 'page' : undefined}
      >
        {option.text}
      </Link>
    </NavbarMenuItem>
  ));

  return (
    <Navbar onMenuOpenChange={setIsMenuOpen} isBordered>
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className="sm:hidden"
        />
        <NavbarBrand>
          <Link href="/" className="font-bold text-inherit">
            BooSearcher
          </Link>
        </NavbarBrand>
      </NavbarContent>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {navBarItems}
      </NavbarContent>
      <NavbarContent justify="end">
        <Dropdown>
          <DropdownTrigger>
            <Avatar
              //   isBordered
              showFallback
              as="button"
              className="transition-transform"
              //   color="secondary"
              size="sm"
              icon={<CgProfile size="24" />}
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Static Actions">
            <DropdownItem key="profile">My Profile</DropdownItem>
            <DropdownItem
              key="logout"
              onClick={async () => {
                await signOut();
              }}
            >
              Logout
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
      <NavbarMenu>{navBarMenuItems}</NavbarMenu>
    </Navbar>
  );
};

export { CustomNavbar };
