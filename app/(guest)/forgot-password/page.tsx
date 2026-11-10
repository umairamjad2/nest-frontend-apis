import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/auth-card';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export const metadata: Metadata = { title: 'Forgot password · NestJS Auth' };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot password"
      description="Enter your email and we'll send you a link to set a new password."
      footer={
        <>
          Remembered it?{' '}
          <Link href="/login" className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100">
            Log in
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
