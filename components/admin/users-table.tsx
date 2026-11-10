'use client';

import { useCallback, useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { useAuth } from '@/context/auth-context';
import { getErrorMessage } from '@/lib/errors';
import { deleteUser, listUsers } from '@/lib/users-api';
import type { UserDetails } from '@/types';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PageSpinner } from '@/components/auth-guard';

export function UsersTable() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<UserDetails[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [userToDelete, setUserToDelete] = useState<UserDetails | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetches the list and returns what to store. State is set in .then() below,
  // after the request finishes, not synchronously inside the effect.
  const fetchUsers = useCallback(
    () =>
      listUsers().then(
        (data) => ({ users: data.toSorted((a, b) => a.id - b.id), error: null }),
        (error: unknown) => ({ users: null, error: getErrorMessage(error) }),
      ),
    [],
  );

  const applyResult = useCallback((result: { users: UserDetails[] | null; error: string | null }) => {
    setUsers(result.users);
    setLoadError(result.error);
  }, []);

  useEffect(() => {
    fetchUsers().then(applyResult);
  }, [fetchUsers, applyResult]);

  function retry() {
    setLoadError(null); // show the spinner again
    fetchUsers().then(applyResult);
  }

  async function confirmDelete() {
    if (!userToDelete) return;
    const target = userToDelete;
    setDeleting(true);
    try {
      await deleteUser(target.id);
      setUsers((current) => current?.filter((u) => u.id !== target.id) ?? null);
      setNotice({ type: 'success', text: `Deleted ${target.name} (${target.email}).` });
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        // Someone else deleted it first; just take it off the list.
        setUsers((current) => current?.filter((u) => u.id !== target.id) ?? null);
        setNotice({ type: 'error', text: `${target.email} had already been deleted.` });
      } else {
        setNotice({ type: 'error', text: getErrorMessage(error) });
      }
    } finally {
      setDeleting(false);
      setUserToDelete(null);
    }
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-start gap-3">
        <Alert type="error">Couldn&apos;t load users: {loadError}</Alert>
        <Button variant="secondary" onClick={retry}>
          Try again
        </Button>
      </div>
    );
  }

  if (!users) {
    return <PageSpinner />;
  }

  return (
    <div className="flex flex-col gap-4">
      {notice && <Alert type={notice.type}>{notice.text}</Alert>}

      <p className="text-sm text-zinc-500">
        {users.length} {users.length === 1 ? 'user' : 'users'}
      </p>

      {/* Scrolls sideways on narrow screens instead of squashing the columns. */}
      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">ID</th>
              <th scope="col" className="px-4 py-3 font-medium">Name</th>
              <th scope="col" className="px-4 py-3 font-medium">Email</th>
              <th scope="col" className="px-4 py-3 font-medium">Joined</th>
              <th scope="col" className="px-4 py-3 font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {users.map((u) => {
              const isMe = u.id === currentUser?.id;
              return (
                <tr key={u.id}>
                  <td className="px-4 py-3 tabular-nums text-zinc-500">{u.id}</td>
                  <td className="px-4 py-3 font-medium">
                    {u.name}
                    {isMe && <span className="ml-2 text-xs font-normal text-zinc-500">(you)</span>}
                  </td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3 text-zinc-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    {/* The backend would allow it, but deleting your own account here
                        would lock you out mid-session, so it's disabled. */}
                    <Button
                      variant="secondary"
                      className="h-8 px-3 text-red-600 dark:text-red-400"
                      disabled={isMe}
                      title={isMe ? "You can't delete your own account" : undefined}
                      onClick={() => {
                        setNotice(null);
                        setUserToDelete(u);
                      }}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={userToDelete !== null}
        title="Delete this user?"
        confirmLabel="Delete user"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setUserToDelete(null)}
      >
        {userToDelete && (
          <>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {userToDelete.name} ({userToDelete.email})
            </span>{' '}
            will be removed permanently. This can&apos;t be undone.
          </>
        )}
      </ConfirmDialog>
    </div>
  );
}
