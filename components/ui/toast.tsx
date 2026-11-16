'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

type ToastType = 'success' | 'error';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

// Errors stay a little longer so there's time to read them.
const DURATION: Record<ToastType, number> = { success: 3500, error: 6000 };
const MAX_VISIBLE = 3;

/**
 * Small pop-up messages in the corner. Wrap the app in <ToastProvider> and call
 * useToast().success('Saved') from any client component.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((type: ToastType, message: string) => {
    const id = ++nextId.current;
    // Newest last; drop the oldest beyond the limit
    setToasts((list) => [...list, { id, type, message }].slice(-MAX_VISIBLE));
  }, []);

  const api = useMemo<ToastApi>(
    () => ({ success: (m) => show('success', m), error: (m) => show('error', m) }),
    [show],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Always in the DOM so screen readers announce new toasts */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  const [paused, setPaused] = useState(false);

  // Hovering pauses the timer (it restarts from the full duration afterwards)
  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => onDismiss(toast.id), DURATION[toast.type]);
    return () => clearTimeout(id);
  }, [paused, toast.id, toast.type, onDismiss]);

  const isError = toast.type === 'error';

  return (
    <div
      role={isError ? 'alert' : 'status'}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="pointer-events-auto flex w-full max-w-sm animate-toast-in items-start gap-3 rounded-xl border border-zinc-200 bg-white p-3.5 text-sm shadow-lg shadow-black/5 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/40"
    >
      <span
        aria-hidden
        className={`mt-px inline-flex size-5 shrink-0 items-center justify-center rounded-full ${
          isError ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400' : 'bg-brand-soft text-brand-text'
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="size-3">
          {isError ? <path d="M12 7v6M12 17h.01" /> : <path d="M5 12.5l4.5 4.5L19 7.5" />}
        </svg>
      </span>
      <p className="min-w-0 flex-1 break-words text-zinc-800 dark:text-zinc-200">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss"
        className="-m-1 rounded p-1 text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-4" aria-hidden>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  );
}

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error('useToast must be used inside <ToastProvider>');
  return api;
}
