"use client";

import { motion } from "framer-motion";
import { Settings, User, Bell, Shield, Palette, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRefresh } from "@/context/RefreshContext";
import { useState, useCallback, useEffect, useRef } from "react";

const sections = [
  {
    icon: User,
    iconBg: "bg-indigo-50 dark:bg-indigo-900/30",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    title: "Profile",
    description: "Update your name, email, and profile photo.",
  },
  {
    icon: Bell,
    iconBg: "bg-orange-50 dark:bg-orange-900/30",
    iconColor: "text-orange-500 dark:text-orange-400",
    title: "Notifications",
    description: "Choose when and how you receive notifications.",
  },
  {
    icon: Shield,
    iconBg: "bg-emerald-50 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    title: "Security",
    description: "Manage your password, 2FA, and active sessions.",
  },
  {
    icon: Palette,
    iconBg: "bg-violet-50 dark:bg-violet-900/30",
    iconColor: "text-violet-600 dark:text-violet-400",
    title: "Appearance",
    description: "Switch between light and dark mode.",
  },
];

export default function SettingsPage() {
  const { refreshTrigger, setRefreshing } = useRefresh();
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    // Mock fetch for now as data is static
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
    setRefreshing(false);
  }, [setRefreshing]);

  const lastRefreshProcessed = useRef(refreshTrigger);

  useEffect(() => {
    if (refreshTrigger > lastRefreshProcessed.current) {
      lastRefreshProcessed.current = refreshTrigger;
      load(true);
    }
  }, [refreshTrigger, load]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-12 py-8 max-w-2xl"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
          Manage your account and application preferences.
        </p>
      </div>

      {/* Setting Groups */}
      <div className="space-y-3">
        {sections.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.button
              key={s.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="w-full bg-white dark:bg-zinc-900 rounded-md border border-gray-200 dark:border-zinc-800 p-5 flex items-center gap-4 hover:shadow-sm hover:border-indigo-200 transition-all group text-left"
            >
              <div className={`h-10 w-10 rounded-md ${s.iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`h-5 w-5 ${s.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{s.title}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{s.description}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
            </motion.button>
          );
        })}
      </div>

      {/* Danger Zone */}
      <div className="mt-10 rounded-md border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 p-5">
        <h3 className="text-sm font-semibold text-red-700 mb-1">Danger Zone</h3>
        <p className="text-xs text-red-400 mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <Button variant="destructive" className="rounded-md text-sm">
          Delete Account
        </Button>
      </div>
    </motion.div>
  );
}
