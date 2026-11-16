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

const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole calendar days from today (UTC) to the due date: 0 today, 1 tomorrow, -2 two days ago. */
export function daysUntil(iso: string, now = new Date()): number {
  const due = Date.parse(iso.slice(0, 10));
  const today = Date.parse(now.toISOString().slice(0, 10));
  return Math.round((due - today) / DAY_MS);
}

export type DueTone = 'overdue' | 'soon' | 'normal' | 'done';

/** Friendly due-date text: "Overdue · 2 days", "Due today", "Due tomorrow", "Due in 3 days", "Due Dec 1". */
export function describeDue(
  task: Pick<Task, 'dueDate' | 'status'>,
  now = new Date(),
): { text: string; tone: DueTone } | null {
  if (!task.dueDate) return null;
  const days = daysUntil(task.dueDate, now);

  if (task.status === 'DONE') return { text: `Due ${formatDueDate(task.dueDate, now)}`, tone: 'done' };
  if (days < 0) {
    const late = -days;
    return { text: `Overdue · ${late} ${late === 1 ? 'day' : 'days'}`, tone: 'overdue' };
  }
  if (days === 0) return { text: 'Due today', tone: 'soon' };
  if (days === 1) return { text: 'Due tomorrow', tone: 'soon' };
  if (days <= 7) return { text: `Due in ${days} days`, tone: 'normal' };
  return { text: `Due ${formatDueDate(task.dueDate, now)}`, tone: 'normal' };
}

/** Due before today and not done. Matches how the backend counts "overdue". */
export function isOverdue(task: Pick<Task, 'dueDate' | 'status'>, now = new Date()): boolean {
  if (!task.dueDate || task.status === 'DONE') return false;
  return task.dueDate.slice(0, 10) < now.toISOString().slice(0, 10);
}
