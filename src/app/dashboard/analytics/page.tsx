"use client";

import { motion } from "framer-motion";
import { Users, FileText, Star, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useRefresh } from "@/context/RefreshContext";
import { useState, useCallback, useEffect, useRef } from "react";
import { fetchDashboard, type DashboardData } from "@/lib/api";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Shift a YYYY-MM string by `delta` months. */
function shiftMonth(yyyymm: string, delta: number): string {
  const [y, m] = yyyymm.split("-").map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** Return today as "YYYY-MM". */
function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** Format "YYYY-MM" to "Mon YYYY" for display (e.g. "Dec 2025"). */
function formatMonthLabel(yyyymm: string): string {
  const [y, m] = yyyymm.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[m - 1]} ${y}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { refreshTrigger, setRefreshing } = useRefresh();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // windowOffset: 0 = current 6 months, -1 = shifted 1 month back, etc.
  const [windowOffset, setWindowOffset] = useState(0);

  // Derive from/to from offset
  const toMonth = shiftMonth(currentMonth(), windowOffset);
  const fromMonth = shiftMonth(toMonth, -5); // 6 months inclusive

  const rangeLabel = `${formatMonthLabel(fromMonth)} – ${formatMonthLabel(toMonth)}`;

  const load = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await fetchDashboard({ from: fromMonth, to: toMonth });
      setDashboard(data);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load analytics data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setRefreshing, fromMonth, toMonth]);

  const lastRefreshProcessed = useRef(refreshTrigger);

  // Load whenever the date window changes
  useEffect(() => {
    load();
  }, [load]);

  // Global refresh trigger handler
  useEffect(() => {
    if (refreshTrigger > lastRefreshProcessed.current) {
      lastRefreshProcessed.current = refreshTrigger;
      load(true);
    }
  }, [refreshTrigger, load]);

  // ── Skeleton ───────────────────────────────────────────────────────────────
  if (loading && !dashboard) {
    return (
      <div className="px-12 py-8 animate-pulse">
        <div className="mb-8 space-y-3">
          <div className="h-9 w-48 bg-gray-200 dark:bg-zinc-800 rounded-md" />
          <div className="h-4 w-96 bg-gray-100 dark:bg-zinc-800/60 rounded-md" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 rounded-md border border-gray-200 dark:border-zinc-800 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-200 dark:bg-zinc-800 rounded-md" />
                <div className="h-3 w-24 bg-gray-200 dark:bg-zinc-800 rounded-md" />
              </div>
              <div className="h-8 w-20 bg-gray-200 dark:bg-zinc-800 rounded-md" />
            </div>
          ))}
        </div>

        {/* Chart Skeleton */}
        <div className="bg-white dark:bg-zinc-900 rounded-md border border-gray-200 dark:border-zinc-800 p-6 shadow-sm animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <div className="h-4 w-40 bg-gray-200 dark:bg-zinc-800 rounded-md" />
              <div className="h-3 w-28 bg-gray-100 dark:bg-zinc-800/60 rounded-md" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-gray-200 dark:bg-zinc-800 rounded-md" />
              <div className="h-8 w-8 bg-gray-200 dark:bg-zinc-800 rounded-md" />
            </div>
          </div>
          <div className="flex items-end gap-4 h-40">
            {[40, 70, 45, 90, 60, 100].map((h, i) => (
              <div key={i} className="flex-1 bg-gray-200 dark:bg-zinc-800/80 rounded-t-sm" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = [
    {
      label: "Total Evaluations",
      value: dashboard?.overview.total_submissions?.toString() ?? "0",
      icon: FileText,
      iconBg: "bg-indigo-50 dark:bg-indigo-900/30",
      iconColor: "text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "Average Score",
      value: dashboard?.overview.avg_overall_score != null
        ? `${Math.round(dashboard.overview.avg_overall_score)}/100`
        : "—",
      icon: Star,
      iconBg: "bg-orange-50 dark:bg-orange-900/30",
      iconColor: "text-orange-500 dark:text-orange-400",
    },
    {
      label: "Completed",
      value: dashboard?.overview.total_completed?.toString() ?? "0",
      icon: CheckCircle2,
      iconBg: "bg-emerald-50 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Active Groups",
      value: dashboard?.overview.total_groups?.toString() ?? "0",
      icon: Users,
      iconBg: "bg-violet-50 dark:bg-violet-900/30",
      iconColor: "text-violet-600 dark:text-violet-400",
    },
  ];

  // ── Chart data ─────────────────────────────────────────────────────────────
  const monthlyData = dashboard?.monthly_submissions ?? [];
  const maxVal = Math.max(...monthlyData.map((d) => d.submissions), 1);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <motion.div
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

      {/* Error Banner */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-md border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 p-4 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white dark:bg-zinc-900 rounded-md border border-gray-200 dark:border-zinc-800 p-5 shadow-sm hover:border-gray-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`h-10 w-10 rounded-md ${s.iconBg} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${s.iconColor}`} />
                </div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{s.label}</p>
              </div>
              <p className="text-3xl font-black text-gray-900 dark:text-white mb-1">{s.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Monthly Submissions Chart */}
      <div className="bg-white dark:bg-zinc-900 rounded-md border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
        {/* Chart Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Submissions Over Time</h2>
            <p className="text-xs text-gray-400 mt-0.5">{rangeLabel}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Submissions</span>
            </div>

            {/* Prev / Next navigation */}
            <div className="flex items-center gap-1 ml-2">
              <button
                id="chart-prev-btn"
                onClick={() => setWindowOffset((o) => o - 1)}
                className="h-7 w-7 flex items-center justify-center rounded-md border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-700 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                aria-label="Previous 6 months"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                id="chart-next-btn"
                onClick={() => setWindowOffset((o) => o + 1)}
                disabled={windowOffset >= 0}
                className="h-7 w-7 flex items-center justify-center rounded-md border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-700 hover:text-gray-700 dark:hover:text-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Next 6 months"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="flex items-end gap-4 h-40">
          {monthlyData.map((d, i) => (
            <motion.div
              key={`${d.year}-${d.month}`}
              className="flex-1 flex flex-col items-center gap-2"
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: 0.05 + i * 0.06, duration: 0.35, ease: "easeOut" }}
              style={{ transformOrigin: "bottom" }}
            >
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                {d.submissions > 0 ? d.submissions : ""}
              </span>
              <div
                className="w-full rounded-t-sm bg-indigo-500 opacity-80 hover:opacity-100 transition-opacity cursor-default"
                style={{ height: `${Math.max((d.submissions / maxVal) * 120, d.submissions > 0 ? 4 : 0)}px` }}
              />
              <span className="text-xs text-gray-400">{d.month}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
