import type { ReactNode } from 'react';
import { AdminGuard } from '@/components/auth-guard';

// Every page under /admin. The (protected) layout above has already made sure
// someone is logged in; this adds the ADMIN role check.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>;
}
