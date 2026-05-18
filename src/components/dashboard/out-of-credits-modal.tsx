/**
 * Out of Credits Modal Component
 * 
 * Styled cleanly and consistently with PatentIQ's core design system (matching CreateGroupDialog).
 * Displays a simple, highly professional, non-cliche status message along with the brand logo.
 */

"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Portal } from "@/components/ui/portal";

interface OutOfCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OutOfCreditsModal({ isOpen, onClose }: OutOfCreditsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Portal>
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            {/* Backdrop aligned with standard modal blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm transition-all"
            />

            {/* Modal Box - Matching CreateGroupDialog styling perfectly */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-md border border-gray-100 dark:border-zinc-800 shadow-2xl p-8 z-10"
            >
              {/* Header with Logo */}
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-3">
                  <img 
                    src="/icon0.svg" 
                    alt="PatentIQ Logo" 
                    className="w-10 h-10 object-contain shrink-0" 
                  />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Out of Credits
                    </h3>
                    <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                      Your evaluation queue has been paused.
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Informative Body Content */}
              <div className="space-y-6">
                <div className="p-4 rounded-md bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100/80 dark:border-amber-900/30">
                  <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
                    We've successfully paused your pipeline evaluations to prevent API failures and preserve your student documents. No credits have been deducted.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                    Account Pipeline Refill
                  </label>
                  <div className="rounded-md border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 px-5 py-4 flex flex-col gap-1.5">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      Contact Developer for Refill
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">
                      Email our team to top up your account credits. We will process your refill request instantly.
                    </p>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="h-12 font-bold rounded-md border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
                  >
                    Close
                  </Button>
                  <a
                    href="mailto:mail.dialabs@gmail.com?subject=PatentIQ Credit Refill Request"
                    className="w-full"
                  >
                    <Button
                      className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2 group transition-all"
                    >
                      <Mail className="h-4 w-4 text-white" />
                      Email Developer
                    </Button>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </Portal>
      )}
    </AnimatePresence>
  );
}
