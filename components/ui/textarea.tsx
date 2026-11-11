import type { ComponentProps } from 'react';

interface TextareaProps extends ComponentProps<'textarea'> {
  label: string;
  error?: string;
}

/** A labelled <textarea>, styled like Input. Works with react-hook-form's register(). */
export function Textarea({ label, error, id, name, className = '', ...props }: TextareaProps) {
  const textareaId = id ?? name;
  const errorId = `${textareaId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={textareaId} className="text-sm font-medium">
        {label}
      </label>
      <textarea
        id={textareaId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`min-h-24 w-full rounded-md border bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:bg-zinc-900 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10 ${
          error ? 'border-red-500' : 'border-zinc-300 dark:border-zinc-700'
        } ${className}`}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
