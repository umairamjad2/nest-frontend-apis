'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/auth-context';
import { getErrorMessage } from '@/lib/errors';
import { deleteAccountSchema, type DeleteAccountFormValues } from '@/lib/schemas';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PasswordInput } from '@/components/ui/password-input';

export function DeleteAccount() {
  const { deleteAccount } = useAuth();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DeleteAccountFormValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: { password: '' },
  });

  async function onSubmit({ password }: DeleteAccountFormValues) {
    setServerError(null);
    try {
      await deleteAccount(password);
      // Full page load: starts the app fresh, logged out, on the home page.
      window.location.replace('/');
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  }

  function close() {
    setOpen(false);
    setServerError(null);
    reset();
  }

  const submit = handleSubmit(onSubmit);

  return (
    <>
      <Button variant="danger" className="mt-4" onClick={() => setOpen(true)}>
        Delete account
      </Button>

      <ConfirmDialog
        open={open}
        title="Delete your account?"
        confirmLabel="Delete forever"
        loading={isSubmitting}
        onConfirm={submit}
        onCancel={close}
      >
        <p>This deletes your account and all of your tasks. It can&apos;t be undone.</p>
        {/* A form, so pressing Enter in the field submits too */}
        <form onSubmit={submit} noValidate className="mt-4 flex flex-col gap-3 text-zinc-900 dark:text-zinc-100">
          {serverError && <Alert type="error">{serverError}</Alert>}
          <PasswordInput
            label="Enter your password to confirm"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
        </form>
      </ConfirmDialog>
    </>
  );
}
