'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { getTaskStats, listTasks } from '@/lib/tasks-api';
import { PRIORITY_LABELS, describeDue } from '@/lib/tasks';
import type { Task, TaskStats } from '@/types';
import { Alert } from '@/components/ui/alert';
import { EmptyState } from '@/components/ui/empty-state';

type Data = { stats: TaskStats; upcoming: Task[] };

/** The next few unfinished tasks with a due date, soonest (and overdue) first. */
async function loadDashboard(): Promise<Data> {
  const query = { sortBy: 'dueDate', order: 'asc', limit: 5 } as const;
  const [stats, todo, inProgress] = await Promise.all([
    getTaskStats(),
    listTasks({ ...query, status: 'TODO' }),
    listTasks({ ...query, status: 'IN_PROGRESS' }),
  ]);
  const upcoming = [...todo.items, ...inProgress.items]
    .filter((t) => t.dueDate)
    .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!))
    .slice(0, 5);
  return { stats, upcoming };
}

function greeting(now = new Date()) {
  const hour = now.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const card = 'rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950';

export function DashboardContent() {
  // ProtectedGuard only renders this once the user is loaded.
  const { user } = useAuth();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadDashboard().then(
      (d) => !cancelled && setData(d),
      () => !cancelled && setError("Couldn't load your task stats. Refresh the page to try again."),
    );
    return () => {
      cancelled = true;
    };
  }, []);

  if (!user) return null;
  const firstName = user.name.split(' ')[0];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {greeting()}, <span className="text-brand-gradient">{firstName}</span>
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">Here&apos;s how your work is going.</p>
        </div>
        <Link
          href="/tasks"
          className="inline-flex h-10 items-center rounded-md bg-brand px-4 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-hover"
        >
          Open tasks
        </Link>
      </div>

      {error ? (
        <Alert type="error">{error}</Alert>
      ) : !data ? (
        <DashboardSkeleton />
      ) : data.stats.total === 0 ? (
        <EmptyState
          icon="tasks"
          title="Your dashboard is empty"
          description="Create a few tasks and your progress, stats and upcoming deadlines will show up here."
          action={
            <Link
              href="/tasks"
              className="inline-flex h-10 items-center rounded-md bg-brand px-4 text-sm font-semibold text-brand-foreground hover:bg-brand-hover"
            >
              Create your first task
            </Link>
          }
        />
      ) : (
        <>
          <StatTiles stats={data.stats} />
          <div className="grid gap-4 lg:grid-cols-5">
            <ProgressCard stats={data.stats} />
            <UpcomingCard tasks={data.upcoming} />
          </div>
        </>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <LinkCard href="/profile" title="Your profile" description="View your account details and change your name." />
        {user.role === 'ADMIN' && (
          <LinkCard href="/admin/users" title="Manage users" description="See every account and delete users." />
        )}
      </div>
    </div>
  );
}

// --- Stat tiles ----------------------------------------------------------------

function StatTiles({ stats }: { stats: TaskStats }) {
  const tiles: { label: string; value: number; hint: string; alert?: boolean }[] = [
    { label: 'Total tasks', value: stats.total, hint: `${stats.todo} still to do` },
    { label: 'In progress', value: stats.inProgress, hint: 'Being worked on' },
    { label: 'Completed', value: stats.done, hint: `${percent(stats.done, stats.total)}% of all tasks` },
    {
      label: 'Overdue',
      value: stats.overdue,
      hint: stats.overdue ? 'Past their due date' : 'Nothing late. Nice!',
      alert: stats.overdue > 0,
    },
  ];

  return (
    <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className={`${card} p-5 ${tile.alert ? 'border-red-200 bg-red-50/60 dark:border-red-900/60 dark:bg-red-950/20' : ''}`}
        >
          <dt className="flex items-center gap-1.5 text-sm text-zinc-500">
            {tile.alert && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" className="size-4 text-red-600 dark:text-red-400" aria-hidden>
                <path d="M12 8v5M12 16.5h.01M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z" />
              </svg>
            )}
            {tile.label}
          </dt>
          <dd className="mt-2 font-display text-3xl font-bold tabular-nums tracking-tight">{tile.value}</dd>
          <dd className="mt-1 text-xs text-zinc-500">{tile.hint}</dd>
        </div>
      ))}
    </dl>
  );
}

// --- Progress: one segmented bar of tasks by status ------------------------------

function percent(part: number, total: number) {
  return total ? Math.round((part / total) * 100) : 0;
}

