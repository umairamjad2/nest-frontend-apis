'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getErrorMessage } from '@/lib/errors';
import { taskSchema, type TaskFormValues } from '@/lib/schemas';
import { createTask, updateTask } from '@/lib/tasks-api';
import { PRIORITY_LABELS, STATUS_LABELS, toDateInputValue } from '@/lib/tasks';
import type { Task, TaskInput, TaskPriority, TaskStatus } from '@/types';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface TaskFormDialogProps {
  /** The task to edit, or null to create a new one. */
  task: Task | null;
  onSaved: (task: Task, mode: 'created' | 'updated') => void;
  onClose: () => void;
}

function toInput(values: TaskFormValues): TaskInput {
  return {
    title: values.title,
    description: values.description || null,
    status: values.status,
    priority: values.priority,
    dueDate: values.dueDate || null,
  };
}

/**
 * Create or edit a task in a modal. Mount it to open it and unmount it to close it,
 * so every open starts from fresh form values.
 */
export function TaskFormDialog({ task, onSaved, onClose }: TaskFormDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      status: task?.status ?? 'TODO',
      priority: task?.priority ?? 'MEDIUM',
      dueDate: toDateInputValue(task?.dueDate ?? null),
    },
  });

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  async function onSubmit(values: TaskFormValues) {
    setServerError(null);
    try {
      const input = toInput(values);
      if (task) {
        onSaved(await updateTask(task.id, input), 'updated');
      } else {
        onSaved(await createTask(input), 'created');
      }
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        // Escape key: close through the parent, but not while saving.
        event.preventDefault();
        if (!isSubmitting) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-xl border border-zinc-200 bg-white p-6 text-zinc-900 shadow-lg backdrop:bg-black/40 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
    >
      <h2 id={titleId} className="text-lg font-semibold">
        {task ? 'Edit task' : 'New task'}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-4 flex flex-col gap-4">
        {serverError && <Alert type="error">{serverError}</Alert>}

        <Input label="Title" autoFocus maxLength={200} error={errors.title?.message} {...register('title')} />
        <Textarea
          label="Description (optional)"
          rows={3}
          maxLength={2000}
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Select label="Status" error={errors.status?.message} {...register('status')}>
            {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
          <Select label="Priority" error={errors.priority?.message} {...register('priority')}>
            {(Object.keys(PRIORITY_LABELS) as TaskPriority[]).map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </Select>
          <Input label="Due date" type="date" error={errors.dueDate?.message} {...register('dueDate')} />
        </div>

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {task ? 'Save changes' : 'Create task'}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
