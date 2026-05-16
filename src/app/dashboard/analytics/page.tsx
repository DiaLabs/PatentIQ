"use client";

import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, FileText, Star, CheckCircle2 } from "lucide-react";
import { useRefresh } from "@/context/RefreshContext";
import { useState, useCallback, useEffect } from "react";

const stats = [
  { label: "Total Evaluations", value: "128", icon: FileText, iconBg: "bg-indigo-50 dark:bg-indigo-900/30", iconColor: "text-indigo-600 dark:text-indigo-400", trend: "+12%", trendColor: "text-emerald-600 dark:text-emerald-400" },
  { label: "Average Score", value: "76/100", icon: Star, iconBg: "bg-orange-50 dark:bg-orange-900/30", iconColor: "text-orange-500 dark:text-orange-400", trend: "+5%", trendColor: "text-emerald-600 dark:text-emerald-400" },
  { label: "Completed", value: "104", icon: CheckCircle2, iconBg: "bg-emerald-50 dark:bg-emerald-900/30", iconColor: "text-emerald-600 dark:text-emerald-400", trend: "+8%", trendColor: "text-emerald-600 dark:text-emerald-400" },
  { label: "Active Groups", value: "12", icon: Users, iconBg: "bg-violet-50 dark:bg-violet-900/30", iconColor: "text-violet-600 dark:text-violet-400", trend: "+2", trendColor: "text-emerald-600 dark:text-emerald-400" },
];

const monthlyData = [
  { month: "Jan", submissions: 8 },
  { month: "Feb", submissions: 14 },
  { month: "Mar", submissions: 11 },
  { month: "Apr", submissions: 20 },
  { month: "May", submissions: 18 },
  { month: "Jun", submissions: 24 },
  { month: "Jul", submissions: 16 },
];

const maxVal = Math.max(...monthlyData.map((d) => d.submissions));

export default function AnalyticsPage() {
  const { refreshTrigger, setRefreshing } = useRefresh();
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    // Mock fetch for now as data is static
    await new Promise(resolve => setTimeout(resolve, 800));
    setLoading(false);
    setRefreshing(false);
  }, [setRefreshing]);

  useEffect(() => {
    if (refreshTrigger > 0) {
      load(true);
    }
  }, [refreshTrigger, load]);

  return (
    <motion.div 
      key={refreshTrigger}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-12 py-8"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
          Track evaluation trends and submission performance over time.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white dark:bg-zinc-900 rounded-md border border-gray-200 dark:border-zinc-800 p-5 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`h-10 w-10 rounded-md ${s.iconBg} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${s.iconColor}`} />
                </div>
                <p className="text-xs font-medium text-gray-500">{s.label}</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{s.value}</p>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                <span className={`text-xs font-medium ${s.trendColor}`}>{s.trend} this month</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Chart placeholder */}
      <div className="bg-white dark:bg-zinc-900 rounded-md border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Submissions Over Time</h2>
            <p className="text-xs text-gray-400 mt-0.5">Monthly submission volume</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
            <span className="text-xs text-gray-500">Submissions</span>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="flex items-end gap-4 h-40">
          {monthlyData.map((d, i) => (
            <motion.div
              key={d.month}
              className="flex-1 flex flex-col items-center gap-2"
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.4, ease: "easeOut" }}
              style={{ transformOrigin: "bottom" }}
            >
              <span className="text-xs font-semibold text-gray-500">{d.submissions}</span>
              <div
                className="w-full rounded-t-sm bg-indigo-500 opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                style={{ height: `${(d.submissions / maxVal) * 120}px` }}
              />
              <span className="text-xs text-gray-400">{d.month}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
