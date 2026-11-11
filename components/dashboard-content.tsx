'use client';

import Link from 'next/link';
import { useAuth } from '@/context/auth-context';

function Card({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
    >
      <h2 className="font-medium">{title}</h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
    </Link>
  );
}

export function DashboardContent() {
  // ProtectedGuard only renders this once the user is loaded.
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Welcome, {user.name}</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Logged in as {user.email} · <span className="font-medium">{user.role}</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card href="/tasks" title="Your tasks" description="Plan your work, set due dates and track what's done." />
        <Card href="/profile" title="Your profile" description="View your account details and change your name." />
        {user.role === 'ADMIN' && (
          <Card href="/admin/users" title="Manage users" description="See every account and delete users." />
        )}
      </div>
    </div>
  );
}
