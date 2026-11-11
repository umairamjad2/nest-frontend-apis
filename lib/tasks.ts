import type { Task, TaskPriority, TaskStatus } from '@/types';

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

// Due dates are calendar days. The backend stores them as midnight UTC, so they are
// always read and compared in UTC; otherwise users west of UTC would see the day before.

/** ISO string from the API -> "YYYY-MM-DD" for <input type="date">, or "" for none. */
export function toDateInputValue(iso: string | null): string {
  return iso ? iso.slice(0, 10) : '';
}

/** "Dec 1" for this year, "Dec 1, 2027" otherwise. */
export function formatDueDate(iso: string, now = new Date()): string {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
    year: date.getUTCFullYear() === now.getUTCFullYear() ? undefined : 'numeric',
  });
}

/** Due before today and not done. Matches how the backend counts "overdue". */
export function isOverdue(task: Pick<Task, 'dueDate' | 'status'>, now = new Date()): boolean {
  if (!task.dueDate || task.status === 'DONE') return false;
  return task.dueDate.slice(0, 10) < now.toISOString().slice(0, 10);
}
