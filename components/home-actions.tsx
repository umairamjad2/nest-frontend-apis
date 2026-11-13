'use client';

import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { homeContent } from '@/content/home';

const primary =
  'inline-flex h-11 items-center justify-center rounded-lg bg-brand px-6 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-hover';
const secondary =
  'inline-flex h-11 items-center justify-center rounded-lg border border-zinc-300 bg-white px-6 text-sm font-semibold transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800';

/** Buttons that depend on whether the user is logged in. Text comes from content/home.ts. */
export function HomeActions() {
  const { status, user } = useAuth();
  const { guest, member } = homeContent.actions;

  if (status === 'loading') {
    return <div className="h-11" />; // keep the layout steady while the session restores
  }

  if (status === 'authenticated' && user) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Link href={member.primary.href} className={primary}>
          {member.primary.label}
        </Link>
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          {member.loggedInAs} {user.name}
        </span>
      </div>
    );
  }

  return (
    // Full-width stacked buttons on phones, side by side from the sm breakpoint
    <div className="flex flex-col gap-3 sm:flex-row">
      <Link href={guest.primary.href} className={primary}>
        {guest.primary.label}
      </Link>
      <Link href={guest.secondary.href} className={secondary}>
        {guest.secondary.label}
      </Link>
    </div>
  );
}
