'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getErrorMessage } from '@/lib/errors';
import { homeContent } from '@/content/home';
import { useToast } from '@/components/ui/toast';

interface DemoButtonProps {
  className?: string;
  /** Where to go once the demo has started. Guest pages redirect on their own, so they pass null. */
  redirectTo?: string | null;
}

/** "Try the demo": logs in to a fresh demo account with sample tasks. */
export function DemoButton({ className = '', redirectTo = '/dashboard' }: DemoButtonProps) {
  const { loginDemo } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [starting, setStarting] = useState(false);

  async function start() {
    setStarting(true);
    try {
      await loginDemo();
      toast.success('Welcome! This demo account has sample tasks to play with.');
      if (redirectTo) router.push(redirectTo);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setStarting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={start}
      disabled={starting}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-colors disabled:cursor-wait disabled:opacity-70 ${className}`}
    >
      {starting ? (
        <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden>
          <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
        </svg>
      )}
      {starting ? 'Starting demo…' : homeContent.actions.guest.demo.label}
    </button>
  );
}
