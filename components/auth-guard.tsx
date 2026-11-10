'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

/** Shown while the session is restoring, or just before a redirect. */
export function PageSpinner() {
  return (
    <div className="flex flex-1 items-center justify-center py-24" role="status" aria-label="Loading">
      <span className="size-6 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
    </div>
  );
}

/**
 * Only allows a redirect back to a page on this site. Without this check,
 * /login?next=https://evil.example would send users to another site after login.
 */
export function safeRedirectPath(path: string | null): string {
  if (path && path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/\\')) {
    return path;
  }
  return '/dashboard';
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
