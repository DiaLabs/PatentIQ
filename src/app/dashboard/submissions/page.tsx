"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { fetchAllSubmissions, fetchGroups, deleteSubmission, downloadSubmissionFile, retrySubmissionEvaluation, type SubmissionsResponse } from "@/lib/api";
import { Portal } from "@/components/ui/portal";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
import { cn } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { useRefresh } from "@/context/RefreshContext";
import {
  FileText,
  Search,
  ArrowUpDown,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Download,
  AlertCircle,
  Calendar,
  User,
  Layers,
  Trash2,
  RotateCcw,
  FileSpreadsheet,
  CheckSquare,
  Square,
  MousePointer2,
  X,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ReportModal } from "@/components/dashboard/report-modal";
import { ExportExcelModal } from "@/components/dashboard/export-excel-modal";
import { exportGroupExcel } from "@/lib/api";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "COMPLETED", label: "Completed" },
  { value: "PROCESSING", label: "In Progress" },
  { value: "QUEUED", label: "Queued" },
  { value: "PENDING", label: "Pending" },
  { value: "FAILED", label: "Failed" },
  { value: "REJECTED", label: "Rejected" },
  { value: "PAUSED", label: "Paused" },
];

export default function SubmissionsPage() {
  const [data, setData] = useState<SubmissionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groupOptions, setGroupOptions] = useState<{ value: string; label: string }[]>([
    { value: "", label: "All Groups" },
  ]);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [group, setGroup] = useState("");
  const [page, setPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<{ id: string; groupId: string; submitterName: string; uniqueId?: string } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<DOMRect | null>(null);
  // Custom delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // Re-evaluate loading
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const { toast } = useToast();
  const { refreshTrigger, setRefreshing } = useRefresh();

  // Selection State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkOperating, setIsBulkOperating] = useState(false);
  const [bulkActionConfirm, setBulkActionConfirm] = useState<'delete' | 'reevaluate' | null>(null);

  // Close menu on scroll or click outside
  useEffect(() => {
    const close = () => { setOpenMenuId(null); setMenuAnchor(null); };
    window.addEventListener("scroll", close, true);
    
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (openMenuId && !target.closest('.menu-container') && !target.closest('.menu-trigger')) {
        close();
      }
    };
    window.addEventListener("mousedown", handleOutsideClick);
    
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [openMenuId]);

  // Fetch group names for dropdown (once)
  useEffect(() => {
    fetchGroups()
      .then((res) => {
        const opts = [
          { value: "", label: "All Groups" },
          // use group_id as value for reliable API filtering
          ...res.groups.map((g) => ({ value: g.group_id, label: g.name })),
        ];
        setGroupOptions(opts);
      })
      .catch(() => {});
  }, []);

  const load = useCallback(async (isPolling = false, isManual = false) => {
    if (!isPolling && isManual) setRefreshing(true);
    if (!isPolling && !isManual) {
      if (!data) setLoading(true);
      else setTableLoading(true);
    }
    if (!isPolling) setError(null);
    try {
      const res = await fetchAllSubmissions({
        search: search || undefined,
        status: status || undefined,
        // send group_id as the filter param
        group: group || undefined,
        page,
        limit: 15,
      });
      setData(res);
    } catch (e: any) {
      if (!isPolling) setError(e?.message ?? "Failed to load submissions.");
    } finally {
      if (!isPolling) {
        setLoading(false);
        setTableLoading(false);
        setRefreshing(false);
      }
    }
  }, [search, status, group, page, setRefreshing, !!data]);

  // Polling for processing submissions
  useEffect(() => {
    if (!data) return;
    const hasPending = data.submissions.some(
      (s) => s.status === "QUEUED" || s.status === "PROCESSING" || s.status === "PENDING"
    );
    if (hasPending) {
      const interval = setInterval(() => {
        load(true);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [data, load]);

  const lastRefreshProcessed = useRef(refreshTrigger);

  useEffect(() => {
    const timer = setTimeout(() => { load(false); }, 300);
    return () => clearTimeout(timer);
  }, [load]);

  // Listen for global refresh trigger
  useEffect(() => {
    if (refreshTrigger > lastRefreshProcessed.current) {
      lastRefreshProcessed.current = refreshTrigger;
      load(false, true);
    }
  }, [refreshTrigger, load]);

  const toggleSelectAll = () => {
    if (!data) return;
    if (selectedIds.size === data.submissions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.submissions.map(s => s.submission_id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkDelete = async () => {
    setIsBulkOperating(true);
    let successCount = 0;
    const ids = Array.from(selectedIds);
    
    try {
      for (const id of ids) {
        try {
          await deleteSubmission(id);
          successCount++;
        } catch (err) {
          console.error(`Failed to delete ${id}`, err);
        }
      }
      toast(`Successfully deleted ${successCount} submissions`, "success");
      setSelectedIds(new Set());
      setIsSelectionMode(false);
      load();
    } catch (err: any) {
      toast("Bulk delete encountered errors", "error");
    } finally {
      setIsBulkOperating(false);
      setBulkActionConfirm(null);
    }
  };

  const handleBulkReevaluate = async () => {
    setIsBulkOperating(true);
    let successCount = 0;
    const ids = Array.from(selectedIds);

    try {
      for (const id of ids) {
        const sub = data?.submissions.find(s => s.submission_id === id);
        if (!sub) continue;
        try {
          await retrySubmissionEvaluation(sub.group_id, id, true);
          successCount++;
        } catch (err) {
          console.error(`Failed to re-evaluate ${id}`, err);
        }
      }
      toast(`Queued ${successCount} submissions for re-evaluation`, "success");
      setSelectedIds(new Set());
      setIsSelectionMode(false);
      load();
    } catch (err: any) {
      toast("Bulk re-evaluation encountered errors", "error");
    } finally {
      setIsBulkOperating(false);
      setBulkActionConfirm(null);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-6 py-8 min-h-screen relative"
    >
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Submissions</h1>
        <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
          Monitor, evaluate, and manage all student patent submissions.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by student or document..."
            className="w-full h-[42px] pl-10 pr-4 rounded-md border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 transition-all"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {/* Group Dropdown */}
        <CustomSelect
          value={group}
          onChange={(v) => { setGroup(v); setPage(1); }}
          options={groupOptions}
          placeholder="All Groups"
          className="w-40"
        />

        {/* Status Dropdown */}
        <CustomSelect
          value={status}
          onChange={(v) => { setStatus(v); setPage(1); }}
          options={STATUS_OPTIONS}
          placeholder="All Statuses"
          className="w-40"
        />

        {/* Spacer */}
        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setIsSelectionMode(!isSelectionMode);
              setSelectedIds(new Set());
            }}
            className={cn(
              "gap-2 h-[42px] rounded-md font-semibold transition-all border-indigo-100 dark:border-indigo-900/30",
              isSelectionMode 
                ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white border-indigo-600" 
                : "text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/10"
            )}
          >
            {isSelectionMode ? (
              <><X className="h-4 w-4" /> Cancel Selection</>
            ) : (
              <><MousePointer2 className="h-4 w-4" /> Select</>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowExportModal(true)}
            className="rounded-md gap-2 h-[42px]"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Export as Excel
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-md border border-red-200 bg-red-50 dark:bg-red-900/10 p-4 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-md border border-gray-100 dark:border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-800/20">
                {isSelectionMode && (
                  <th className="pl-6 pr-2 py-5 text-left w-10">
                    <button
                      onClick={toggleSelectAll}
                      className="group/cb flex items-center justify-center h-5 w-5 rounded border border-gray-300 dark:border-zinc-700 transition-all hover:border-indigo-500"
                    >
                      {data && selectedIds.size === data.submissions.length && data.submissions.length > 0 ? (
                        <div className="h-full w-full bg-indigo-600 rounded-[3px] flex items-center justify-center text-white">
                          <Check className="h-3 w-3 stroke-[4]" />
                        </div>
                      ) : (
                        <div className="h-3 w-3 rounded-[1px] bg-gray-100 dark:bg-zinc-800 opacity-0 group-hover/cb:opacity-100 transition-opacity" />
                      )}
                    </button>
                  </th>
                )}
                <th className={cn("py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest", isSelectionMode ? "px-2" : "px-6")}>Document & Title</th>
                <th className="px-4 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Unique ID</th>
                <th className="px-4 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Student</th>
                <th className="px-4 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Group</th>
                <th className="px-4 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-4 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1">Score <ArrowUpDown className="h-3 w-3" /></span>
                </th>
                <th className="px-4 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Verdict</th>
                <th className="px-4 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Submitted</th>
                <th className="px-3 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Report</th>
                <th className="px-6 py-5 text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
              {loading || tableLoading ? (
                [...Array(15)].map((_, i) => (
                  <tr key={i} className="animate-pulse border-b border-gray-50 dark:border-zinc-800">
                    <td className="px-8 py-5">
                      <div className="min-w-0">
                        <div className="h-4 w-32 bg-gray-100 dark:bg-zinc-800 rounded mb-2" />
                        <div className="h-3 w-20 bg-gray-50 dark:bg-zinc-800/50 rounded" />
                      </div>
                    </td>
                    <td className="px-6 py-5"><div className="h-4 w-20 bg-gray-100 dark:bg-zinc-800 rounded" /></td>
                    <td className="px-6 py-5"><div className="h-4 w-24 bg-gray-100 dark:bg-zinc-800 rounded" /></td>
                    <td className="px-6 py-5"><div className="h-4 w-20 bg-gray-100 dark:bg-zinc-800 rounded" /></td>
                    <td className="px-6 py-5"><div className="h-6 w-16 bg-gray-100 dark:bg-zinc-800 rounded-full" /></td>
                    <td className="px-6 py-5"><div className="h-6 w-12 bg-gray-100 dark:bg-zinc-800 rounded-md" /></td>
                    <td className="px-6 py-5"><div className="h-4 w-20 bg-gray-100 dark:bg-zinc-800 rounded" /></td>
                    <td className="px-4 py-5"><div className="h-8 w-24 bg-gray-100 dark:bg-zinc-800 rounded-md" /></td>
                    <td className="px-6 py-5 text-right"><div className="h-8 w-8 bg-gray-100 dark:bg-zinc-800 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : data && data.submissions.length > 0 ? (
                data.submissions.map((s) => (
                  <motion.tr
                    layout
                    key={s.submission_id}
                    onClick={() => isSelectionMode && toggleSelect(s.submission_id)}
                    className={cn(
                      "group transition-colors",
                      isSelectionMode ? "cursor-pointer" : "",
                      selectedIds.has(s.submission_id)
                        ? "bg-indigo-50/40 dark:bg-indigo-900/10"
                        : "hover:bg-gray-50/50 dark:hover:bg-zinc-800/20"
                    )}
                  >
                    {isSelectionMode && (
                      <td className="pl-8 pr-2 py-5">
                        <div className={cn(
                          "flex items-center justify-center h-5 w-5 rounded border transition-all",
                          selectedIds.has(s.submission_id)
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                            : "border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 group-hover:border-indigo-400"
                        )}>
                          {selectedIds.has(s.submission_id) && <Check className="h-3 w-3 stroke-[4]" />}
                        </div>
                      </td>
                    )}
                    <td className={cn("py-5", isSelectionMode ? "px-2" : "px-6")}>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[240px]">
                          {s.invention_title || s.file_name}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium uppercase mt-0.5 truncate max-w-[150px]">
                          {s.file_name}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <span className="text-sm font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded">
                        {s.unique_id || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-bold">{s.submitter_name}</span>
                        <span className="text-[10px] text-gray-400 truncate max-w-[150px]">
                          {s.submitter_email}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{s.group_name}</span>
                    </td>
                    <td className="px-4 py-5"><StatusBadge status={s.status} /></td>
                    <td className="px-4 py-5">
                      {s.score != null ? (
                        <div className={cn(
                          "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border",
                          s.score >= 90 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" :
                          s.score >= 80 ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" :
                          s.score >= 70 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" :
                          s.score >= 60 ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20" :
                          "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                        )}>
                          {s.score.toFixed(0)}/100
                        </div>
                      ) : (
                        <span className="text-gray-300 dark:text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-5">
                      {s.evaluation_results?.verdict ? (
                        <span className={cn(
                          "text-[10px] font-bold px-2.5 py-1.5 rounded-md uppercase tracking-wider leading-tight inline-block max-w-[150px] text-center",
                          s.score != null ? (
                            s.score >= 90 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" :
                            s.score >= 80 ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20" :
                            s.score >= 70 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" :
                            s.score >= 60 ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20" :
                            "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                          ) : (
                            s.evaluation_results.verdict.toLowerCase().includes("very strong") ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" :
                            s.evaluation_results.verdict.toLowerCase().includes("strong") ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20" :
                            s.evaluation_results.verdict.toLowerCase().includes("moderate") ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" :
                            s.evaluation_results.verdict.toLowerCase().includes("weak") ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20" :
                            s.evaluation_results.verdict.toLowerCase().includes("reject") ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20" :
                            "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          )
                        )}>
                          {s.evaluation_results.verdict}
                        </span>
                      ) : (
                        <span className="text-gray-300 dark:text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatRelativeTime(s.submitted_at)}
                      </div>
                    </td>
                    {/* Report column — underlined link */}
                    <td className="px-3 py-5">
                      {s.status === "COMPLETED" ? (
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setSelectedReport({ 
                              id: s.submission_id, 
                              groupId: s.group_id,
                              submitterName: s.submitter_name,
                              uniqueId: s.unique_id
                            }); 
                          }}
                          className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 underline underline-offset-2 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                        >
                          View Report
                        </button>
                      ) : (
                        <span className="text-gray-300 dark:text-zinc-600">—</span>
                      )}
                    </td>

                    {/* 3-dot trigger — stores button rect, opens portal menu */}
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (openMenuId === s.submission_id) {
                            setOpenMenuId(null);
                            setMenuAnchor(null);
                          } else {
                            setMenuAnchor(e.currentTarget.getBoundingClientRect());
                            setOpenMenuId(s.submission_id);
                          }
                        }}
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors menu-trigger"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center max-w-sm mx-auto">
                      <div className="h-16 w-16 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                        <Search className="h-8 w-8 text-gray-300" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No results found</h3>
                      <p className="text-sm text-gray-500 mt-2">No submissions match your current filters.</p>
                      <Button
                        variant="link"
                        className="mt-4 text-indigo-600"
                        onClick={() => { setSearch(""); setStatus(""); setGroup(""); setPage(1); }}
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
          <div className="px-8 py-6 border-t border-gray-50 dark:border-zinc-800 flex items-center bg-gray-50/30 dark:bg-zinc-800/20">
            {/* Left Spacer */}
            <div className="flex-1" />

            {/* Center Navigation */}
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 px-3 font-semibold h-9 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 transition-colors"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Page {page}</span>
                <span className="text-sm text-gray-400">of</span>
                <span className="text-sm text-gray-400 font-medium">{data.pagination.total_pages}</span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="gap-2 px-3 font-semibold h-9 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 transition-colors"
                disabled={page === data.pagination.total_pages}
                onClick={() => setPage(page + 1)}
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Right-aligned Stats */}
            <div className="flex-1 flex justify-end">
              <p className="text-sm text-gray-500 font-medium">
                Showing <span className="text-gray-900 dark:text-white font-bold">{Math.min(page * 15, data.pagination.total)}</span>{" "}
                of <span className="text-gray-900 dark:text-white font-bold">{data.pagination.total}</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Portal-rendered context menu — renders at document root, never clips */}
      {openMenuId && menuAnchor && (() => {
        const menuHeight = 200; // Expected height
        const spaceBelow = window.innerHeight - menuAnchor.bottom;
        const showAbove = spaceBelow < menuHeight + 20;
        const activeRow = data?.submissions.find(s => s.submission_id === openMenuId);
        if (!activeRow) return null;
        return (
          <Portal>
            <div
              className="fixed z-50 w-52 bg-white dark:bg-zinc-900 rounded-md border border-gray-100 dark:border-zinc-800 shadow-2xl overflow-hidden py-1 menu-container"
              style={{
                top: showAbove ? menuAnchor.top - menuHeight - 4 : menuAnchor.bottom + 4,
                left: menuAnchor.right - 208,
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <button
                onClick={async () => {
                  setOpenMenuId(null); setMenuAnchor(null);
                  toast(`Preparing ${activeRow.file_name}...`, "info");
                  try {
                    const blob = await downloadSubmissionFile(activeRow.submission_id);
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url; a.download = activeRow.file_name;
                    document.body.appendChild(a); a.click();
                    URL.revokeObjectURL(url); document.body.removeChild(a);
                    toast("Download started", "success");
                  } catch (err: any) { toast("Download failed: " + err.message, "error"); }
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <Download className="h-4 w-4 text-indigo-500" />
                Download Document
              </button>

              {activeRow.status === "COMPLETED" && (
                <button
                  onClick={() => { 
                    setOpenMenuId(null); 
                    setMenuAnchor(null); 
                    setSelectedReport({ 
                      id: activeRow.submission_id, 
                      groupId: activeRow.group_id,
                      submitterName: activeRow.submitter_name,
                      uniqueId: activeRow.unique_id
                    }); 
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <FileText className="h-4 w-4 text-emerald-500" />
                  View Report
                </button>
              )}

              {/* Re-evaluate */}
              <button
                onClick={async () => {
                  setOpenMenuId(null); setMenuAnchor(null);
                  setRetryingId(activeRow.submission_id);
                  try {
                    await retrySubmissionEvaluation(activeRow.group_id, activeRow.submission_id, true);
                    toast("Re-evaluation queued", "success");
                    load();
                  } catch (err: any) { toast("Re-evaluate failed: " + err.message, "error"); }
                  finally { setRetryingId(null); }
                }}
                disabled={retryingId === activeRow.submission_id}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors disabled:opacity-50"
              >
                <RotateCcw className={`h-4 w-4 ${retryingId === activeRow.submission_id ? "animate-spin" : ""}`} />
                Re-evaluate
              </button>

              <div className="h-px bg-gray-100 dark:bg-zinc-800 my-1" />

              <button
                onClick={() => {
                  setOpenMenuId(null); setMenuAnchor(null);
                  setDeleteTarget({ id: activeRow.submission_id, name: activeRow.file_name });
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete Submission
              </button>
            </div>
          </Portal>
        );
      })()}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setIsDeleting(true);
          try {
            await deleteSubmission(deleteTarget.id);
            toast("Submission deleted", "success");
            load();
            setDeleteTarget(null);
          } catch (err: any) {
            toast("Delete failed: " + err.message, "error");
          } finally {
            setIsDeleting(false);
          }
        }}
        isLoading={isDeleting}
        variant="danger"
        title="Delete Submission"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />

      {/* Report Modal */}
      {selectedReport && (
        <ReportModal 
          submissionId={selectedReport.id} 
          groupId={selectedReport.groupId}
          submitterName={selectedReport.submitterName}
          uniqueId={selectedReport.uniqueId}
          onClose={() => setSelectedReport(null)} 
        />
      )}

      {/* Export Excel Modal */}
      <ExportExcelModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        groups={groupOptions.filter(o => o.value !== "")}
        onExport={async (groupId) => {
          toast("Generating Excel report...", "info");
          try {
            const blob = await exportGroupExcel(groupId);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            const groupName = groupOptions.find(o => o.value === groupId)?.label ?? "export";
            a.download = `Evaluation_Report_${groupName}.xlsx`;
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast("Excel report downloaded successfully", "success");
          } catch (err: any) {
            toast("Export failed: " + err.message, "error");
          }
        }}
      />
      {/* Floating Bulk Actions Bar */}
      <AnimatePresence>
        {isSelectionMode && selectedIds.size > 0 && (
          <Portal>
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xl px-4">
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="bg-white dark:bg-zinc-900 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-3 pl-5 flex items-center justify-between gap-4 border border-gray-100 dark:border-zinc-800"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-md bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                    <CheckSquare className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-0.5">
                      {selectedIds.size} Selected
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Actions
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedIds(new Set());
                      setIsSelectionMode(false);
                    }}
                    className="h-9 text-gray-500 font-bold text-xs px-3"
                  >
                    Clear
                  </Button>
                  
                  <div className="w-px h-6 bg-gray-100 dark:bg-zinc-800 mx-1" />

                  <Button
                    onClick={() => setBulkActionConfirm('reevaluate')}
                    disabled={isBulkOperating}
                    className="h-9 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-bold text-xs px-4 shadow-sm shadow-indigo-600/10"
                  >
                    <RotateCcw className={cn("h-3.5 w-3.5", isBulkOperating && bulkActionConfirm === 'reevaluate' && "animate-spin")} />
                    Re-evaluate
                  </Button>

                  <Button
                    onClick={() => setBulkActionConfirm('delete')}
                    disabled={isBulkOperating}
                    className="h-9 gap-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-bold text-xs px-4 shadow-sm shadow-red-600/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </motion.div>
            </div>
          </Portal>
        )}
      </AnimatePresence>

      {/* Bulk Action Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={bulkActionConfirm === 'delete'}
        onClose={() => setBulkActionConfirm(null)}
        onConfirm={handleBulkDelete}
        title="Delete Submissions?"
        description={`Are you sure you want to delete ${selectedIds.size} selected submissions? This action is irreversible.`}
        confirmLabel={isBulkOperating ? "Deleting..." : "Delete All"}
        isLoading={isBulkOperating}
        variant="danger"
      />

      <ConfirmationDialog
        isOpen={bulkActionConfirm === 'reevaluate'}
        onClose={() => setBulkActionConfirm(null)}
        onConfirm={handleBulkReevaluate}
        title="Re-evaluate Submissions?"
        description={`This will re-evaluate all ${selectedIds.size} selected submissions. This might take a while.`}
        confirmLabel={isBulkOperating ? "Queuing..." : "Confirm Re-evaluate"}
        isLoading={isBulkOperating}
        variant="info"
      />
    </motion.div>
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
