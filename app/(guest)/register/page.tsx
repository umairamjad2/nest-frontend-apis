import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/auth-card';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = { title: 'Register · NestJS Auth' };

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
