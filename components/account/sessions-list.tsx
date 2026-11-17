'use client';

import { useEffect, useState } from 'react';
import { listSessions, revokeOtherSessions, revokeSession } from '@/lib/auth-api';
import { getErrorMessage } from '@/lib/errors';
import { describeUserAgent } from '@/lib/user-agent';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/components/ui/toast';
import type { SessionInfo } from '@/types';

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

/**
 * The user's logged-in devices, with a sign-out button for each one except this browser.
 * Change `reloadKey` to fetch the list again (e.g. after a password change).
 */
export function SessionsList({ reloadKey = 0 }: { reloadKey?: number }) {
  const [sessions, setSessions] = useState<SessionInfo[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [confirmAll, setConfirmAll] = useState(false);
  const [revokingAll, setRevokingAll] = useState(false);
  const toast = useToast();

  useEffect(() => {
    let cancelled = false; // ignore a slow answer that arrives after a newer request
    listSessions()
      .then((list) => {
        if (cancelled) return;
        setSessions(list);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(getErrorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  async function signOut(id: string) {
    setRevokingId(id);
    try {
      await revokeSession(id);
      setSessions((current) => current?.filter((s) => s.id !== id) ?? null);
      toast.success('Device signed out.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRevokingId(null);
    }
  }

  async function signOutOthers() {
    setRevokingAll(true);
    try {
      const { message } = await revokeOtherSessions();
      setSessions((current) => current?.filter((s) => s.current) ?? null);
      toast.success(`${message}.`);
      setConfirmAll(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setRevokingAll(false);
    }
  }

  if (error) return <Alert type="error">{error}</Alert>;

  if (!sessions) {
    return (
      <ul className="mt-4 flex flex-col gap-3" aria-label="Loading devices">
        {[0, 1].map((i) => (
          <li key={i} className="h-14 animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-900" />
        ))}
      </ul>
    );
  }

  const others = sessions.filter((s) => !s.current).length;

  return (
    <>
      <ul className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
        {sessions.map((session) => (
          <li key={session.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 font-medium">
                {describeUserAgent(session.userAgent)}
                {session.current && (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-950 dark:text-green-300">
                    This device
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-sm text-zinc-500">
                Last active {dateFormat.format(new Date(session.lastUsedAt))}
                {session.ipAddress && <> · {session.ipAddress}</>}
              </p>
            </div>

            {!session.current && (
              <Button
                variant="secondary"
                loading={revokingId === session.id}
                disabled={revokingAll}
                onClick={() => signOut(session.id)}
                aria-label={`Sign out ${describeUserAgent(session.userAgent)}`}
              >
                Sign out
              </Button>
            )}
          </li>
        ))}
      </ul>

      {others > 0 && (
        <Button variant="secondary" className="mt-4" onClick={() => setConfirmAll(true)}>
          Sign out all other devices
        </Button>
      )}

      <ConfirmDialog
        open={confirmAll}
        title="Sign out other devices?"
        confirmLabel="Sign out"
        loading={revokingAll}
        onConfirm={signOutOthers}
        onCancel={() => setConfirmAll(false)}
      >
        {others === 1 ? '1 other device' : `${others} other devices`} will need to log in again. You&apos;ll
        stay logged in here.
      </ConfirmDialog>
    </>
  );
}
