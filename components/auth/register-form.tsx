'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { register as registerUser } from '@/lib/auth-api';
import { getErrorMessage } from '@/lib/errors';
import { registerSchema, type RegisterFormValues } from '@/lib/schemas';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function RegisterForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  async function onSubmit(values: RegisterFormValues) {
    setServerError(null);
    try {
      // Send only the fields the backend expects. It rejects unknown fields,
      // so confirmPassword must not be sent.
      const { message } = await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      setSuccessMessage(message);
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  }

  // After registering, the user can't log in until they click the email link.
  if (successMessage) {
    return (
      <div className="flex flex-col gap-4">
        <Alert type="success">{successMessage}</Alert>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          The link is valid for 24 hours. After verifying, you can log in.
        </p>
        <Link
          href="/login"
          className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Go to log in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      {serverError && <Alert type="error">{serverError}</Alert>}

      <Input label="Name" autoComplete="name" error={errors.name?.message} {...register('name')} />
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Password"
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />
      <Input
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <Button type="submit" loading={isSubmitting} className="mt-2">
        Create account
      </Button>
    </form>
  );
}
