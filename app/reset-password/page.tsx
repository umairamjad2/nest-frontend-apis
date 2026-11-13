import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuthCard } from '@/components/auth/auth-card';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export const metadata: Metadata = { title: 'Reset password' };

// The backend emails links to exactly this path: /reset-password?token=...
// Public (not in the guest group): a logged-in user may also follow a reset link.
export default function ResetPasswordPage() {
  return (
    <AuthCard title="Set a new password" description="Choose a password of 8 to 72 characters.">
      {/* The form reads ?token= from the URL, which is only known in the browser.
          Suspense lets the rest of the page prerender while the form waits for it. */}
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  );
}
