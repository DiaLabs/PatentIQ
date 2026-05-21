"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';
import { Portal } from '@/components/ui/portal';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export interface Action {
  id: string;
  message: string;
  type: ToastType;
  timestamp: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  actions: Action[];
  clearActions: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [actions, setActions] = useState<Action[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Also log as an action (limited to last 10)
    setActions((prev) => [
      { id, message, type, timestamp: Date.now() },
      ...prev.slice(0, 9)
    ]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const clearActions = useCallback(() => {
    setActions([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, actions, clearActions }}>
      {children}
      <Portal>
        <div className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-3 pointer-events-none">
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-md shadow-xl border bg-white dark:bg-zinc-900 ${
                  t.type === 'success' 
                    ? 'border-emerald-100 dark:border-emerald-900/30' 
                    : t.type === 'error'
                    ? 'border-red-100 dark:border-red-900/30'
                    : 'border-indigo-100 dark:border-indigo-900/30'
                }`}
              >
                {t.type === 'success' && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />}
                {t.type === 'error' && <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />}
                {t.type === 'info' && <Info className="h-5 w-5 shrink-0 text-indigo-500" />}
                
                <span className="text-sm font-semibold pr-2 text-gray-900 dark:text-gray-100">{t.message}</span>
                
                <button 
                  onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
                  className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <X className="h-4 w-4 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Portal>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
