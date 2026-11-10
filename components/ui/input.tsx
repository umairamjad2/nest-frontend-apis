import type { ComponentProps } from 'react';

interface InputProps extends ComponentProps<'input'> {
  label: string;
  error?: string;
}

/**
 * A labelled input with an error message underneath.
 * Works with react-hook-form: <Input label="Email" {...register('email')} />
 * (React 19 passes `ref` as a normal prop, so register's ref reaches the <input>.)
 */
export function Input({ label, error, id, name, className = '', ...props }: InputProps) {
  const inputId = id ?? name;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`h-10 rounded-md border bg-white px-3 text-sm outline-none transition-colors focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:bg-zinc-900 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/10 ${
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
