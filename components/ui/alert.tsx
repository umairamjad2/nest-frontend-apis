import type { ReactNode } from 'react';

const styles = {
  error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200',
  success:
    'border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200',
};

/** A message box for form-level errors (from the backend) and success messages. */
export function Alert({ type, children }: { type: 'error' | 'success'; children: ReactNode }) {
  return (
    <div role={type === 'error' ? 'alert' : 'status'} className={`rounded-md border p-3 text-sm ${styles[type]}`}>
      {children}
    </div>
  );
}
