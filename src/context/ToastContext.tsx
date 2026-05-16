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
                className={`pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border ${
                  t.type === 'success' 
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300' 
                    : t.type === 'error'
                    ? 'bg-red-50 border-red-100 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
                    : 'bg-indigo-50 border-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-300'
                }`}
              >
                {t.type === 'success' && <CheckCircle2 className="h-5 w-5 shrink-0" />}
                {t.type === 'error' && <AlertCircle className="h-5 w-5 shrink-0" />}
                {t.type === 'info' && <Info className="h-5 w-5 shrink-0" />}
                
                <span className="text-sm font-semibold pr-2">{t.message}</span>
                
                <button 
                  onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
                  className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <X className="h-4 w-4 opacity-50" />
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
