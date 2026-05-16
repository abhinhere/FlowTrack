"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, X } from "lucide-react";

type Toast = {
  id: string;
  title: string;
  description?: string;
};

type ToastContextValue = {
  notify: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const value = useMemo<ToastContextValue>(
    () => ({
      notify(toast) {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        setToasts((current) => [...current, { id, ...toast }]);
        window.setTimeout(() => {
          setToasts((current) => current.filter((item) => item.id !== id));
        }, 3200);
      }
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 18, scale: 0.96 }}
              className="glass-panel rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-blue-500/15 p-1 text-blue-300">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">{toast.title}</p>
                  {toast.description && (
                    <p className="mt-1 text-xs leading-5 text-slate-400">{toast.description}</p>
                  )}
                </div>
                <button
                  aria-label="Dismiss notification"
                  onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
                  className="rounded-lg p-1 text-slate-500 transition hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    return {
      notify: ({ title, description }: Omit<Toast, "id">) => {
        console.info(title, description);
      }
    };
  }

  return context;
}
