'use client';

import { useEffect, useMemo, useState, type DragEvent } from 'react';
import { getErrorMessage } from '@/lib/errors';
import { listTasks, updateTask } from '@/lib/tasks-api';
import { PRIORITY_LABELS, STATUS_LABELS, describeDue } from '@/lib/tasks';
import type { Task, TaskPriority, TaskQuery, TaskStatus } from '@/types';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { PageSpinner } from '@/components/auth-guard';

const COLUMNS: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

// The API returns at most 50 tasks per request
const COLUMN_LIMIT = 50;

const columnDot: Record<TaskStatus, string> = {
  TODO: 'bg-chart-todo',
  IN_PROGRESS: 'bg-chart-progress',
  DONE: 'bg-chart-done',
};

const priorityStripe: Record<TaskPriority, string> = {
  HIGH: 'before:bg-red-500',
  MEDIUM: 'before:bg-amber-400',
  LOW: 'before:bg-zinc-300 dark:before:bg-zinc-700',
};

const priorityText: Record<TaskPriority, string> = {
  HIGH: 'text-red-600 dark:text-red-400',
  MEDIUM: 'text-amber-700 dark:text-amber-400',
  LOW: 'text-zinc-500',
};

const dueText = {
  overdue: 'font-medium text-red-600 dark:text-red-400',
  soon: 'font-medium text-brand-text',
  normal: 'text-zinc-500',
  done: 'text-zinc-400',
};

type Column = { items: Task[]; total: number };
type Columns = Record<TaskStatus, Column>;
type Result = { key: string; columns: Columns | null; error: string | null };

