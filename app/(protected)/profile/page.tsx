import type { Metadata } from 'next';
import { ProfileForm } from '@/components/profile-form';

export const metadata: Metadata = { title: 'Profile · NestJS Auth' };

// This page is only shown once the browser has restored the session (ProtectedGuard),
// so Next.js can't render it ahead of time. Opt out of instant-navigation validation.
export const instant = false;

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">Your account details.</p>
      </div>
      <ProfileForm />
    </div>
  );
}
