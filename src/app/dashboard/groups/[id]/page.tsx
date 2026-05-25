"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  fetchGroupDetails,
  deleteGroup,
  fetchGroups,
  exportGroupExcel,
  deleteSubmission,
  downloadSubmissionFile,
  retrySubmissionEvaluation,
  type GroupDetails,
  type SubmissionStatus,
  type Submission,
} from "@/lib/api";
import { useRefresh } from "@/context/RefreshContext";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  AlertCircle,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  X,
  FileText,
  Calendar,
  ShieldCheck,
  Search,
  Layers,
  MoreVertical,
  Download,
  RotateCcw,
  CheckSquare,
  Square,
  MousePointer2,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Portal } from "@/components/ui/portal";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { ReportModal } from "@/components/dashboard/report-modal";
import { useToast } from "@/context/ToastContext";
import { CustomSelect } from "@/components/ui/custom-select";
import { Button } from "@/components/ui/button";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "COMPLETED", label: "Completed" },
  { value: "PROCESSING", label: "In Progress" },
  { value: "QUEUED", label: "Queued" },
  { value: "FAILED", label: "Failed" },
];

const GROUP_COLORS = [
  { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-600 dark:text-indigo-400" },
  { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-600 dark:text-emerald-400" },
  { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-600 dark:text-orange-400" },
  { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-600 dark:text-red-400" },
  { bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-600 dark:text-violet-400" },
  { bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-600 dark:text-cyan-400" },
];

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;
  const { toast } = useToast();
  const { refreshTrigger, setRefreshing } = useRefresh();
  const { refreshProfile } = useAuth();

  const [data, setData] = useState<GroupDetails | null>(null);
  const dataRef = useRef<GroupDetails | null>(null);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [groupIndex, setGroupIndex] = useState(0);
  
  // Action Menu State
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{ top: number; bottom: number; right: number } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeletingSubmission, setIsDeletingSubmission] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [selectedSubmissionReport, setSelectedSubmissionReport] = useState<{ id: string; submitterName: string; uniqueId?: string } | null>(null);

  // Selection State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkOperating, setIsBulkOperating] = useState(false);
  const [bulkActionConfirm, setBulkActionConfirm] = useState<'delete' | 'reevaluate' | null>(null);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const mobileActionsRef = useRef<HTMLDivElement>(null);

  const groupColor = useMemo(() => {
    return GROUP_COLORS[groupIndex % GROUP_COLORS.length];
  }, [groupIndex]);

  useEffect(() => {
    fetchGroups().then(res => {
      const idx = res.groups.findIndex(g => g.group_id === groupId);
      if (idx !== -1) setGroupIndex(idx);
    }).catch(console.error);
  }, [groupId]);

  const load = useCallback(async (isPolling = false, isManual = false) => {
    if (!isPolling && isManual) setRefreshing(true);
    if (!isPolling && !isManual) {
      // If first load, show full page skeleton
      if (!dataRef.current) setLoading(true);
      // Otherwise only show table skeleton
      else setTableLoading(true);
    }
    if (!isPolling) setError(null);
    try {
      const result = await fetchGroupDetails(groupId, {
        page,
        limit: 15,
        status: statusFilter || undefined,
        search: search || undefined,
      });

      // Detect paused submissions to fire modal event in real-time
      const pausedSubIds = result.submissions
        .filter(s => s.status === 'FAILED' && s.last_error?.includes('Evaluation paused'))
        .map(s => s.submission_id);
      
      if (pausedSubIds.length > 0) {
        let dismissedIds: string[] = [];
        try {
          dismissedIds = JSON.parse(localStorage.getItem("dismissed-paused-submissions") || "[]");
        } catch (err) {}
        
        const hasNewPausedSub = pausedSubIds.some(id => !dismissedIds.includes(id));
        if (hasNewPausedSub) {
          window.dispatchEvent(new CustomEvent('insufficient-credits-modal', { 
            detail: { pausedSubIds } 
          }));
        }
      }

      // Automatically refresh mentor profile credits if any submission status has changed
      const currentData = dataRef.current;
      if (currentData) {
        let statusChanged = false;
        for (const newSub of result.submissions) {
          const oldSub = currentData.submissions.find(s => s.submission_id === newSub.submission_id);
          if (oldSub && oldSub.status !== newSub.status) {
            statusChanged = true;
            break;
          }
        }
        if (statusChanged) {
          refreshProfile();
        }
      }

      setData(result);
    } catch (e: any) {
      if (!isPolling) setError(e?.message ?? "Failed to load group.");
    } finally {
      if (!isPolling) {
        setLoading(false);
        setTableLoading(false);
        setRefreshing(false);
      }
    }
  }, [groupId, page, statusFilter, search, setRefreshing, refreshProfile]);

  // Polling for processing submissions in real-time
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
    const timer = setTimeout(() => { load(); }, 300);
    return () => clearTimeout(timer);
  }, [load]);

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

  // Listen for global refresh trigger
  useEffect(() => {
    if (refreshTrigger > lastRefreshProcessed.current) {
      lastRefreshProcessed.current = refreshTrigger;
      load(false, true);
    }
  }, [refreshTrigger, load]);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      await deleteGroup(groupId);
      toast("Group deleted successfully", "success");
      router.push("/dashboard/groups");
    } catch (e: any) {
      toast(e?.message ?? "Failed to delete group", "error");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [groupId, router, toast]);

  const handleCopy = () => {
    if (!data) return;
    const link = `${window.location.origin}/submit?token=${data.group.group_id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast("Link copied to clipboard", "info");
    setTimeout(() => setCopied(false), 2000);
  };

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

    // Remove from dismissed-paused-submissions if present so modal can fire again
    try {
      const dismissed = JSON.parse(localStorage.getItem("dismissed-paused-submissions") || "[]");
      const updated = dismissed.filter((dId: string) => !ids.includes(dId));
      localStorage.setItem("dismissed-paused-submissions", JSON.stringify(updated));
    } catch (e) {}

    try {
      for (const id of ids) {
        try {
          await retrySubmissionEvaluation(groupId, id, true);
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
      className="px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 min-h-screen space-y-12"
    >
      {/* Page Header - Matching Groups Page Style */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Groups</h1>
        <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
          Organize and manage your evaluation groups.
        </p>
      </div>

      {/* Group Detail Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 lg:gap-12"
      >
        <div className="flex items-start gap-4 sm:gap-6">
          <div className={cn("h-14 w-14 sm:h-16 sm:w-16 rounded-md flex items-center justify-center shrink-0 shadow-sm", groupColor.bg)}>
            <Layers className={cn("h-7 w-7 sm:h-8 sm:w-8", groupColor.text)} />
          </div>
          <div className="space-y-2 sm:space-y-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 dark:text-white tracking-tight leading-none">
                {loading ? "..." : data?.group.name}
              </h2>
              {data && (
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-full",
                  data.group.is_expired 
                    ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10" 
                    : "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10"
                )}>
                  {data.group.is_expired ? "Expired" : "Active"}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2.5">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Expires on</span>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                  {data ? new Date(data.group.expires_at).toLocaleDateString() : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Submission Gateway */}
        <div className="w-full lg:max-w-md lg:w-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500">Submission Gateway</span>
            <ExternalLink className="h-3.5 w-3.5 text-gray-300" />
          </div>
          <p className="text-xs font-mono text-gray-500 dark:text-gray-400 break-all leading-relaxed mb-4 pb-2 border-b border-gray-100 dark:border-zinc-800">
            {data ? `${window.location.origin}/submit?token=${data.group.group_id}` : "Link not generated"}
          </p>
          <Button
            onClick={handleCopy}
            variant="outline"
            className="w-full gap-2 font-bold text-xs rounded-md shadow-sm"
          >
            {copied ? (
              <><Check className="h-3.5 w-3.5 text-emerald-500" /> Copied!</>
            ) : (
              <><Copy className="h-3.5 w-3.5" /> Copy Public Link</>
            )}
          </Button>
        </div>
      </motion.div>

        {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-6 border-t border-gray-100 dark:border-zinc-800/50">
        {/* Search */}
        <div className="relative w-full sm:flex-1 sm:min-w-[200px] sm:max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by student..."
            className="w-full h-[42px] pl-10 pr-4 rounded-md border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 transition-all"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-2 w-full">
          <CustomSelect
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(1); }}
            options={STATUS_OPTIONS}
            placeholder="All Statuses"
            className="w-[130px] sm:w-40 flex-1"
          />

          {/* Select button */}
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
              <><X className="h-4 w-4" /> <span className="hidden sm:inline">Cancel</span></>
            ) : (
              <><MousePointer2 className="h-4 w-4" /> <span className="hidden sm:inline">Select</span></>
            )}
          </Button>

          {/* Desktop: Show Export + Delete directly */}
          <Button
            variant="outline"
            onClick={async () => {
              toast("Generating Excel report...", "info");
              try {
                const blob = await exportGroupExcel(groupId);
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `Evaluation_Report_${data?.group.name}.xlsx`;
                document.body.appendChild(a);
                a.click();
                URL.revokeObjectURL(url);
                document.body.removeChild(a);
                toast("Excel report downloaded successfully", "success");
              } catch (err: any) {
                toast("Export failed: " + err.message, "error");
              }
            }}
            className="hidden sm:flex gap-2 h-[42px] rounded-md font-semibold"
          >
            <FileText className="h-4 w-4 text-emerald-600" />
            Export as Excel
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowDeleteConfirm(true)}
            className="hidden sm:flex gap-2 h-[42px] rounded-md border-red-100 dark:border-red-900/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 font-semibold"
          >
            <Trash2 className="h-4 w-4" />
            Delete Group
          </Button>

          {/* Mobile: More actions dropdown */}
          <div className="relative sm:hidden ml-auto shrink-0" ref={mobileActionsRef}>
            <Button
              variant="outline"
              onClick={() => setShowMobileActions(!showMobileActions)}
              className="h-[42px] w-[42px] p-0 flex items-center justify-center rounded-md font-semibold"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
            {showMobileActions && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowMobileActions(false)} />
                <div className="absolute right-0 top-full mt-1 z-30 bg-white dark:bg-zinc-900 rounded-md border border-gray-100 dark:border-zinc-800 shadow-lg overflow-hidden w-44">
                  <button
                    onClick={async () => {
                      setShowMobileActions(false);
                      toast("Generating Excel report...", "info");
                      try {
                        const blob = await exportGroupExcel(groupId);
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `Evaluation_Report_${data?.group.name}.xlsx`;
                        document.body.appendChild(a);
                        a.click();
                        URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                        toast("Excel report downloaded successfully", "success");
                      } catch (err: any) {
                        toast("Export failed: " + err.message, "error");
                      }
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <FileText className="h-4 w-4 text-emerald-600" /> Export Excel
                  </button>
                  <button
                    onClick={() => { setShowMobileActions(false); setShowDeleteConfirm(true); }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" /> Delete Group
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-md border border-gray-100 dark:border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-800/20">
                {isSelectionMode && (
                  <th className="pl-8 pr-2 py-5 text-left w-10">
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
                <th className={cn("py-5 text-left text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest", isSelectionMode ? "px-2" : "px-6")}>Document & Title</th>
                <th className="px-4 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Unique ID</th>
                <th className="px-4 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Student</th>
                <th className="px-4 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Status</th>
                <th className="px-4 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Score</th>
                <th className="px-4 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Verdict</th>
                <th className="px-4 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Submitted</th>
                <th className="px-3 py-5 text-left text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Report</th>
                <th className="px-4 py-5 text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
              {loading || tableLoading ? (
                [...Array(15)].map((_, i) => (
                  <tr key={i} className="animate-pulse border-b border-gray-50 dark:border-zinc-800">
                    <td className="px-6 py-5">
                      <div className="min-w-0">
                        <div className="h-4 w-32 bg-gray-100 dark:bg-zinc-800 rounded mb-2" />
                        <div className="h-3 w-20 bg-gray-50 dark:bg-zinc-800/50 rounded" />
                      </div>
                    </td>
                    <td className="px-4 py-5"><div className="h-4 w-20 bg-gray-100 dark:bg-zinc-800 rounded" /></td>
                    <td className="px-4 py-5"><div className="h-4 w-24 bg-gray-100 dark:bg-zinc-800 rounded" /></td>
                    <td className="px-4 py-5"><div className="h-6 w-16 bg-gray-100 dark:bg-zinc-800 rounded-full" /></td>
                    <td className="px-4 py-5"><div className="h-6 w-12 bg-gray-100 dark:bg-zinc-800 rounded-md" /></td>
                    <td className="px-4 py-5"><div className="h-4 w-20 bg-gray-100 dark:bg-zinc-800 rounded" /></td>
                    <td className="px-4 py-5"><div className="h-4 w-20 bg-gray-100 dark:bg-zinc-800 rounded" /></td>
                    <td className="px-3 py-5"><div className="h-8 w-24 bg-gray-100 dark:bg-zinc-800 rounded-md" /></td>
                    <td className="px-4 py-5 text-right"><div className="h-8 w-8 bg-gray-100 dark:bg-zinc-800 rounded ml-auto" /></td>
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
                          {s.invention_title || s.file_name || `Submission_${s.submission_id.slice(0, 8)}`}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium uppercase mt-0.5 truncate max-w-[200px]">
                          {s.file_name}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded">
                        {s.unique_id || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-bold">{s.submitter_name}</span>
                        <span className="text-[10px] text-gray-400 truncate max-w-[150px]">
                          {s.submitter_email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <StatusBadge status={s.status as SubmissionStatus} errorMessage={s.last_error} />
                    </td>
                    <td className="px-4 py-5">
                      {s.overall_score != null ? (
                        <div className={cn(
                          "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border",
                          s.overall_score >= 90 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" :
                          s.overall_score >= 80 ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" :
                          s.overall_score >= 70 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" :
                          s.overall_score >= 60 ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20" :
                          "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                        )}>
                          {s.overall_score}/100
                        </div>
                      ) : (
                        <span className="text-gray-300 dark:text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-5">
                      {s.verdict ? (
                        <span className={cn(
                          "text-[10px] font-bold px-2.5 py-1.5 rounded-md uppercase tracking-wider leading-tight inline-block max-w-[150px] text-center",
                          s.overall_score != null ? (
                            s.overall_score >= 90 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" :
                            s.overall_score >= 80 ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20" :
                            s.overall_score >= 70 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" :
                            s.overall_score >= 60 ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20" :
                            "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                          ) : (
                            s.verdict.toLowerCase().includes("very strong") ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" :
                            s.verdict.toLowerCase().includes("strong") ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20" :
                            s.verdict.toLowerCase().includes("moderate") ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" :
                            s.verdict.toLowerCase().includes("weak") ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20" :
                            s.verdict.toLowerCase().includes("reject") ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20" :
                            "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          )
                        )}>
                          {s.verdict}
                        </span>
                      ) : (
                        <span className="text-gray-300 dark:text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(s.submitted_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      {s.status === "COMPLETED" ? (
                        <button
                          onClick={() => setSelectedSubmissionReport({ 
                            id: s.submission_id, 
                            submitterName: s.submitter_name, 
                            uniqueId: s.unique_id 
                          })}
                          className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 underline underline-offset-2 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                        >
                          View Report
                        </button>
                      ) : (
                        <span className="text-gray-300 dark:text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={(e) => {
                          if (openMenuId === s.submission_id) {
                            setOpenMenuId(null);
                            setMenuAnchor(null);
                          } else {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setOpenMenuId(s.submission_id);
                            setMenuAnchor(rect);
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
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No submissions found</h3>
                      <p className="text-sm text-gray-500 mt-2">No student submissions have been recorded for this group yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {data && data.pagination.total_pages > 1 && (
          <div className="px-4 sm:px-8 py-4 sm:py-6 border-t border-gray-50 dark:border-zinc-800 flex flex-col sm:flex-row items-center gap-3 sm:gap-0 bg-gray-50/30 dark:bg-zinc-800/20">
            {/* Page info - shows on top on mobile */}
            <p className="text-xs sm:text-sm text-gray-500 font-medium sm:flex-1">
              Showing <span className="text-gray-900 dark:text-white font-bold">{Math.min(page * 15, data.pagination.total)}</span>{" "}
              of <span className="text-gray-900 dark:text-white font-bold">{data.pagination.total}</span>
            </p>

            {/* Navigation */}
            <div className="flex items-center gap-3 sm:gap-6">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 px-3 font-semibold h-9 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 transition-colors"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Prev</span>
              </Button>
              
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-gray-500">Page</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{page}</span>
                <span className="text-sm text-gray-400">/ {data.pagination.total_pages}</span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="gap-2 px-3 font-semibold h-9 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 transition-colors"
                disabled={page >= data.pagination.total_pages}
                onClick={() => setPage(page + 1)}
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <Portal>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDeleteConfirm(false)}
                className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
              />

              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white dark:bg-zinc-900 rounded-md shadow-2xl w-full max-w-md p-8 border border-gray-100 dark:border-zinc-800"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                      Delete Group?
                    </h3>
                    <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                      This will permanently delete <strong className="text-gray-900 dark:text-white">{data?.group.name}</strong> and all its associated data. This action is irreversible.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => setShowDeleteConfirm(false)}
                    variant="outline"
                    className="h-12 font-bold rounded-md"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md shadow-lg shadow-red-600/10 flex items-center justify-center gap-2 group transition-all"
                  >
                    {deleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Confirm Delete
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </div>
          </Portal>
        )}
      </AnimatePresence>

      {/* Action Menu Portal */}
      {openMenuId && menuAnchor && (() => {
        const activeRow = data?.submissions.find(s => s.submission_id === openMenuId);
        if (!activeRow) return null;
        
        const spaceBelow = window.innerHeight - menuAnchor.bottom;
        const showAbove = spaceBelow < 220; // threshold

        return (
          <Portal>
            <div
              className="fixed z-[9999] w-56 bg-white dark:bg-zinc-900 rounded-md border border-gray-100 dark:border-zinc-800 shadow-xl overflow-hidden py-1.5 menu-container"
              style={{
                ...(showAbove 
                  ? { bottom: window.innerHeight - menuAnchor.top + 4 }
                  : { top: menuAnchor.bottom + 4 }),
                left: Math.max(16, menuAnchor.right - 224),
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <button
                onClick={async () => {
                  setOpenMenuId(null); setMenuAnchor(null);
                  toast(`Preparing download...`, "info");
                  try {
                    const blob = await downloadSubmissionFile(activeRow.submission_id);
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url; a.download = activeRow.file_name || `Submission_${activeRow.submission_id.slice(0, 8)}.pdf`;
                    document.body.appendChild(a); a.click();
                    URL.revokeObjectURL(url); document.body.removeChild(a);
                    toast("Download started", "success");
                  } catch (err: any) { toast("Download failed: " + err.message, "error"); }
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors whitespace-nowrap"
              >
                <Download className="h-4 w-4 text-indigo-500 shrink-0" />
                Download Document
              </button>

              {activeRow.status === "COMPLETED" && (
                <button
                  onClick={() => { 
                    setOpenMenuId(null); 
                    setMenuAnchor(null); 
                    setSelectedSubmissionReport({ 
                      id: activeRow.submission_id, 
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

              <button
                onClick={async () => {
                  setOpenMenuId(null); setMenuAnchor(null);
                  setRetryingId(activeRow.submission_id);
                  try {
                    // Remove from dismissed-paused-submissions if present so modal can fire again
                    try {
                      const dismissed = JSON.parse(localStorage.getItem("dismissed-paused-submissions") || "[]");
                      const updated = dismissed.filter((id: string) => id !== activeRow.submission_id);
                      localStorage.setItem("dismissed-paused-submissions", JSON.stringify(updated));
                    } catch (e) {}

                    await retrySubmissionEvaluation(groupId, activeRow.submission_id, true);
                    toast("Re-evaluation queued (overwriting existing results)", "success");
                    load();
                  } catch (err: any) { toast("Re-evaluate failed: " + err.message, "error"); }
                  finally { setRetryingId(null); }
                }}
                disabled={retryingId === activeRow.submission_id}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-amber-600 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors whitespace-nowrap"
              >
                <RotateCcw className={`h-4 w-4 shrink-0 ${retryingId === activeRow.submission_id ? "animate-spin" : ""}`} />
                Re-evaluate
              </button>

              <div className="h-px bg-gray-100 dark:bg-zinc-800 my-1" />

              <button
                onClick={() => {
                  setOpenMenuId(null); setMenuAnchor(null);
                  setDeleteTarget({ id: activeRow.submission_id, name: activeRow.file_name || "this submission" });
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors whitespace-nowrap"
              >
                <Trash2 className="h-4 w-4 shrink-0" />
                Delete Submission
              </button>
            </div>
          </Portal>
        );
      })()}

      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setIsDeletingSubmission(true);
          try {
            await deleteSubmission(deleteTarget.id);
            toast("Submission deleted", "success");
            load();
          } catch (err: any) { toast("Delete failed: " + err.message, "error"); }
          finally { setIsDeletingSubmission(false); setDeleteTarget(null); }
        }}
        title="Delete Submission"
        description={`Are you sure you want to delete the submission from ${deleteTarget?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeletingSubmission}
        variant="danger"
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

      {/* Report Modal */}
      {selectedSubmissionReport && (
        <ReportModal
          submissionId={selectedSubmissionReport.id}
          groupId={groupId}
          submitterName={selectedSubmissionReport.submitterName}
          uniqueId={selectedSubmissionReport.uniqueId}
          onClose={() => setSelectedSubmissionReport(null)}
        />
      )}
    </motion.div>
  );
}
