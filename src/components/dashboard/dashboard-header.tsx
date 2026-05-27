import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, RefreshCw, Clock, CheckCircle2, AlertCircle, Info, Trash2, Coins } from "lucide-react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { OutOfCreditsModal } from "@/components/dashboard/out-of-credits-modal";
import { PaymentSuccessModal, PaymentFailureModal } from "@/components/dashboard/payment-status-modals";

interface PageTopBarProps {
  onRefresh?: () => void;
  isLoading?: boolean;
  disableModals?: boolean;
}

/** The right-side icon row (theme toggle, bell, refresh). 
 *  Rendered in the dashboard layout so it persists across ALL pages. */
export function PageTopBar({ onRefresh, isLoading = false, disableModals = false }: PageTopBarProps) {
  const { actions, clearActions } = useToast();
  const { mentorProfile } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState(false);
  const [paymentSuccessOpen, setPaymentSuccessOpen] = useState(false);
  const [addedCredits, setAddedCredits] = useState("0");
  const [paymentFailureOpen, setPaymentFailureOpen] = useState(false);
  const [pausedIdsToDismiss, setPausedIdsToDismiss] = useState<string[]>([]);
  const prevCreditsRef = useRef<number | null>(null);

  useEffect(() => {
    // Check for payment status in URL on mount
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    
    if (paymentStatus === 'success') {
      setPaymentSuccessOpen(true);
      setAddedCredits(params.get('credits') || "0");
      // Clean up URL without triggering Next.js hydration router errors
      if (typeof window !== "undefined") {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } else if (paymentStatus === 'cancel') {
      setPaymentFailureOpen(true);
      if (typeof window !== "undefined") {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Monitor credits change to auto-popup the modal when credits transition to 0
  useEffect(() => {
    if (mentorProfile !== null) {
      if (prevCreditsRef.current !== null && prevCreditsRef.current > 0 && mentorProfile.credits === 0) {
        setIsCreditsModalOpen(true);
      }
      prevCreditsRef.current = mentorProfile.credits;
    }
  }, [mentorProfile]);

  // Listen for custom broadcast trigger to open the modal in real-time
  useEffect(() => {
    const handleOpenModal = (e: Event) => {
      const customEvent = e as CustomEvent;
      const ids = customEvent.detail?.pausedSubIds || [];
      setPausedIdsToDismiss(ids);
      setIsCreditsModalOpen(true);
    };
    window.addEventListener("insufficient-credits-modal", handleOpenModal);
    return () => {
      window.removeEventListener("insufficient-credits-modal", handleOpenModal);
    };
  }, []);

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return "Just now";
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 relative">

      {/* Credits Display — desktop only (mobile sees it in sidebar) */}
      {mentorProfile !== null && (
        <div className="hidden lg:flex items-center gap-3">
          <div
            onClick={() => setIsCreditsModalOpen(true)}
            className={`flex items-center gap-1.5 px-1 sm:px-2 h-10 select-none transition-all duration-200 cursor-pointer hover:opacity-85 active:scale-95 ${
              mentorProfile.credits === 0
                ? "text-red-500 dark:text-red-400 font-semibold"
                : mentorProfile.credits <= 5
                ? "text-red-500 dark:text-red-400 font-semibold"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
            title="Click to top up your credits"
          >
            <Coins className="h-4 w-4" />
            <span className="text-sm font-medium">Credits: <span className="font-bold tabular-nums">{mentorProfile.credits}</span></span>
          </div>
        </div>
      )}

      {/* Payment Modals */}
      {!disableModals && (
        <>
          <PaymentSuccessModal 
            isOpen={paymentSuccessOpen} 
            onClose={() => setPaymentSuccessOpen(false)} 
            credits={addedCredits}
          />
          <PaymentFailureModal isOpen={paymentFailureOpen} onClose={() => setPaymentFailureOpen(false)} />

          {/* Out of Credits Modal */}
          <OutOfCreditsModal
            title="Top Up Credits"
            subtitle="Purchase additional credits for evaluations."
            isOpen={isCreditsModalOpen}
            onClose={() => {
              if (pausedIdsToDismiss.length > 0) {
                try {
                  const current = JSON.parse(localStorage.getItem("dismissed-paused-submissions") || "[]");
                  const updated = Array.from(new Set([...current, ...pausedIdsToDismiss]));
                  localStorage.setItem("dismissed-paused-submissions", JSON.stringify(updated));
                } catch (err) {
                  console.error("Failed to save dismissed paused submissions:", err);
                }
              }
              setIsCreditsModalOpen(false);
            }}
          />
        </>
      )}

      {/* Refresh Button */}
      {onRefresh && (
        <motion.button
          onClick={onRefresh}
          disabled={isLoading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="hidden sm:flex items-center justify-center h-10 w-10 rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-zinc-800 dark:hover:text-gray-300 disabled:opacity-60"
        >
          <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
        </motion.button>
      )}

      {/* Theme Toggle */}
      <AnimatedThemeToggler
        duration={400}
        className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-zinc-800 dark:hover:text-gray-300 [&>svg]:h-5 [&>svg]:w-5"
      />

      {/* Notification Bell */}
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowNotifications(!showNotifications)}
          className={`flex items-center justify-center h-10 w-10 rounded-full transition-colors relative ${
            showNotifications
              ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-zinc-800 dark:hover:text-gray-300"
          }`}
        >
          <Bell className="h-5 w-5" />
          {actions.length > 0 && (
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-indigo-600 border-2 border-white dark:border-[#0a0a0a]" />
          )}
        </motion.button>

        <AnimatePresence>
          {showNotifications && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowNotifications(false)} />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-80 bg-white dark:bg-zinc-900 rounded-md shadow-2xl border border-gray-100 dark:border-zinc-800 z-30 overflow-hidden"
              >
                <div className="p-4 border-b border-gray-50 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">Recent Activity</span>
                  {actions.length > 0 && (
                    <button
                      onClick={clearActions}
                      className="text-[11px] font-bold text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" /> Clear
                    </button>
                  )}
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  {actions.length > 0 ? (
                    <div className="divide-y divide-gray-50 dark:divide-zinc-800">
                      {actions.map((action) => (
                        <div key={action.id} className="p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors flex gap-3">
                          <div className={`h-8 w-8 rounded-md flex items-center justify-center shrink-0 ${
                            action.type === "success" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" :
                            action.type === "error" ? "bg-red-50 text-red-600 dark:bg-red-900/20" :
                            "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20"
                          }`}>
                            {action.type === "success" && <CheckCircle2 className="h-4 w-4" />}
                            {action.type === "error" && <AlertCircle className="h-4 w-4" />}
                            {action.type === "info" && <Info className="h-4 w-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-snug">{action.message}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span className="text-[10px] text-gray-400 font-medium">{formatTime(action.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <div className="h-12 w-12 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Bell className="h-5 w-5 text-gray-300" />
                      </div>
                      <p className="text-sm text-gray-400 italic">No recent activity</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Keep DashboardHeader as a backwards-compatible re-export for the Overview page
interface DashboardHeaderProps {
  userName: string;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function DashboardHeader({ userName, onRefresh, isLoading = false }: DashboardHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col gap-1"
    >
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
        Welcome back, {userName}
      </h1>
      <p className="mt-1 text-sm sm:text-base lg:text-lg font-normal text-gray-500 dark:text-gray-400">
        Here's what's happening with your groups today.
      </p>
    </motion.div>
  );
}
