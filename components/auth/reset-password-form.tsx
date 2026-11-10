'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/auth-context';
import { resetPassword } from '@/lib/auth-api';
import { getErrorMessage } from '@/lib/errors';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/schemas';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const linkButtonClass =
  'inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300';

/**
 * Reads ?token= from the link in the reset email.
 * useSearchParams() must be inside a <Suspense> boundary (see the page).
 */
export function ResetPasswordForm() {
  const token = useSearchParams().get('token');
  const { status, logout } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  if (!token) {
    return (
      <div className="flex flex-col gap-4">
        <Alert type="error">This reset link is missing its token. Use the link from the email exactly as sent.</Alert>
        <Link href="/forgot-password" className={linkButtonClass}>
          Request a new link
        </Link>
      </div>
    );
  }

  async function onSubmit(values: ResetPasswordFormValues) {
    if (!token) return;
    setServerError(null);
    try {
      // Only resetToken and newPassword: the backend rejects unknown fields.
      const { message } = await resetPassword({ resetToken: token, newPassword: values.newPassword });
      setSuccessMessage(message);

      // A reset ends all of the user's sessions on the backend. If they were logged in
      // in this browser, clear that stale session here too.
      if (status === 'authenticated') {
        await logout().catch(() => {});
      }
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  }

  if (successMessage) {
    return (
      <div className="flex flex-col gap-4">
        <Alert type="success">{successMessage}</Alert>
        <Link href="/login" className={linkButtonClass}>
          Log in with your new password
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {serverError && (
        <Alert type="error">
          {serverError}{' '}
          <Link href="/forgot-password" className="font-medium underline">
            Request a new link
          </Link>
        </Alert>
      )}

      <Input
        label="New password"
        type="password"
        autoComplete="new-password"
        error={errors.newPassword?.message}
        {...register('newPassword')}
      />
      <Input
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <Button type="submit" loading={isSubmitting} className="mt-2">
        Set new password
      </Button>
    </form>
  );
}
