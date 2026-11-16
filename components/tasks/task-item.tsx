'use client';

import { PRIORITY_LABELS, STATUS_LABELS, describeDue, type DueTone } from '@/lib/tasks';
import type { Task, TaskPriority } from '@/types';
import { Button } from '@/components/ui/button';

// Coloured stripe on the left edge, so priority is visible at a glance
const priorityStripe: Record<TaskPriority, string> = {
  HIGH: 'before:bg-red-500',
  MEDIUM: 'before:bg-amber-400',
  LOW: 'before:bg-zinc-300 dark:before:bg-zinc-700',
};

const priorityBadge: Record<TaskPriority, string> = {
  HIGH: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/60 dark:text-red-300 dark:ring-red-900',
  MEDIUM: 'bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-900',
  LOW: 'bg-zinc-50 text-zinc-600 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-800',
};

const priorityDot: Record<TaskPriority, string> = {
  HIGH: 'bg-red-500',
  MEDIUM: 'bg-amber-400',
  LOW: 'bg-zinc-400',
};

const dueStyles: Record<DueTone, string> = {
  overdue: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/60 dark:text-red-300 dark:ring-red-900',
  soon: 'bg-brand-soft text-brand-text ring-brand-line',
  normal: 'bg-zinc-50 text-zinc-600 ring-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:ring-zinc-800',
  done: 'text-zinc-400 ring-transparent dark:text-zinc-500',
};

const badge = 'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset';

interface TaskItemProps {
  task: Task;
  /** True while this task's "done" toggle is saving. */
  toggling: boolean;
  onToggleDone: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskItem({ task, toggling, onToggleDone, onEdit, onDelete }: TaskItemProps) {
  const done = task.status === 'DONE';
  const due = describeDue(task);
  const overdue = due?.tone === 'overdue';

  return (
    <li
      className={`relative flex items-start gap-3 py-3.5 pr-4 pl-5 transition-colors before:absolute before:inset-y-2 before:left-1.5 before:w-1 before:rounded-full ${
        done ? 'before:bg-zinc-200 dark:before:bg-zinc-800' : priorityStripe[task.priority]
      } ${overdue ? 'bg-red-50/50 dark:bg-red-950/15' : ''}`}
    >
      <input
        type="checkbox"
        checked={done}
        disabled={toggling}
        onChange={() => onToggleDone(task)}
        aria-label={done ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
        className="mt-1 size-4 shrink-0 cursor-pointer accent-brand disabled:cursor-wait"
      />

      <div className="min-w-0 flex-1">
        <p className={`break-words font-medium ${done ? 'text-zinc-400 line-through dark:text-zinc-500' : ''}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="mt-0.5 line-clamp-2 whitespace-pre-line break-words text-sm text-zinc-600 dark:text-zinc-400">
            {task.description}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className={`${badge} ${priorityBadge[task.priority]}`}>
            <span aria-hidden className={`size-1.5 rounded-full ${priorityDot[task.priority]}`} />
            {PRIORITY_LABELS[task.priority]}
            <span className="sr-only"> priority</span>
          </span>
          {task.status === 'IN_PROGRESS' && (
            <span className={`${badge} bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:ring-indigo-900`}>
              {STATUS_LABELS.IN_PROGRESS}
            </span>
          )}
          {due && (
            <span className={`${badge} ${dueStyles[due.tone]}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-3" aria-hidden>
                {overdue ? (
                  <path d="M12 8v5M12 16.5h.01M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z" />
                ) : (
                  <path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM8 3v4M16 3v4M4 10h16" />
                )}
              </svg>
              {due.text}
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 gap-2">
        <Button variant="secondary" className="h-8 px-3" onClick={() => onEdit(task)}>
          Edit
        </Button>
        <Button
          variant="secondary"
          className="h-8 px-3 text-red-600 dark:text-red-400"
          onClick={() => onDelete(task)}
          aria-label={`Delete "${task.title}"`}
        >
          Delete
        </Button>
      </div>
    </li>
  );
}
