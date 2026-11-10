'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';

const linkClass =
  'text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100';

export function Navbar() {
  const { status, user, logout } = useAuth();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      // logout() clears the session locally even if the request fails.
    } finally {
      setLoggingOut(false);
      router.replace('/login');
    }
  }

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <Link href="/" className="font-semibold tracking-tight">
          NestJS Auth
        </Link>

        {/* Render nothing while the session is restoring, so the links don't flicker. */}
        {status === 'unauthenticated' && (
          <div className="flex items-center gap-4">
            <Link href="/login" className={linkClass}>
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Register
            </Link>
          </div>
        )}

        {status === 'authenticated' && user && (
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className={linkClass}>
              Dashboard
            </Link>
            <Link href="/profile" className={linkClass}>
              Profile
            </Link>
            {user.role === 'ADMIN' && (
              <Link href="/admin/users" className={linkClass}>
                Users
              </Link>
            )}
            <span className="hidden text-sm text-zinc-600 md:inline dark:text-zinc-400">
              {user.name}
              {user.role === 'ADMIN' && (
                <span className="ml-2 rounded bg-zinc-200 px-1.5 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                  Admin
                </span>
              )}
            </span>
            <Button variant="secondary" loading={loggingOut} onClick={handleLogout} className="h-8 px-3">
              Log out
            </Button>
          </div>
        )}
      </nav>
    </header>
  );
}
