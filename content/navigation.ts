// Navbar text and links. Edit here; components/navbar.tsx only renders it.

export interface NavLink {
  label: string;
  href: string;
  adminOnly?: boolean; // shown only to users with the ADMIN role
}

export const siteName = 'TaskNest';

/** Links for logged-in users */
export const memberLinks: NavLink[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Tasks', href: '/tasks' },
  { label: 'Profile', href: '/profile' },
  { label: 'Users', href: '/admin/users', adminOnly: true },
];

/** Buttons for visitors who aren't logged in */
export const guestLinks = {
  login: { label: 'Log in', href: '/login' },
  register: { label: 'Register', href: '/register' },
};

export const navLabels = {
  logout: 'Log out',
  adminBadge: 'Admin',
  openMenu: 'Open menu',
  closeMenu: 'Close menu',
};