function ProgressCard({ stats }: { stats: TaskStats }) {
  const [active, setActive] = useState<string | null>(null);
  const segments = [
    { key: 'todo', label: 'To do', value: stats.todo, color: 'bg-chart-todo' },
    { key: 'progress', label: 'In progress', value: stats.inProgress, color: 'bg-chart-progress' },
    { key: 'done', label: 'Done', value: stats.done, color: 'bg-chart-done' },
  ];
  const done = percent(stats.done, stats.total);

  return (
    <section className={`${card} p-6 lg:col-span-3`}>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-semibold">Progress</h2>
        <span className="text-sm text-zinc-500">{stats.total} tasks</span>
      </div>
      <p className="mt-4">
        <span className="font-display text-5xl font-bold tabular-nums tracking-tight">{done}%</span>
        <span className="ml-2 text-sm text-zinc-500">complete</span>
      </p>

      {/* Segments get a 2px gap so neighbouring colours never touch */}
      <div
        className="relative mt-6 flex h-3 gap-0.5"
        role="img"
        aria-label={segments.map((s) => `${s.label}: ${s.value}`).join(', ')}
        onMouseLeave={() => setActive(null)}
      >
        {segments
          .filter((s) => s.value > 0)
          .map((s) => (
            <div
              key={s.key}
              onMouseEnter={() => setActive(s.key)}
              style={{ flexGrow: s.value }}
              className={`relative h-full min-w-1.5 basis-0 rounded first:rounded-l-full last:rounded-r-full ${s.color} transition-opacity ${
                active && active !== s.key ? 'opacity-40' : ''
              }`}
            >
              {active === s.key && (
                <span className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900 px-2 py-1 text-xs font-medium text-white shadow dark:bg-zinc-100 dark:text-zinc-900">
                  {s.label}: {s.value} ({percent(s.value, stats.total)}%)
                </span>
              )}
            </div>
          ))}
      </div>

      {/* Legend doubles as the data table: label, count and share for every status */}
      <ul className="mt-5 grid grid-cols-3 gap-3">
        {segments.map((s) => (
          <li
            key={s.key}
            onMouseEnter={() => s.value > 0 && setActive(s.key)}
            onMouseLeave={() => setActive(null)}
            className="flex flex-col gap-0.5"
          >
            <span className="flex items-center gap-1.5 text-xs text-zinc-500">
              <span aria-hidden className={`size-2.5 rounded-sm ${s.color}`} />
              {s.label}
            </span>
            <span className="text-sm font-semibold tabular-nums">
              {s.value} <span className="font-normal text-zinc-500">· {percent(s.value, stats.total)}%</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// --- Upcoming deadlines ------------------------------------------------------------

const dueTone = {
  overdue: 'text-red-600 dark:text-red-400 font-medium',
  soon: 'text-brand-text font-medium',
  normal: 'text-zinc-500',
  done: 'text-zinc-400',
};

const priorityDot = { HIGH: 'bg-red-500', MEDIUM: 'bg-amber-400', LOW: 'bg-zinc-400' };

function UpcomingCard({ tasks }: { tasks: Task[] }) {
  return (
    <section className={`${card} flex flex-col p-6 lg:col-span-2`}>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-semibold">Upcoming deadlines</h2>
        <Link href="/tasks" className="text-sm font-medium text-brand-text hover:underline">
          View all
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="mt-4 flex-1">
          <EmptyState
            compact
            icon="calendar"
            title="No deadlines coming up"
            description="Give a task a due date to see it here."
          />
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800/70">
          {tasks.map((task) => {
            const due = describeDue(task);
            return (
              <li key={task.id} className="flex items-center gap-3 py-2.5">
                <span
                  className={`size-2 shrink-0 rounded-full ${priorityDot[task.priority]}`}
                  title={`${PRIORITY_LABELS[task.priority]} priority`}
                />
                <span className="sr-only">{PRIORITY_LABELS[task.priority]} priority:</span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{task.title}</span>
                {due && <span className={`shrink-0 text-xs ${dueTone[due.tone]}`}>{due.text}</span>}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

// --- Loading skeleton and links --------------------------------------------------

function Shimmer({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-md bg-zinc-200/80 dark:bg-zinc-800/80 ${className}`} />;
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy aria-label="Loading your stats">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`${card} p-5`}>
            <Shimmer className="h-4 w-20" />
            <Shimmer className="mt-3 h-8 w-12" />
            <Shimmer className="mt-2 h-3 w-24" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <div className={`${card} p-6 lg:col-span-3`}>
          <Shimmer className="h-4 w-24" />
          <Shimmer className="mt-5 h-12 w-28" />
          <Shimmer className="mt-6 h-3 w-full" />
        </div>
        <div className={`${card} p-6 lg:col-span-2`}>
          <Shimmer className="h-4 w-36" />
          {[0, 1, 2].map((i) => (
            <Shimmer key={i} className="mt-4 h-4 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

function LinkCard({ href, title, description }: { href: string; title: string; description: ReactNode }) {
  return (
    <Link href={href} className={`${card} p-5 transition-colors hover:border-brand-line`}>
      <h2 className="font-medium">{title}</h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
    </Link>
  );
}
