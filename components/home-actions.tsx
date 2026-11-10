'use client';

import Link from 'next/link';
import { useAuth } from '@/context/auth-context';

const primary =
  'inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300';
const secondary =
  'inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800';

/** Buttons that depend on whether the user is logged in. */
export function HomeActions() {
  const { status, user } = useAuth();

  if (status === 'loading') {
    return <div className="h-10" />; // keep the layout steady while the session restores
  }

  if (status === 'authenticated' && user) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/dashboard" className={primary}>
          Go to dashboard
        </Link>
        <span className="text-sm text-zinc-600 dark:text-zinc-400">Logged in as {user.name}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Link href="/register" className={primary}>
        Create an account
      </Link>
      <Link href="/login" className={secondary}>
        Log in
      </Link>
    </div>
  );
}
