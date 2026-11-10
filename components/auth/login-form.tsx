'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/auth-context';
import { getErrorMessage } from '@/lib/errors';
import { loginSchema, type LoginFormValues } from '@/lib/schemas';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function LoginForm() {
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    try {
      // No redirect here: once logged in, GuestGuard (app/(guest)/layout.tsx)
      // sends the user to ?next= or /dashboard.
      await login(values);
    } catch (error) {
      // The backend's 401 message says whether the password was wrong
      // or the email isn't verified yet, so show it as it is.
      setServerError(getErrorMessage(error));
    }
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
      <div className="flex flex-col gap-1.5">
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Link
          href="/forgot-password"
          className="self-end text-sm text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
        >
          Forgot password?
        </Link>
      </div>

      <Button type="submit" loading={isSubmitting} className="mt-2">
        Log in
      </Button>
    </form>
  );
}
