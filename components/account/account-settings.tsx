'use client';

import { useState, type ReactNode } from 'react';
import { useAuth } from '@/context/auth-context';
import { isDemoUser } from '@/lib/demo';
import { ChangePasswordForm } from './change-password-form';
import { DeleteAccount } from './delete-account';
import { SessionsList } from './sessions-list';

function Section({
  title,
  description,
  danger = false,
  children,
}: {
  title: string;
  description: string;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={`rounded-xl border bg-white p-6 dark:bg-zinc-950 ${
        danger ? 'border-red-300 dark:border-red-900' : 'border-zinc-200 dark:border-zinc-800'
      }`}
    >
      <h2 className={`font-medium ${danger ? 'text-red-700 dark:text-red-400' : ''}`}>{title}</h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
      {children}
    </section>
  );
}

/** Password, logged-in devices and account deletion, below the profile form. */
export function AccountSettings() {
  const { user } = useAuth();
  // Bumped after a password change, which signs out the other devices
  const [sessionsVersion, setSessionsVersion] = useState(0);
  const demo = isDemoUser(user);

  return (
    <>
      <Section
        title="Change password"
        description={
          demo
            ? "Demo accounts don't have a password you can change."
            : 'Other devices will be signed out. You stay logged in here.'
        }
      >
        {!demo && <ChangePasswordForm onChanged={() => setSessionsVersion((v) => v + 1)} />}
      </Section>

      <Section
        title="Logged-in devices"
        description="Everywhere your account is logged in. Sign out any device you don't recognise."
      >
        <SessionsList reloadKey={sessionsVersion} />
      </Section>

      <Section
        title="Delete account"
        danger
        description={
          demo
            ? 'Demo accounts are deleted automatically 24 hours after they were created.'
            : 'Permanently delete your account and all of your tasks.'
        }
      >
        {!demo && <DeleteAccount />}
      </Section>
    </>
  );
}
