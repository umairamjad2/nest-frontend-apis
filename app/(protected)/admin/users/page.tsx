import type { Metadata } from 'next';
import { UsersTable } from '@/components/admin/users-table';

export const metadata: Metadata = { title: 'Users' };

// Shown only after the browser restores the session and confirms the ADMIN role,
// so it can't be rendered ahead of time. Opt out of instant-navigation validation.
export const instant = false;

export default function AdminUsersPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Users</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">Every registered account.</p>
      </div>
      <UsersTable />
    </div>
  );
}
