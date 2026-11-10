'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/auth-context';
import { getErrorMessage } from '@/lib/errors';
import { profileSchema, type ProfileFormValues } from '@/lib/schemas';
import { getUser, updateUser } from '@/lib/users-api';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-zinc-500">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}

export function ProfileForm() {
  const { user, reloadUser } = useAuth();
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '' },
  });

  // The auth context has no creation date, so fetch the full record once.
  const userId = user?.id;
  useEffect(() => {
    if (!userId) return;
    getUser(userId)
      .then((details) => setCreatedAt(details.createdAt))
      .catch(() => setCreatedAt(null));
  }, [userId]);

  if (!user) return null;

  async function onSubmit(values: ProfileFormValues) {
    if (!user) return;
    setServerError(null);
    setSaved(false);
    try {
      // Only `name`: the backend rejects role, email and password here.
      const updated = await updateUser(user.id, { name: values.name });
      // Update the navbar and dashboard, and make the new name the form's saved value.
      await reloadUser();
      reset({ name: updated.name });
      setSaved(true);
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <dl className="grid gap-4 sm:grid-cols-3">
          <Detail label="Email" value={user.email} />
          <Detail label="Role" value={user.role} />
          <Detail label="Member since" value={createdAt ? new Date(createdAt).toLocaleDateString() : '…'} />
        </dl>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="font-medium">Change your name</h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-4 flex flex-col gap-4">
          {serverError && <Alert type="error">{serverError}</Alert>}
          {saved && <Alert type="success">Your name has been updated.</Alert>}

          <Input label="Name" autoComplete="name" error={errors.name?.message} {...register('name')} />

          <Button type="submit" loading={isSubmitting} disabled={!isDirty} className="self-start">
            Save
          </Button>
        </form>
        <p className="mt-4 text-sm text-zinc-500">
          Email and password can&apos;t be changed here. To change your password, log out and use “Forgot password?”.
        </p>
      </section>
    </div>
  );
}
