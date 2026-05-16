"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchDashboard, deleteSubmission, downloadSubmissionFile, type DashboardData } from "@/lib/api";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { useRefresh } from "@/context/RefreshContext";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  Users,
  AlertCircle,
  ArrowRight,
  FileText,
  MoreVertical,
  Plus,
  LinkIcon,
  Download,
  Upload,
  Eye,
  Trash2,
  TrendingUp,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function OverviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { refreshTrigger, setRefreshing } = useRefresh();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const load = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    setLoading(true);
    setError(null);
    try {
      setDashboard(await fetchDashboard());
    } catch (e: any) {
      setError(e?.message ?? "Failed to load dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [setRefreshing]);

  useEffect(() => { load(); }, [load]);

  // Listen for global refresh trigger
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
      className="px-12 py-8 min-h-screen relative"
    >
      {/* Welcome greeting — Overview only */}
      <DashboardHeader
        userName={mounted ? (user?.displayName?.split(" ")[0] ?? "Mentor") : "Mentor"}
      />

      {/* Error Banner */}
      {error && (
        <div className="mt-6 flex items-center gap-3 rounded-md border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 p-4 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Middle Section: Performance & Groups */}
      <div className="mt-12 lg:grid lg:grid-cols-3 gap-8 items-stretch">        {/* Left: Global Performance (2/3) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-md border border-gray-100 dark:border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none p-8 flex flex-col h-full"
        >
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Global Performance</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">System-wide evaluation overview</p>
            </div>
            <TrendingUp className="h-5 w-5 text-indigo-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1">
            {/* Avg Score Chart/Stat */}
            <div className="flex flex-col items-center justify-center p-6 rounded-md bg-gray-50/30 dark:bg-zinc-800/20 border border-gray-100/50 dark:border-zinc-800/50">
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Avg Overall Score</p>
              <div className="relative h-28 w-28 flex items-center justify-center">
                <svg className="h-full w-full -rotate-90">
                  <circle cx="56" cy="56" r="50" className="stroke-gray-100 dark:stroke-zinc-800/50 fill-none" strokeWidth="8" />
                  <motion.circle 
                    cx="56" cy="56" r="50" 
                    className="stroke-indigo-500 fill-none" 
                    strokeWidth="8" 
                    strokeDasharray="314"
                    initial={{ strokeDashoffset: 314 }}
                    animate={{ strokeDashoffset: 314 - (314 * (dashboard?.overview.avg_overall_score ?? 0)) / 100 }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-gray-900 dark:text-white">
                    {loading ? "—" : Math.round(dashboard?.overview.avg_overall_score ?? 0)}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Percent</span>
                </div>
              </div>
            </div>

            {/* Total Submissions */}
            <div className="flex flex-col items-center justify-center p-6 rounded-md bg-gray-50/30 dark:bg-zinc-800/20 border border-gray-100/50 dark:border-zinc-800/50">
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Total Submissions</p>
              <div className="text-center">
                <span className="text-5xl font-black text-indigo-600 dark:text-indigo-400">
                  {loading ? "—" : dashboard?.overview.total_submissions}
                </span>
                <p className="mt-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 max-w-[140px] mx-auto leading-tight">
                  Evaluated student documents across all groups
                </p>
              </div>
            </div>

            {/* Volume Stats */}
            <div className="flex flex-col gap-4">
              <div className="flex-1 p-5 rounded-md bg-emerald-50/30 dark:bg-emerald-900/10 border border-emerald-100/30 dark:border-emerald-900/20">
                <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Active Groups</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-gray-900 dark:text-white">
                    {loading ? "—" : dashboard?.overview.total_groups}
                  </span>
                  <span className="text-xs text-emerald-600 font-bold">Cohorts</span>
                </div>
              </div>
              <div className="flex-1 p-5 rounded-md bg-red-50/30 dark:bg-red-900/10 border border-red-100/30 dark:border-red-900/20">
                <p className="text-[9px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest mb-1">Flagged Items</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-gray-900 dark:text-white">
                    {loading ? "—" : dashboard?.overview.total_rejected}
                  </span>
                  <span className="text-xs text-red-500 font-bold uppercase tracking-tighter">Action Required</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right: Recent Groups (1/3) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white dark:bg-zinc-900 rounded-md border border-gray-100 dark:border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none p-8 h-full flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Groups</h2>
            <Link href="/dashboard/groups" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="h-16 animate-pulse rounded-md bg-gray-50 dark:bg-zinc-800/50" />
              ))
            ) : dashboard?.active_groups?.map((g, i) => {
              const colors = [
                "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
                "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
                "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
                "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
              ];
              const colorClass = colors[i % colors.length];
              
              return (
                <Link
                  key={g.group_id}
                  href={`/dashboard/groups/${g.group_id}`}
                  className="flex items-center gap-4 p-4 rounded-md border border-gray-50 dark:border-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all group"
                >
                  <div className={`h-10 w-10 rounded-md flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Layers className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">{g.name}</h4>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase mt-0.5">
                      {g.completed} Completed
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                      {g.avg_score?.toFixed(0)}%
                    </p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Avg Score</p>
                  </div>
                </Link>
              );
            })}
            {(!dashboard?.active_groups || dashboard.active_groups.length === 0) && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-50">
                <Layers className="h-8 w-8 text-gray-300 mb-3" />
                <p className="text-xs font-bold text-gray-400 uppercase">No active groups</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Recent Submissions Card */}
      <div className="mt-12 lg:grid lg:grid-cols-3 gap-8 items-start">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-md border border-gray-100 dark:border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none relative"
        >
          <div className="px-8 py-7 flex items-center justify-between border-b border-gray-50 dark:border-zinc-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Submissions</h2>
            <Link href="/dashboard/submissions" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              View all
            </Link>
          </div>

          {/* Table */}
          <div className="pb-24">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50 dark:border-zinc-800 bg-gray-50/20 dark:bg-zinc-800/10">
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Document</th>
                  <th className="px-4 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Student</th>
                  <th className="px-4 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Group</th>
                  <th className="px-4 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-4 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Score</th>
                  <th className="px-4 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Submitted</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={7} className="px-6 py-6 h-16 bg-gray-50/30"></td>
                    </tr>
                  ))
                ) : dashboard && (dashboard.recent_submissions?.length ?? 0) > 0 ? (
                  dashboard.recent_submissions?.map((s) => (
                    <tr key={s.submission_id} className="group hover:bg-gray-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-md bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
                            <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white max-w-[140px] truncate">
                            {s.file_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">{s.submitter_name}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{s.group_name}</span>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="px-4 py-4">
                        {s.score != null ? (
                          <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-900/20 text-[11px] font-bold text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30">
                            {s.score.toFixed(0)}/100
                          </div>
                        ) : (
                          <span className="text-gray-300 dark:text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-[11px] text-gray-400 font-medium">
                          {formatRelativeTime(s.submitted_at)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <SubmissionActionMenu 
                          submissionId={s.submission_id} 
                          fileName={s.file_name}
                          onRefresh={load} 
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-8 py-12 text-center text-gray-400 italic">
                      No recent submissions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Quick Actions - Takes 1/3 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white dark:bg-zinc-900 rounded-md border border-gray-100 dark:border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none p-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-8">
            Quick Actions
          </h2>
          <div className="space-y-4">
            <QuickActionItem
              icon={<FileText className="h-5 w-5" />}
              title="View All Submissions"
              subtitle="Monitor all student work"
              color="text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
              href="/dashboard/submissions"
            />
            <QuickActionItem
              icon={<Users className="h-5 w-5" />}
              title="View All Groups"
              subtitle="Manage your evaluation groups"
              color="text-blue-600 bg-blue-50 dark:bg-blue-900/20"
              href="/dashboard/groups"
            />
            <QuickActionItem
              icon={<Plus className="h-5 w-5" />}
              title="Create New Group"
              subtitle="Launch a new evaluation cycle"
              color="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
              href="/dashboard/groups"
            />
            <QuickActionItem
              icon={<Download className="h-5 w-5" />}
              title="Export All Reports"
              subtitle="Download detailed analysis"
              color="text-orange-600 bg-orange-50 dark:bg-orange-900/20"
              href="/dashboard/groups"
            />
          </div>
        </motion.div>
      </div>

    </motion.div>
  );
}

/** Helper Components */

function SubmissionActionMenu({
  submissionId,
  fileName,
  onRefresh,
}: {
  submissionId: string;
  fileName: string;
  onRefresh: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  // Close on outside click or scroll
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const scrollHandler = () => setIsOpen(false);

    document.addEventListener("mousedown", handler);
    window.addEventListener("scroll", scrollHandler, true);
    return () => {
      document.removeEventListener("mousedown", handler);
      window.removeEventListener("scroll", scrollHandler, true);
    };
  }, [isOpen]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteSubmission(submissionId);
      toast("Submission deleted successfully", "success");
      setIsDeleteDialogOpen(false);
      onRefresh();
    } catch (e: any) {
      toast(e.message || "Failed to delete submission", "error");
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  const handleDownload = async () => {
    toast(`Preparing ${fileName}...`, "info");
    try {
      const blob = await downloadSubmissionFile(submissionId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast("Download started", "success");
    } catch (e: any) {
      toast("Download failed: " + e.message, "error");
    } finally {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isDeleting}
        className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-md border border-gray-100 dark:border-zinc-800 shadow-xl z-50 py-1.5 overflow-hidden"
          >
            <button
              onClick={() => router.push(`/dashboard/submissions?id=${submissionId}`)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-left"
            >
              <Eye className="h-4 w-4 text-indigo-500" /> View Details
            </button>
            <button
              onClick={handleDownload}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-left"
            >
              <Download className="h-4 w-4 text-blue-500" /> Download PDF
            </button>
            <div className="h-px bg-gray-50 dark:bg-zinc-800 my-1" />
            <button
              onClick={() => setIsDeleteDialogOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left"
            >
              <Trash2 className="h-4 w-4" /> Delete Submission
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="danger"
        title="Delete Submission"
        description={`Are you sure you want to delete "${fileName}"? This action cannot be undone and all evaluation data will be lost.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </div>
  );
}

function QuickActionItem({
  icon,
  title,
  subtitle,
  color,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-4 rounded-md border border-gray-50 dark:border-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700 hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-all group"
    >
      <div className={`h-11 w-11 rounded-full flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
          {title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{subtitle}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}

function formatRelativeTime(timestamp: number) {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
