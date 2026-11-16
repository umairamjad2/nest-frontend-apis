import type { ReactNode } from 'react';

const icons = {
  tasks: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4.5V3h6v1.5M9 11l1.5 1.5L14 9M9 16h6" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-4.5-4.5M9 11h4" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16M10 15l1.5 1.5L15 13" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="9" r="3.5" />
      <path d="M3 20c.8-3.5 3.2-5 6-5s5.2 1.5 6 5M16 5.5a3.5 3.5 0 0 1 0 7M18 15c1.6.6 2.6 2.2 3 5" />
    </>
  ),
};

interface EmptyStateProps {
  icon: keyof typeof icons;
  title: string;
  description?: string;
  /** Usually a button */
  action?: ReactNode;
  /** Smaller padding, for use inside a card */
  compact?: boolean;
}

/** Friendly placeholder for a list with nothing in it. */
export function EmptyState({ icon, title, description, action, compact = false }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center rounded-xl border border-dashed border-zinc-300 text-center dark:border-zinc-700 ${
        compact ? 'px-4 py-8' : 'px-6 py-14'
      }`}
    >
      <span className="inline-flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand-text ring-8 ring-brand-soft/50">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-6"
          aria-hidden
        >
          {icons[icon]}
        </svg>
      </span>
      <p className="mt-5 font-display text-lg font-semibold">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-zinc-600 dark:text-zinc-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
