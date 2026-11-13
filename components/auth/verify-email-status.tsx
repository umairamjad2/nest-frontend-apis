'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { verifyEmail } from '@/lib/auth-api';
import { getErrorMessage } from '@/lib/errors';
import { Alert } from '@/components/ui/alert';

const linkButtonClass =
  'inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300';

type Result = { type: 'success' | 'error'; message: string };

/**
 * Reads ?token= from the link in the verification email and verifies it once.
 * useSearchParams() must be inside a <Suspense> boundary (see the page).
 */
export function VerifyEmailStatus() {
  const token = useSearchParams().get('token');
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    verifyEmail(token)
      .then(({ message }) => !cancelled && setResult({ type: 'success', message }))
      .catch((error) => !cancelled && setResult({ type: 'error', message: getErrorMessage(error) }));
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!token) {
    return (
      <Alert type="error">This verification link is missing its token. Use the link from the email exactly as sent.</Alert>
    );
  }

  if (!result) {
    return <p className="text-sm text-zinc-500">Verifying your email…</p>;
  }

  if (result.type === 'error') {
    return (
      <div className="flex flex-col gap-4">
        <Alert type="error">{result.message}</Alert>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          If you already verified your email, you can log in. Otherwise the link may have expired (links last 24
          hours).
        </p>
        <Link href="/login" className={linkButtonClass}>
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Alert type="success">{result.message}</Alert>
      <Link href="/login" className={linkButtonClass}>
        Log in
      </Link>
    </div>
  );
}