interface KanbanBoardProps {
  /** Filters shared with the list view (status is the column, so it's not included) */
  filters: Pick<TaskQuery, 'priority' | 'search' | 'sortBy' | 'order'>;
  reloadKey: number;
  /** Called after a task moves, so the parent refreshes counts */
  onChanged: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

async function loadColumns(filters: KanbanBoardProps['filters']): Promise<Columns> {
  const lists = await Promise.all(
    COLUMNS.map((status) => listTasks({ ...filters, status, page: 1, limit: COLUMN_LIMIT })),
  );
  return Object.fromEntries(
    COLUMNS.map((status, i) => [status, { items: lists[i].items, total: lists[i].total }]),
  ) as Columns;
}

/** Tasks in three columns by status. Drag a card to another column (or use its arrows) to move it. */
export function KanbanBoard({ filters, reloadKey, onChanged, onEdit, onDelete }: KanbanBoardProps) {
  const toast = useToast();
  const [result, setResult] = useState<Result | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<TaskStatus | null>(null);

  const key = useMemo(() => `${JSON.stringify(filters)}#${reloadKey}`, [filters, reloadKey]);

  useEffect(() => {
    let cancelled = false;
    loadColumns(filters).then(
      (columns) => !cancelled && setResult({ key, columns, error: null }),
      (error: unknown) => !cancelled && setResult({ key, columns: null, error: getErrorMessage(error) }),
    );
    return () => {
      cancelled = true;
    };
  }, [filters, key]);

  const columns = result?.columns ?? null;
  const loading = result?.key !== key;

  async function moveTask(task: Task, to: TaskStatus) {
    if (task.status === to) return;
    const from = task.status;
    const moved = { ...task, status: to };

    // Move the card straight away; the reload afterwards brings the server's order.
    setResult((r) => {
      if (!r?.columns) return r;
      const c = r.columns;
      return {
        ...r,
        columns: {
          ...c,
          [from]: { items: c[from].items.filter((t) => t.id !== task.id), total: c[from].total - 1 },
          [to]: { items: [moved, ...c[to].items], total: c[to].total + 1 },
        },
      };
    });

    try {
      await updateTask(task.id, { status: to });
      if (to === 'DONE') toast.success(`Nice! "${task.title}" is done.`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      onChanged();
    }
  }

  function findTask(id: number) {
    if (!columns) return null;
    for (const status of COLUMNS) {
      const task = columns[status].items.find((t) => t.id === id);
      if (task) return task;
    }
    return null;
  }

  function handleDrop(event: DragEvent, to: TaskStatus) {
    event.preventDefault();
    setDropTarget(null);
    const task = findTask(Number(event.dataTransfer.getData('text/plain')));
    if (task) moveTask(task, to);
  }

  if (result?.error && !loading) {
    return (
      <div className="flex flex-col items-start gap-3">
        <Alert type="error">Couldn&apos;t load tasks: {result.error}</Alert>
        <Button variant="secondary" onClick={onChanged}>
          Try again
        </Button>
      </div>
    );
  }

  if (!columns) return <PageSpinner />;

  return (
    // Columns side by side from md; on phones they stack and the arrow buttons move cards
    <div className={`grid gap-4 transition-opacity md:grid-cols-3 ${loading ? 'opacity-70' : ''}`} aria-busy={loading}>
      {COLUMNS.map((status) => {
        const column = columns[status];
        const isTarget = dropTarget === status && draggingId !== null;
        return (
          <section
            key={status}
            aria-label={`${STATUS_LABELS[status]} (${column.total})`}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
              if (dropTarget !== status) setDropTarget(status);
            }}
            onDragLeave={(event) => {
              // Only when the pointer leaves the column, not when it crosses a child
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDropTarget(null);
            }}
            onDrop={(event) => handleDrop(event, status)}
            className={`flex min-h-48 flex-col rounded-xl border p-3 transition-colors ${
              isTarget
                ? 'border-brand bg-brand-soft'
                : 'border-zinc-200 bg-zinc-100/60 dark:border-zinc-800 dark:bg-zinc-900/40'
            }`}
          >
            <header className="mb-3 flex items-center justify-between px-1">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <span aria-hidden className={`size-2.5 rounded-full ${columnDot[status]}`} />
                {STATUS_LABELS[status]}
              </h2>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium tabular-nums text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {column.total}
              </span>
            </header>

            <ul className="flex flex-1 flex-col gap-2">
              {column.items.map((task) => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  dragging={draggingId === task.id}
                  onDragStart={() => setDraggingId(task.id)}
                  onDragEnd={() => {
                    setDraggingId(null);
                    setDropTarget(null);
                  }}
                  onMove={(to) => moveTask(task, to)}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
              {column.items.length === 0 && (
                <li className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-zinc-300 px-3 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
                  {isTarget ? 'Drop here' : 'No tasks'}
                </li>
              )}
            </ul>

            {column.total > column.items.length && (
              <p className="mt-2 px-1 text-xs text-zinc-500">
                Showing {column.items.length} of {column.total}. Use the list view to see all.
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}

interface KanbanCardProps {
  task: Task;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onMove: (to: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

function KanbanCard({ task, dragging, onDragStart, onDragEnd, onMove, onEdit, onDelete }: KanbanCardProps) {
  const index = COLUMNS.indexOf(task.status);
  const prev = COLUMNS[index - 1];
  const next = COLUMNS[index + 1];
  const due = describeDue(task);
  const done = task.status === 'DONE';

  return (
    <li
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData('text/plain', String(task.id));
        event.dataTransfer.effectAllowed = 'move';
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      className={`group relative cursor-grab rounded-lg border border-zinc-200 bg-white py-3 pr-3 pl-4 shadow-sm transition before:absolute before:inset-y-2 before:left-1.5 before:w-1 before:rounded-full hover:border-zinc-300 hover:shadow active:cursor-grabbing dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 ${
        done ? 'before:bg-zinc-200 dark:before:bg-zinc-800' : priorityStripe[task.priority]
      } ${dragging ? 'rotate-1 opacity-50' : ''}`}
    >
      <button
        type="button"
        onClick={() => onEdit(task)}
        className={`block w-full text-left text-sm font-medium break-words hover:underline ${
          done ? 'text-zinc-400 line-through dark:text-zinc-500' : ''
        }`}
      >
        {task.title}
      </button>
      {task.description && (
        <p className="mt-1 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">{task.description}</p>
      )}

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <span className={`font-medium ${priorityText[task.priority]}`}>{PRIORITY_LABELS[task.priority]}</span>
          {due && <span className={dueText[due.tone]}>{due.text}</span>}
        </div>

        <div className="flex shrink-0 items-center">
          {prev && (
            <IconButton label={`Move to ${STATUS_LABELS[prev]}`} onClick={() => onMove(prev)}>
              <path d="M15 6l-6 6 6 6" />
            </IconButton>
          )}
          {next && (
            <IconButton label={`Move to ${STATUS_LABELS[next]}`} onClick={() => onMove(next)}>
              <path d="M9 6l6 6-6 6" />
            </IconButton>
          )}
          <IconButton label={`Delete "${task.title}"`} onClick={() => onDelete(task)} danger>
            <path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12" />
          </IconButton>
        </div>
      </div>
    </li>
  );
}

function IconButton({
  label,
  onClick,
  danger = false,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`inline-flex size-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
        danger ? 'hover:text-red-600 dark:hover:text-red-400' : 'hover:text-zinc-800 dark:hover:text-zinc-100'
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden>
        {children}
      </svg>
    </button>
  );
}
