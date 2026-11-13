'use client';

import { useEffect, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import { getErrorMessage } from '@/lib/errors';
import { deleteTask, getTaskStats, listTasks, updateTask } from '@/lib/tasks-api';
import { PRIORITY_LABELS } from '@/lib/tasks';
import type {
  Task,
  TaskListResponse,
  TaskPriority,
  TaskQuery,
  TaskSortField,
  TaskStats,
  TaskStatus,
} from '@/types';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { PageSpinner } from '@/components/auth-guard';
import { TaskFormDialog } from './task-form-dialog';
import { TaskItem } from './task-item';

const PAGE_SIZE = 10;

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'dueDate:asc', label: 'Due date' },
  { value: 'priority:desc', label: 'Priority' },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]['value'];
type StatusFilter = 'ALL' | TaskStatus;

const STATUS_TABS: { value: StatusFilter; label: string; count: (s: TaskStats) => number }[] = [
  { value: 'ALL', label: 'All', count: (s) => s.total },
  { value: 'TODO', label: 'To do', count: (s) => s.todo },
  { value: 'IN_PROGRESS', label: 'In progress', count: (s) => s.inProgress },
  { value: 'DONE', label: 'Done', count: (s) => s.done },
];

type Notice = { type: 'success' | 'error'; text: string };

/** The result of one list request, tagged with the query it answers. */
type ListResult = { key: string; data: TaskListResponse | null; error: string | null };

