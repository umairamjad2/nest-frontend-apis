'use client';

import { PRIORITY_LABELS, STATUS_LABELS, formatDueDate, isOverdue } from '@/lib/tasks';
import type { Task, TaskPriority } from '@/types';
import { Button } from '@/components/ui/button';

const priorityStyles: Record<TaskPriority, string> = {
  HIGH: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
  MEDIUM: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  LOW: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
};

const badge = 'inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium';

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
  const overdue = isOverdue(task);

  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <input
        type="checkbox"
        checked={done}
        disabled={toggling}
        onChange={() => onToggleDone(task)}
        aria-label={done ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
        className="mt-1 size-4 shrink-0 cursor-pointer accent-zinc-900 disabled:cursor-wait dark:accent-zinc-100"
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
          <span className={`${badge} ${priorityStyles[task.priority]}`}>{PRIORITY_LABELS[task.priority]}</span>
          {task.status === 'IN_PROGRESS' && (
            <span className={`${badge} bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200`}>
              {STATUS_LABELS.IN_PROGRESS}
            </span>
          )}
          {task.dueDate && (
            <span
              className={`text-xs ${overdue ? 'font-medium text-red-600 dark:text-red-400' : 'text-zinc-500'}`}
            >
              {overdue ? 'Overdue · ' : 'Due '}
              {formatDueDate(task.dueDate)}
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
