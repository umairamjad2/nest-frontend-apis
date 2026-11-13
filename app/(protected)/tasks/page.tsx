import type { Metadata } from 'next';
import { TasksBoard } from '@/components/tasks/tasks-board';

export const metadata: Metadata = { title: 'Tasks' };

// Shown only after the browser restores the session (ProtectedGuard), so it
// can't be rendered ahead of time. Opt out of instant-navigation validation.
export const instant = false;

export default function TasksPage() {
  return <TasksBoard />;
}