export function TasksBoard() {
  // Filters
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [priority, setPriority] = useState<'ALL' | TaskPriority>('ALL');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState(''); // searchInput, 300 ms after the user stops typing
  const [sort, setSort] = useState<SortValue>('createdAt:desc');
  const [page, setPage] = useState(1);
  // Bumped after every change, to fetch the list and the counts again
  const [reloadKey, setReloadKey] = useState(0);

  // Data
  const [result, setResult] = useState<ListResult | null>(null);
  const [stats, setStats] = useState<TaskStats | null>(null);

  // Actions
  const [notice, setNotice] = useState<Notice | null>(null);
  const [editing, setEditing] = useState<Task | 'new' | null>(null);
  const [toDelete, setToDelete] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const query = useMemo<TaskQuery>(() => {
    const [sortBy, order] = sort.split(':') as [TaskSortField, 'asc' | 'desc'];
    return {
      status: status === 'ALL' ? undefined : status,
      priority: priority === 'ALL' ? undefined : priority,
      search: search || undefined,
      sortBy,
      order,
      page,
      limit: PAGE_SIZE,
    };
  }, [status, priority, search, sort, page]);

  const queryKey = `${JSON.stringify(query)}#${reloadKey}`;

  // Fetch the list whenever the query changes. Results for an older query are
  // dropped, so a slow response can't overwrite a newer one.
  useEffect(() => {
    let cancelled = false;
    listTasks(query).then(
      (data) => {
        if (cancelled) return;
        // The last task on the last page was deleted: go back a page.
        if (data.total > 0 && data.page > data.totalPages) {
          setPage(data.totalPages);
          return;
        }
        setResult({ key: queryKey, data, error: null });
      },
      (error: unknown) => {
        if (!cancelled) setResult({ key: queryKey, data: null, error: getErrorMessage(error) });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [query, queryKey]);

  useEffect(() => {
    let cancelled = false;
    getTaskStats().then(
      (data) => {
        if (!cancelled) setStats(data);
      },
      () => {
        // The counts are extra; the list shows its own error if the API is down.
      },
    );
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // Debounce the search box
  useEffect(() => {
    const next = searchInput.trim();
    if (next === search) return;
    const id = setTimeout(() => {
      setSearch(next);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput, search]);

  // Success messages fade after a few seconds; errors stay until the next action
  useEffect(() => {
    if (notice?.type !== 'success') return;
    const id = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(id);
  }, [notice]);

  const reload = () => setReloadKey((k) => k + 1);
  const loading = result?.key !== queryKey;
  const data = result?.data ?? null;
  const hasFilters = status !== 'ALL' || priority !== 'ALL' || search !== '';

  function clearFilters() {
    setStatus('ALL');
    setPriority('ALL');
    setSearchInput('');
    setSearch('');
    setPage(1);
  }

  async function toggleDone(task: Task) {
    const nextStatus: TaskStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    setNotice(null);
    setTogglingId(task.id);
    // Show the change straight away; the reload below brings the real state.
    setResult((r) =>
      r?.data
        ? { ...r, data: { ...r.data, items: r.data.items.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)) } }
        : r,
    );
    try {
      await updateTask(task.id, { status: nextStatus });
    } catch (error) {
      setNotice({ type: 'error', text: getErrorMessage(error) });
    } finally {
      setTogglingId(null);
      reload();
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    const target = toDelete;
    setDeleting(true);
    try {
      await deleteTask(target.id);
      setNotice({ type: 'success', text: `Deleted "${target.title}".` });
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        setNotice({ type: 'error', text: 'That task had already been deleted.' });
      } else {
        setNotice({ type: 'error', text: getErrorMessage(error) });
      }
    } finally {
      setDeleting(false);
      setToDelete(null);
      reload();
    }
  }

  function handleSaved(task: Task, mode: 'created' | 'updated') {
    setEditing(null);
    setNotice({ type: 'success', text: mode === 'created' ? `Created "${task.title}".` : 'Changes saved.' });
    if (mode === 'created') setPage(1);
    reload();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Tasks</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Only you can see your tasks.
            {stats && stats.overdue > 0 && (
              <span className="ml-1 font-medium text-red-600 dark:text-red-400">{stats.overdue} overdue.</span>
            )}
          </p>
        </div>
        <Button
          onClick={() => {
            setNotice(null);
            setEditing('new');
          }}
        >
          New task
        </Button>
      </div>

      {/* Status tabs with counts */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        {STATUS_TABS.map((tab) => {
          const active = status === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setStatus(tab.value);
                setPage(1);
              }}
              className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-sm transition-colors ${
                active
                  ? 'border-brand bg-brand text-brand-foreground'
                  : 'border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800'
              }`}
            >
              {tab.label}
              {stats && <span className="tabular-nums opacity-70">{tab.count(stats)}</span>}
            </button>
          );
        })}
      </div>

      {/* Search, priority and sort */}
      <div className="grid gap-4 sm:grid-cols-[1fr_10rem_10rem]">
        <Input
          label="Search"
          name="task-search"
          type="search"
          placeholder="Title or description"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Select
          label="Priority"
          name="task-priority"
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value as 'ALL' | TaskPriority);
            setPage(1);
          }}
        >
          <option value="ALL">Any</option>
          {(Object.keys(PRIORITY_LABELS) as TaskPriority[]).map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </Select>
        <Select
          label="Sort by"
          name="task-sort"
          value={sort}
          onChange={(e) => {
            setSort(e.target.value as SortValue);
            setPage(1);
          }}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>

      {notice && <Alert type={notice.type}>{notice.text}</Alert>}

      {result?.error && !loading ? (
        <div className="flex flex-col items-start gap-3">
          <Alert type="error">Couldn&apos;t load tasks: {result.error}</Alert>
          <Button variant="secondary" onClick={reload}>
            Try again
          </Button>
        </div>
      ) : !data ? (
        <PageSpinner />
      ) : data.items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 px-6 py-12 text-center dark:border-zinc-700">
          {hasFilters ? (
            <>
              <p className="font-medium">No tasks match these filters.</p>
              <Button variant="secondary" className="mt-4" onClick={clearFilters}>
                Clear filters
              </Button>
            </>
          ) : (
            <>
              <p className="font-medium">No tasks yet.</p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Add your first one to start tracking your work.
              </p>
              <Button className="mt-4" onClick={() => setEditing('new')}>
                Create a task
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className={`flex flex-col gap-4 transition-opacity ${loading ? 'opacity-60' : ''}`} aria-busy={loading}>
          <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {data.items.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                toggling={togglingId === task.id}
                onToggleDone={toggleDone}
                onEdit={(t) => {
                  setNotice(null);
                  setEditing(t);
                }}
                onDelete={(t) => {
                  setNotice(null);
                  setToDelete(t);
                }}
              />
            ))}
          </ul>

          <div className="flex items-center justify-between text-sm text-zinc-500">
            <span>
              {data.total} {data.total === 1 ? 'task' : 'tasks'}
              {data.totalPages > 1 && ` · page ${data.page} of ${data.totalPages}`}
            </span>
            {data.totalPages > 1 && (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="h-8 px-3"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  className="h-8 px-3"
                  disabled={page >= data.totalPages || loading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {editing && (
        <TaskFormDialog
          task={editing === 'new' ? null : editing}
          onSaved={handleSaved}
          onClose={() => setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete this task?"
        confirmLabel="Delete task"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      >
        {toDelete && (
          <>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{toDelete.title}</span> will be
            removed permanently.
          </>
        )}
      </ConfirmDialog>
    </div>
  );
}
