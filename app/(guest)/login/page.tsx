import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/auth-card';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = { title: 'Log in' };

// Shown only after the browser confirms nobody is logged in (GuestGuard), so it
// can't be rendered ahead of time. Opt out of instant-navigation validation.
export const instant = false;

export default function LoginPage() {
  return (
    <AuthCard
      title="Log in"
      description="Welcome back."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100">
            Register
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthCard>
  );
}
