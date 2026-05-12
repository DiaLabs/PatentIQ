"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchDashboard, deleteSubmission, downloadSubmissionFile, type DashboardData } from "@/lib/api";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
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
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function OverviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDashboard(await fetchDashboard());
    } catch (e: any) {
      setError(e?.message ?? "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="px-12 py-8 bg-white dark:bg-[#0a0a0a] min-h-screen relative">
      {/* Dashboard Header */}
      <DashboardHeader
        userName={mounted ? (user?.displayName?.split(" ")[0] ?? "Mentor") : "Mentor"}
        onRefresh={load}
        isLoading={loading}
      />

      {/* Error Banner */}
      {error && (
        <div className="mt-6 flex items-center gap-3 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 p-4 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Main Content: Recent Groups */}
      <div className="mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-7 border-b border-gray-50 dark:border-zinc-800">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recent Groups
              </h2>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                Track your evaluation groups and submission progress
              </p>
            </div>
            <Link
              href="/dashboard/groups"
              className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors group"
            >
              View all <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Content */}
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-50 dark:bg-zinc-800/50" />
              ))}
            </div>
          ) : dashboard && (dashboard.active_groups?.length ?? 0) > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30">
                    <th className="px-8 py-4 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      GROUP
                    </th>
                    <th className="px-6 py-4 text-center text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      COMPLETED
                    </th>
                    <th className="px-6 py-4 text-center text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      PENDING
                    </th>
                    <th className="px-8 py-4 text-right text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      AVG SCORE
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
                  {dashboard.active_groups?.map((g) => (
                    <tr key={g.group_id} className="hover:bg-gray-50/80 dark:hover:bg-zinc-800/30 transition-colors group">
                      <td className="px-8 py-6 font-semibold text-gray-900 dark:text-white">
                        <Link
                          href={`/dashboard/groups/${g.group_id}`}
                          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          {g.name}
                        </Link>
                      </td>
                      <td className="px-6 py-6 text-center text-gray-600 dark:text-gray-300 font-medium">
                        {g.completed}
                      </td>
                      <td className="px-6 py-6 text-center text-gray-600 dark:text-gray-300 font-medium">
                        {g.pending}
                      </td>
                      <td className="px-8 py-6 text-right">
                        {g.avg_score != null ? (
                          <span className="inline-flex items-center rounded-full bg-[#eeeffe] dark:bg-indigo-900/30 px-4 py-1.5 text-xs font-bold text-[#5c59e8] dark:text-indigo-300">
                            {g.avg_score}/100
                          </span>
                        ) : (
                          <span className="text-gray-300 dark:text-zinc-600 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-8 py-20 text-center">
              <div className="mx-auto h-16 w-16 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No groups yet</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-6">
                Create your first evaluation group to start tracking submissions and scores.
              </p>
              <Link href="/dashboard/groups">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-full font-semibold">
                  Create First Group
                </Button>
              </Link>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Recent Submissions Card */}
      <div className="mt-12 lg:grid lg:grid-cols-3 gap-8 items-start">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none relative"
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
                          <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
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
                          <div className="inline-flex items-center px-2 py-0.5 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-[11px] font-bold text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30">
                            {s.score}/10
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
          className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none p-8"
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

    </div>
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
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

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
      a.download = fileName; // Use original filename
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
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isDeleting}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop to close on click outside */}
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-xl z-50 py-1.5 overflow-hidden"
            >
              <button
                onClick={() => router.push(`/dashboard/submissions?id=${submissionId}`)}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <Eye className="h-4 w-4 text-indigo-500" /> View Details
              </button>
              <button
                onClick={handleDownload}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <Download className="h-4 w-4 text-blue-500" /> Download PDF
              </button>
              <div className="h-px bg-gray-50 dark:bg-zinc-800 my-1" />
              <button
                onClick={() => setIsDeleteDialogOpen(true)}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" /> Delete Submission
              </button>
            </motion.div>
          </>
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
      className="flex items-center gap-4 p-4 rounded-xl border border-gray-50 dark:border-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700 hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-all group"
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
