"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchAllSubmissions, type RecentSubmission, type SubmissionsResponse } from "@/lib/api";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Search,
  Filter,
  ArrowUpDown,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Eye,
  AlertCircle,
  Calendar,
  User,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function SubmissionsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<SubmissionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & State
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAllSubmissions({
        search: search || undefined,
        status: status || undefined,
        page,
        limit: 10,
      });
      setData(res);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load submissions.");
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <div className="px-12 py-8 bg-white dark:bg-[#0a0a0a] min-h-screen relative">
      <DashboardHeader
        userName={user?.displayName?.split(" ")[0] ?? "Mentor"}
        onRefresh={load}
        isLoading={loading}
      />

      {/* Page Title & Stats */}
      <div className="mt-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Submissions</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Monitor, evaluate, and manage all student patent submissions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-full gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="mt-10 flex flex-col lg:flex-row gap-4 items-center justify-between bg-gray-50/50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800">
        <div className="relative flex-1 w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student or document name..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <select
            className="flex-1 lg:w-48 pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none cursor-pointer"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PROCESSING">In Progress</option>
            <option value="PENDING">Queued</option>
            <option value="FAILED">Failed</option>
          </select>
          
          <Button variant="outline" className="rounded-xl gap-2 h-[42px]">
            <Filter className="h-4 w-4" /> More Filters
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <div className="mt-8 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-800/20">
                <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Document</th>
                <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Student</th>
                <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Group</th>
                <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  Score <ArrowUpDown className="h-3 w-3" />
                </th>
                <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Submitted</th>
                <th className="px-8 py-5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-8 py-6 h-20 bg-gray-50/10"></td>
                  </tr>
                ))
              ) : data && data.submissions.length > 0 ? (
                data.submissions.map((s) => (
                  <motion.tr
                    layout
                    key={s.submission_id}
                    className={`group transition-colors ${
                      selectedSubmission === s.submission_id
                        ? "bg-indigo-50/30 dark:bg-indigo-900/10"
                        : "hover:bg-gray-50/50 dark:hover:bg-zinc-800/20"
                    }`}
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
                          <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[200px]">
                            {s.file_name}
                          </p>
                          <p className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">PDF Document</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                          <User className="h-3 w-3 text-gray-500" />
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{s.submitter_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <Layers className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{s.group_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-6 py-5">
                      {s.score != null ? (
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-900/20 text-xs font-bold text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30">
                          {s.score}/10
                        </div>
                      ) : (
                        <span className="text-gray-300 dark:text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatRelativeTime(s.submitted_at)}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedSubmission(selectedSubmission === s.submission_id ? null : s.submission_id)}
                          className="p-2 rounded-lg hover:bg-white dark:hover:bg-zinc-800 shadow-sm border border-transparent hover:border-gray-100 dark:hover:border-zinc-700 text-gray-500 transition-all"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-white dark:hover:bg-zinc-800 shadow-sm border border-transparent hover:border-gray-100 dark:hover:border-zinc-700 text-gray-500 transition-all">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center max-w-sm mx-auto">
                      <div className="h-16 w-16 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                        <Search className="h-8 w-8 text-gray-300" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No results found</h3>
                      <p className="text-sm text-gray-500 mt-2">
                        We couldn't find any submissions matching your current filters or search query.
                      </p>
                      <Button
                        variant="link"
                        className="mt-4 text-indigo-600"
                        onClick={() => {
                          setSearch("");
                          setStatus("");
                          setPage(1);
                        }}
                      >
                        Clear all filters
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.pagination.total_pages > 1 && (
          <div className="px-8 py-6 border-t border-gray-50 dark:border-zinc-800 flex items-center justify-between bg-gray-50/30 dark:bg-zinc-800/20">
            <p className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-900 dark:text-white">{(page - 1) * 10 + 1}</span> to{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {Math.min(page * 10, data.pagination.total)}
              </span>{" "}
              of <span className="font-semibold text-gray-900 dark:text-white">{data.pagination.total}</span> results
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl h-9 w-9 p-0"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {[...Array(data.pagination.total_pages)].map((_, i) => (
                <Button
                  key={i + 1}
                  variant={page === i + 1 ? "default" : "outline"}
                  size="sm"
                  className={`rounded-xl h-9 w-9 p-0 font-semibold ${
                    page === i + 1 ? "bg-indigo-600 hover:bg-indigo-700" : ""
                  }`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl h-9 w-9 p-0"
                disabled={page === data.pagination.total_pages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Expanded Details Drawer/Overlay (Simplified for now) */}
      <AnimatePresence>
        {selectedSubmission && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="fixed inset-y-0 right-0 w-full max-w-lg bg-white dark:bg-zinc-900 shadow-2xl border-l border-gray-100 dark:border-zinc-800 z-50 p-10 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Submission Details</h2>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            {data?.submissions.find((s) => s.submission_id === selectedSubmission) && (
              <div className="space-y-8">
                {/* Header Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Overall Score</p>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {data.submissions.find((s) => s.submission_id === selectedSubmission)?.score ?? "N/A"}/10
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                    <StatusBadge status={data.submissions.find((s) => s.submission_id === selectedSubmission)!.status} />
                  </div>
                </div>

                {/* Info List */}
                <div className="space-y-4">
                  <DetailItem icon={<User />} label="Student" value={data.submissions.find((s) => s.submission_id === selectedSubmission)!.submitter_name} />
                  <DetailItem icon={<Layers />} label="Group" value={data.submissions.find((s) => s.submission_id === selectedSubmission)!.group_name} />
                  <DetailItem icon={<FileText />} label="File Name" value={data.submissions.find((s) => s.submission_id === selectedSubmission)!.file_name} />
                  <DetailItem icon={<Calendar />} label="Submitted At" value={new Date(data.submissions.find((s) => s.submission_id === selectedSubmission)!.submitted_at * 1000).toLocaleString()} />
                </div>

                {/* Evaluation Results */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Evaluation Summary</h3>
                  {data.submissions.find((s) => s.submission_id === selectedSubmission)?.evaluation_results ? (
                    <div className="p-6 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30">
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
                        "{data.submissions.find((s) => s.submission_id === selectedSubmission)!.evaluation_results.verdict}"
                      </p>
                      <Link
                        href={`/dashboard/groups/${data.submissions.find((s) => s.submission_id === selectedSubmission)!.group_id}`}
                        className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        View Full Report <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 text-sm">
                      <AlertCircle className="h-5 w-5" />
                      Evaluation is still in progress or failed.
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-zinc-800 flex gap-3">
                  <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-6 font-bold text-base shadow-lg shadow-indigo-200 dark:shadow-none">
                    Download PDF
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 p-2">
      <div className="h-9 w-9 rounded-full bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-gray-400 shrink-0 [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{value}</p>
      </div>
    </div>
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
