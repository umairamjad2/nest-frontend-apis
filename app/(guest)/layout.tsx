import { Suspense, type ReactNode } from 'react';
import { GuestGuard, PageSpinner } from '@/components/auth-guard';

// Wraps /login, /register and /forgot-password.
// GuestGuard reads ?next= from the URL, so it needs a Suspense boundary.
export default function GuestLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<PageSpinner />}>
      <GuestGuard>{children}</GuestGuard>
    </Suspense>
  );
}
