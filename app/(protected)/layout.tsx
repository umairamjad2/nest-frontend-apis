import type { ReactNode } from 'react';
import { ProtectedGuard } from '@/components/auth-guard';

// Wraps every page that needs a logged-in user: /dashboard, /profile, /admin/...
export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedGuard>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">{children}</main>
    </ProtectedGuard>
  );
}
