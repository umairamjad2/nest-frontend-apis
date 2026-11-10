'use client';

import { useAuth } from '@/context/auth-context';

/** Shows what AuthProvider knows. Handy for checking the session works. */
export function AuthStatus() {
  const { status, user } = useAuth();

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p>
        <span className="font-medium">Session:</span>{' '}
        <span data-testid="auth-status">{status}</span>
      </p>
      {user && (
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          {user.name} ({user.email}) · {user.role}
        </p>
      )}
    </div>
  );
}
