'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { guestLinks, memberLinks, navLabels, siteName } from '@/content/navigation';

const linkClass = 'text-sm transition-colors hover:text-zinc-900 dark:hover:text-zinc-100';
const inactiveClass = 'text-zinc-600 dark:text-zinc-400';
const activeClass = 'font-medium text-zinc-900 dark:text-zinc-100';

const registerClass =
  'rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-hover';

export function Navbar() {
  const { status, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Escape closes the mobile menu
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      // logout() clears the session locally even if the request fails.
    } finally {
      setLoggingOut(false);
      setMenuOpen(false);
      router.replace('/login');
    }
  }

  const closeMenu = () => setMenuOpen(false);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const links =
    status === 'authenticated' && user
      ? memberLinks.filter((link) => !link.adminOnly || user.role === 'ADMIN')
      : [];
  const isAdmin = user?.role === 'ADMIN';

  const adminBadge = (
    <span className="ml-2 rounded bg-zinc-200 px-1.5 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
      {navLabels.adminBadge}
    </span>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-background/85 backdrop-blur dark:border-zinc-800">
      <nav className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" onClick={closeMenu} className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
          <span aria-hidden className="size-2.5 rounded-full bg-brand" />
          {siteName}
        </Link>

        {/* Desktop (md and up). No links while the session restores, so they don't flicker. */}
        <div className="hidden items-center gap-5 md:flex">
          {status === 'unauthenticated' && (
            <>
              <Link
                href={guestLinks.login.href}
                className={`${linkClass} ${isActive(guestLinks.login.href) ? activeClass : inactiveClass}`}
              >
                {guestLinks.login.label}
              </Link>
              <Link href={guestLinks.register.href} className={registerClass}>
                {guestLinks.register.label}
              </Link>
            </>
          )}

          {status === 'authenticated' && user && (
            <>
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  className={`${linkClass} ${isActive(link.href) ? activeClass : inactiveClass}`}
                >
                  {link.label}
                </Link>
              ))}
              <span className="hidden text-sm text-zinc-600 lg:inline dark:text-zinc-400">
                {user.name}
                {isAdmin && adminBadge}
              </span>
              <Button variant="secondary" loading={loggingOut} onClick={handleLogout} className="h-8 px-3">
                {navLabels.logout}
              </Button>
            </>
          )}
          <ThemeToggle />
        </div>

        {/* Mobile (below md): theme toggle and menu button */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          {status !== 'loading' && (
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? navLabels.closeMenu : navLabels.openMenu}
              className="inline-flex size-9 items-center justify-center rounded-md text-zinc-700 transition-colors hover:bg-zinc-200/60 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-5" aria-hidden>
                {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          )}
        </div>
      </nav>

      {/* Mobile menu panel */}
      {menuOpen && status !== 'loading' && (
        <div id="mobile-menu" className="border-t border-zinc-200 px-4 pt-2 pb-4 md:hidden dark:border-zinc-800">
          {status === 'authenticated' && user ? (
            <>
              <p className="py-2 text-sm text-zinc-600 dark:text-zinc-400">
                {user.name}
                {isAdmin && adminBadge}
              </p>
              <ul className="flex flex-col">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={closeMenu}
                      aria-current={isActive(link.href) ? 'page' : undefined}
                      className={`block rounded-md px-3 py-2.5 text-base transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900 ${
                        isActive(link.href) ? 'bg-brand-soft font-semibold text-brand-text' : 'text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <Button variant="secondary" loading={loggingOut} onClick={handleLogout} className="mt-3 w-full">
                {navLabels.logout}
              </Button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href={guestLinks.login.href}
                onClick={closeMenu}
                className="flex h-10 items-center justify-center rounded-md border border-zinc-300 text-sm font-semibold dark:border-zinc-700"
              >
                {guestLinks.login.label}
              </Link>
              <Link
                href={guestLinks.register.href}
                onClick={closeMenu}
                className="flex h-10 items-center justify-center rounded-md bg-brand text-sm font-semibold text-brand-foreground hover:bg-brand-hover"
              >
                {guestLinks.register.label}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
