'use client';

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type ToastType = 'success' | 'error' | 'info';

type ToastOptions = {
  duration?: number; // ms
  type?: ToastType;
};

type Toast = {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  createdAt: number;
};

type ToastContextValue = {
  show: (message: string, opts?: ToastOptions) => string;
  success: (message: string, opts?: Omit<ToastOptions, 'type'>) => string;
  error: (message: string, opts?: Omit<ToastOptions, 'type'>) => string;
  info: (message: string, opts?: Omit<ToastOptions, 'type'>) => string;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function useIsomorphicEffect(fn: React.EffectCallback, deps: React.DependencyList) {
  const isServer = typeof window === 'undefined';
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return isServer ? undefined : React.useEffect(fn, deps);
}

function ToastItem({ t, onClose }: { t: Toast; onClose: (id: string) => void }) {
  const palette =
    t.type === 'success'
      ? { border: 'border-brand', bg: 'bg-white', text: 'text-[#111111]' }
      : t.type === 'error'
      ? { border: 'border-red-500', bg: 'bg-white', text: 'text-[#111111]' }
      : { border: 'border-[#E5E7EB]', bg: 'bg-white', text: 'text-[#111111]' };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-auto w-full max-w-sm rounded-xl border ${palette.border} ${palette.bg} shadow-md px-4 py-3 flex items-start gap-3`}
    >
      <div
        className={`mt-1 h-2 w-2 rounded-full ${
          t.type === 'success' ? 'bg-brand' : t.type === 'error' ? 'bg-red-500' : 'bg-[#9CA3AF]'
        }`}
        aria-hidden
      />
      <div className="flex-1">
        <div className={`text-sm ${palette.text}`}>{t.message}</div>
      </div>
      <button
        type="button"
        aria-label="Закрыть"
        onClick={() => onClose(t.id)}
        className="ml-1 text-[#6B7280] hover:text-[#111111]"
      >
        ✕
      </button>
    </div>
  );
}

export function ToastProvider({
  children,
  limit = 4,
  defaultDuration = 3500,
  position = 'top-center',
}: {
  children: React.ReactNode;
  limit?: number; // max visible toasts in stack
  defaultDuration?: number;
  position?: 'top-center' | 'top-right' | 'bottom-center' | 'bottom-right';
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutsRef = useRef<Map<string, number>>(new Map());

  const clearTimer = useCallback((id: string) => {
    const t = timeoutsRef.current.get(id);
    if (t) {
      window.clearTimeout(t);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const dismiss = useCallback(
    (id: string) => {
      clearTimer(id);
      setToasts((prev) => prev.filter((x) => x.id !== id));
    },
    [clearTimer]
  );

  const enqueue = useCallback(
    (message: string, opts?: ToastOptions): string => {
      const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const t: Toast = {
        id,
        message,
        type: (opts?.type ?? 'info') as ToastType,
        duration: Math.max(1000, opts?.duration ?? defaultDuration),
        createdAt: Date.now(),
      };

      setToasts((prev) => {
        const next = prev.length >= limit ? [...prev.slice(1), t] : [...prev, t];
        return next;
      });

      const handle = window.setTimeout(() => dismiss(id), t.duration);
      timeoutsRef.current.set(id, handle);

      return id;
    },
    [defaultDuration, dismiss, limit]
  );

  // clear timers on unmount
  useIsomorphicEffect(() => {
    return () => {
      timeoutsRef.current.forEach((h) => window.clearTimeout(h));
      timeoutsRef.current.clear();
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      show: enqueue,
      success: (message, opts) => enqueue(message, { ...opts, type: 'success' }),
      error: (message, opts) => enqueue(message, { ...opts, type: 'error' }),
      info: (message, opts) => enqueue(message, { ...opts, type: 'info' }),
      dismiss,
    }),
    [dismiss, enqueue]
  );

  const containerClass =
    position === 'top-center'
      ? 'top-4 left-1/2 -translate-x-1/2'
      : position === 'top-right'
      ? 'top-4 right-4'
      : position === 'bottom-center'
      ? 'bottom-4 left-1/2 -translate-x-1/2'
      : 'bottom-4 right-4';

  const container = (
    <div
      className={`pointer-events-none fixed z-[1900] ${containerClass} flex flex-col items-stretch gap-2`}
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} t={t} onClose={dismiss} />
      ))}
    </div>
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== 'undefined' ? createPortal(container, document.body) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within <ToastProvider />');
  }
  return ctx;
}

// Helper for common message format example:
// toast.success(`Полис найден для номера ${formatPhone(phone)}`);
