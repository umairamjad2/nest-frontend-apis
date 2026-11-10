'use client';

import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { safeRedirectPath } from '@/lib/redirect';

/** Shown while the session is restoring, or just before a redirect. */
export function PageSpinner() {
  return (
    <div className="flex flex-1 items-center justify-center py-24" role="status" aria-label="Loading">
      <span className="size-6 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
    </div>
  );
}

/**
 * For pages that need a logged-in user. Logged-out users go to /login?next=<this page>.
 *
 * This only hides pages in the browser. The real protection is the backend, which
 * rejects requests without a valid access token.
 */
export function ProtectedGuard({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [status, router, pathname]);

  // Wait for the startup refresh before deciding; don't flash the page while redirecting.
  if (status !== 'authenticated') {
    return <PageSpinner />;
  }
  return children;
}

/** Shown to a logged-in user who opens a page they don't have the role for. */
export function Forbidden() {
  return (
    <div className="flex flex-col items-start gap-3 py-12">
      <p className="text-sm font-medium text-zinc-500">403</p>
      <h1 className="text-3xl font-semibold tracking-tight">You don&apos;t have permission</h1>
      <p className="text-zinc-600 dark:text-zinc-400">This page is for administrators only.</p>
      <Link href="/dashboard" className="text-sm font-medium underline-offset-4 hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

/**
 * For admin pages. Must sit inside ProtectedGuard, so the user is already loaded.
 * Shows a 403 message instead of redirecting, so the user knows why.
 * The backend also returns 403 for non-admins, so this is only for the UI.
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (user?.role !== 'ADMIN') {
    return <Forbidden />;
  }
  return children;
}

/**
 * For login, register and forgot password. Logged-in users are sent on, to the
 * ?next= page if there is one. This is also what moves the user on after logging in.
 *
 * Uses useSearchParams(), so it must be inside a <Suspense> boundary.
 */
export function GuestGuard({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const next = useSearchParams().get('next');

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(safeRedirectPath(next));
    }
  }, [status, router, next]);

  // While loading, show the spinner instead of a login form the user might not need.
  if (status !== 'unauthenticated') {
    return <PageSpinner />;
  }
  return children;
}
