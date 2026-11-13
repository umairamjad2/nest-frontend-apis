import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuthCard } from '@/components/auth/auth-card';
import { VerifyEmailStatus } from '@/components/auth/verify-email-status';

export const metadata: Metadata = { title: 'Verify email' };

// The backend emails links to exactly this path: /verify-email?token=...
// Public (not in the guest group), like /reset-password.
export default function VerifyEmailPage() {
  return (
    <AuthCard title="Verify your email" description="Confirming the link from your email.">
      {/* The status reads ?token= from the URL, which is only known in the browser. */}
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
        <VerifyEmailStatus />
      </Suspense>
    </AuthCard>
  );
}
