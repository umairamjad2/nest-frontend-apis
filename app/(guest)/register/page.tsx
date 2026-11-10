import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/auth-card';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = { title: 'Register · NestJS Auth' };

// Shown only after the browser confirms nobody is logged in (GuestGuard), so it
// can't be rendered ahead of time. Opt out of instant-navigation validation.
export const instant = false;

// A server component (so it can export metadata) that renders the client-side form.
export default function RegisterPage() {
  return (
    <AuthCard
      title="Create an account"
      description="We'll email you a link to verify your address."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100">
            Log in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
