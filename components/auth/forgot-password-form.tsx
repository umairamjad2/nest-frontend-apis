'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPassword } from '@/lib/auth-api';
import { getErrorMessage } from '@/lib/errors';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/lib/schemas';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ForgotPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setServerError(null);
    try {
      // The backend sends the same message whether or not the email exists,
      // so nobody can use this form to find out who has an account.
      const { message } = await forgotPassword(values.email);
      setSuccessMessage(message);
    } catch (error) {
      // Limited to 3 requests per minute; getErrorMessage explains a 429.
      setServerError(getErrorMessage(error));
    }
  }

  if (successMessage) {
    return (
      <div className="flex flex-col gap-4">
        <Alert type="success">{successMessage}</Alert>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          The link is valid for 15 minutes. Check your spam folder if it doesn&apos;t arrive.
        </p>
        <Link href="/login" className="text-center text-sm font-medium underline-offset-4 hover:underline">
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {serverError && <Alert type="error">{serverError}</Alert>}

      <Input
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <Button type="submit" loading={isSubmitting} className="mt-2">
        Send reset link
      </Button>
    </form>
  );
}
