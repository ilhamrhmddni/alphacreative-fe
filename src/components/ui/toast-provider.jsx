"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const ToastContext = createContext({
  toast: () => {},
  success: () => {},
  error: () => {},
  dismiss: () => {},
});

const VARIANT_STYLES = {
  default: "border border-border bg-card text-card-foreground shadow-lg",
  success: "border border-emerald-200 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-50 dark:border-emerald-800 shadow-lg",
  error: "border border-rose-200 bg-rose-50 text-rose-900 dark:bg-rose-950 dark:text-rose-50 dark:border-rose-800 shadow-lg",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timeout = timers.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    ({ title, description, variant = "default", duration = 4000 }) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setToasts((prev) => [...prev, { id, title, description, variant }]);

      const timeout = setTimeout(() => dismiss(id), duration);
      timers.current.set(id, timeout);
    },
    [dismiss]
  );

  const success = useCallback(
    (payload) => toast({ variant: "success", ...payload }),
    [toast]
  );

  const error = useCallback(
    (payload) => toast({ variant: "error", ...payload }),
    [toast]
  );

  useEffect(() => {
    return () => {
      timers.current.forEach((timeout) => clearTimeout(timeout));
      timers.current.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast, success, error, dismiss }}>
      {children}
      <div className="pointer-events-none fixed left-1/2 top-6 z-[60] flex w-full max-w-md -translate-x-1/2 flex-col gap-2 px-4 sm:px-0">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={cn(
              "pointer-events-auto rounded-lg border px-4 py-3 shadow-lg transition",
              VARIANT_STYLES[item.variant] || VARIANT_STYLES.default
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                {item.title && (
                  <p className="text-sm font-semibold">{item.title}</p>
                )}
                {item.description && (
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="rounded-full p-1 text-xs text-muted-foreground transition hover:bg-black/5 hover:text-foreground"
                aria-label="Dismiss toast"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
