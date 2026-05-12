"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './button';
import { Portal } from './portal';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'info';
  isLoading?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'info',
  isLoading = false
}: ConfirmationDialogProps) {
  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
            />

            {/* Dialog Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="relative w-full max-w-[340px] bg-white dark:bg-zinc-900 rounded-md shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden"
            >
              <div className="p-6">
                {/* Text Content */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-normal mb-6">
                  {description}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-md h-10 font-bold text-sm border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    {cancelLabel}
                  </Button>
                  <Button
                    className={`flex-1 rounded-md h-10 font-bold text-sm transition-colors ${
                      variant === 'danger' 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                    onClick={onConfirm}
                    isLoading={isLoading}
                  >
                    {confirmLabel}
                  </Button>
                </div>
              </div>

              {/* Close Button */}
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
