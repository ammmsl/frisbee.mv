'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

export type ToastVariant = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  show: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DISMISS_MS = 4000;

const variantStyles: Record<ToastVariant, string> = {
  success: 'bg-green-700 text-white',
  error:   'bg-red-600 text-white',
  info:    'bg-gray-800 text-white',
};

const variantIcon: Record<ToastVariant, string> = {
  success: '✓',
  error:   '✕',
  info:    'ℹ',
};

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const t = timers.current.get(id);
    if (t) {
      clearTimeout(t);
      timers.current.delete(id);
    }
  }, []);

  const show = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      const id = ++nextId;
      setToasts((prev) => [...prev, { id, message, variant }]);
      const timer = setTimeout(() => dismiss(id), DISMISS_MS);
      timers.current.set(id, timer);
    },
    [dismiss]
  );

  // Clean up all timers on unmount
  useEffect(() => {
    const t = timers.current;
    return () => t.forEach((timer) => clearTimeout(timer));
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {/* Toast container */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="false"
        className="fixed z-[9999] flex flex-col gap-2 p-4 bottom-0 left-0 right-0 items-center lg:left-auto lg:right-0 lg:items-end pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg text-sm font-medium pointer-events-auto min-w-[280px] max-w-[360px] ${variantStyles[toast.variant]}`}
          >
            <span aria-hidden="true" className="shrink-0 font-bold text-base leading-none">
              {variantIcon[toast.variant]}
            </span>
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="shrink-0 ml-1 rounded p-0.5 opacity-75 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
