'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePassword } from '@/lib/auth-api';
import { getErrorMessage } from '@/lib/errors';
import { changePasswordSchema, type ChangePasswordFormValues } from '@/lib/schemas';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { useToast } from '@/components/ui/toast';

const EMPTY: ChangePasswordFormValues = { currentPassword: '', newPassword: '', confirmPassword: '' };

/** Changing the password signs out every other device, so `onChanged` lets the devices list reload. */
export function ChangePasswordForm({ onChanged }: { onChanged?: () => void }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: EMPTY,
  });

  async function onSubmit({ currentPassword, newPassword }: ChangePasswordFormValues) {
    setServerError(null);
    try {
      await changePassword({ currentPassword, newPassword });
      reset(EMPTY);
      toast.success('Password changed. Your other devices have been signed out.');
      onChanged?.();
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-4 flex flex-col gap-4">
      {serverError && <Alert type="error">{serverError}</Alert>}

      <PasswordInput
        label="Current password"
        autoComplete="current-password"
        error={errors.currentPassword?.message}
        {...register('currentPassword')}
      />
      <PasswordInput
        label="New password"
        autoComplete="new-password"
        error={errors.newPassword?.message}
        {...register('newPassword')}
      />
      <PasswordInput
        label="Confirm new password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <Button type="submit" loading={isSubmitting} className="self-start">
        Change password
      </Button>
    </form>
  );
}
