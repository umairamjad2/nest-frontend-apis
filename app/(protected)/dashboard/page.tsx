import type { Metadata } from 'next';
import { DashboardContent } from '@/components/dashboard-content';

export const metadata: Metadata = { title: 'Dashboard' };

// Shown only after the browser restores the session (ProtectedGuard), so it
// can't be rendered ahead of time. Opt out of instant-navigation validation.
export const instant = false;

export default function DashboardPage() {
  return <DashboardContent />;
}
