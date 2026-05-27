"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Portal } from "@/components/ui/portal";

interface PaymentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  credits?: string;
}

export function PaymentSuccessModal({ isOpen, onClose, credits }: PaymentStatusModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Portal>
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm transition-all"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-md border border-gray-100 dark:border-zinc-800 shadow-2xl p-8 z-10 flex flex-col items-center text-center"
            >
              <div className="absolute top-4 right-4">
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 mt-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Payment Successful!
              </h3>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                <strong className="text-emerald-600 dark:text-emerald-400">{credits && credits !== "0" ? `${credits} credits` : "Your credits"}</strong> have been successfully added to your account. You can now resume your student evaluations.
              </p>

              <Button
                onClick={onClose}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md shadow-lg shadow-indigo-500/10 transition-all"
              >
                Return to Dashboard
              </Button>
            </motion.div>
          </div>
        </Portal>
      )}
    </AnimatePresence>
  );
}

export function PaymentFailureModal({ isOpen, onClose }: PaymentStatusModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Portal>
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm transition-all"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-md border border-gray-100 dark:border-zinc-800 shadow-2xl p-8 z-10 flex flex-col items-center text-center"
            >
              <div className="absolute top-4 right-4">
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6 mt-2">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Payment Failed or Cancelled
              </h3>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                Your transaction could not be completed, and no charges were made. Please try again or contact support if the issue persists.
              </p>

              <Button
                variant="outline"
                onClick={onClose}
                className="w-full h-12 font-bold rounded-md border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
              >
                Dismiss
              </Button>
            </motion.div>
          </div>
        </Portal>
      )}
    </AnimatePresence>
  );
}
