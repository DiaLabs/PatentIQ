import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, RefreshCw, Clock, CheckCircle2, AlertCircle, Info, Trash2 } from "lucide-react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { useToast } from "@/context/ToastContext";

interface PageTopBarProps {
  onRefresh?: () => void;
  isLoading?: boolean;
}

/** The right-side icon row (theme toggle, bell, refresh). 
 *  Rendered in the dashboard layout so it persists across ALL pages. */
export function PageTopBar({ onRefresh, isLoading = false }: PageTopBarProps) {
  const { actions, clearActions } = useToast();
  const [showNotifications, setShowNotifications] = useState(false);

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return "Just now";
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="flex items-center gap-2 relative">
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

      {/* Refresh Button */}
      {onRefresh && (
        <motion.button
          onClick={onRefresh}
          disabled={isLoading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center h-10 w-10 rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-zinc-800 dark:hover:text-gray-300 disabled:opacity-60"
        >
          <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
        </motion.button>
      )}
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
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
        Welcome back, {userName} 👋
      </h1>
      <p className="mt-1 text-lg font-normal text-gray-500 dark:text-gray-400">
        Here's what's happening with your groups today.
      </p>
    </motion.div>
  );
}
