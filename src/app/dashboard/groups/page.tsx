"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { fetchGroups, type Group } from "@/lib/api";
import { CreateGroupDialog } from "@/components/dashboard/create-group-dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Plus,
  Users,
  AlertCircle,
  Clock,
  Search,
  Filter,
  MoreVertical,
  FileText,
  Star,
  Flag,
  TrendingUp,
  ChevronRight,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { CustomSelect } from "@/components/ui/custom-select";
import { cn } from "@/lib/utils";
import { useRefresh } from "@/context/RefreshContext";

// Deterministic color palette for group icons based on index
const GROUP_COLORS = [
  { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-600 dark:text-indigo-400", bar: "bg-indigo-500" },
  { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500" },
  { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-600 dark:text-orange-400", bar: "bg-orange-500" },
  { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-600 dark:text-red-400", bar: "bg-red-500" },
  { bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-600 dark:text-violet-400", bar: "bg-violet-500" },
  { bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-600 dark:text-cyan-400", bar: "bg-cyan-500" },
];

function getColor(index: number) {
  return GROUP_COLORS[index % GROUP_COLORS.length];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function GroupCard({ group, index }: { group: Group; index: number }) {
  const color = getColor(index);
  const avgScore =
    group.stats.avg_score != null
      ? (group.stats.avg_score).toFixed(1)
      : null;
  const flagged = group.stats.rejected;

  // Score color
  const scoreColor =
    avgScore == null
      ? "text-gray-400"
      : parseFloat(avgScore) >= 80
      ? "text-emerald-600"
      : parseFloat(avgScore) >= 60
      ? "text-violet-600"
      : "text-orange-600";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
    >
      <Link
        href={`/dashboard/groups/${group.group_id}`}
        className="bg-white dark:bg-zinc-900 rounded-md border border-gray-100 dark:border-zinc-800 p-6 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all group relative overflow-hidden flex flex-col h-full"
      >
        {/* Decorative Gradient Glow on Hover */}
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Header Row: Icon + Name/Exp + Status */}
        <div className="flex items-center gap-4 mb-8">
          <div className={cn("h-14 w-14 rounded-md flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", color.bg)}>
            <Layers className={cn("h-7 w-7", color.text)} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate mb-1">{group.name}</h3>
            <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
              <Clock className="h-3 w-3" />
              <p className="text-[10px] font-bold uppercase tracking-wider">
                {group.is_expired ? "Ended" : "Expires"} {formatDate(group.expires_at)}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className={cn(
              "text-[10px] font-black uppercase tracking-[0.1em]",
              group.is_expired ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
            )}>
              {group.is_expired ? "Expired" : "Active"}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mt-auto pt-6 border-t border-gray-100 dark:border-zinc-800/50">
          <div>
            <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">Submits</p>
            <p className="text-xl font-black text-gray-900 dark:text-white">{group.stats.total_submissions}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">Flagged</p>
            <p className={cn("text-xl font-black", flagged > 0 ? "text-red-500" : "text-gray-300 dark:text-zinc-700")}>
              {flagged}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">Avg Score</p>
            <p className={cn("text-xl font-black", avgScore ? scoreColor : "text-gray-300 dark:text-zinc-700")}>
              {avgScore ? `${parseFloat(avgScore).toFixed(0)}/100` : "—"}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function StatPill({
  icon,
  label,
  value,
  iconBg,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconBg: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-md border border-gray-200 dark:border-zinc-800 p-5 flex items-center gap-4 shadow-sm">
      <div className={`h-12 w-12 rounded-md ${iconBg} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-0.5">{label}</p>
        {loading ? (
          <div className="h-7 w-16 animate-pulse rounded bg-gray-100 dark:bg-zinc-800" />
        ) : (
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        )}
      </div>
    </div>
  );
}

const SORT_OPTIONS = [
  { value: "recent", label: "Recent" },
  { value: "name", label: "A-Z" },
];

export default function GroupsPage() {
  const { refreshTrigger, setRefreshing } = useRefresh();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "recent">("recent");

  const load = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else {
      setLoading(true);
      setGroups([]);
    }
    setError(null);
    try {
      const data = await fetchGroups();
      setGroups(data.groups);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load groups.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [setRefreshing]);

  const lastRefreshProcessed = useRef(refreshTrigger);

  useEffect(() => { load(); }, [load]);

  // Listen for global refresh trigger
  useEffect(() => {
    if (refreshTrigger > lastRefreshProcessed.current) {
      lastRefreshProcessed.current = refreshTrigger;
      load(true);
    }
  }, [refreshTrigger, load]);

  const totalSubmissions = groups.reduce((a, g) => a + g.stats.total_submissions, 0);
  const totalCompleted = groups.reduce((a, g) => a + g.stats.completed, 0);
  const totalFlagged = groups.reduce((a, g) => a + g.stats.rejected, 0);

  const allScores = groups
    .map((g) => g.stats.avg_score)
    .filter((s): s is number => s !== null);
  const avgOverall =
    allScores.length > 0
      ? (allScores.reduce((a, b) => a + b, 0) / allScores.length / 10).toFixed(1)
      : null;

  const filtered = groups
    .filter((g) => g.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return new Date(b.expires_at).getTime() - new Date(a.expires_at).getTime();
    });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8"
    >
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Groups</h1>
        <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
          Organize and manage your evaluation groups.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="mb-8 space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
        {/* Search — full width on mobile */}
        <div className="relative w-full sm:flex-1 sm:min-w-[220px] sm:max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search groups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-[42px] pl-10 pr-4 rounded-md border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 transition-all"
          />
        </div>

        {/* Sort + Create — row on mobile, inline on desktop */}
        <div className="flex items-center gap-3">
          <CustomSelect
            value={sortBy}
            onChange={(v) => setSortBy(v as any)}
            options={SORT_OPTIONS}
            placeholder="Sort By"
            className="w-36"
          />
          <div className="flex-1" />
          <Button
            id="tour-create-group"
            onClick={() => setShowDialog(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-4 sm:px-5 h-[42px] shadow-sm font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>Create Group</span>
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-8 mb-8 lg:mb-16 items-stretch">
        {/* Total Groups */}
        <div className="lg:col-span-4 relative overflow-hidden rounded-md border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 lg:p-8 shadow-sm">
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 lg:mb-4">Total Groups</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl lg:text-6xl font-black text-gray-900 dark:text-white leading-none">
                {loading ? "—" : groups.length}
              </span>
              <span className="text-xs lg:text-sm font-bold text-emerald-500">+1 this week</span>
            </div>
          </div>
          <Users className="absolute -right-4 -bottom-4 h-24 lg:h-32 w-24 lg:w-32 text-gray-50 dark:text-zinc-800/50 -rotate-12 pointer-events-none" />
        </div>

        {/* Total Submissions */}
        <div className="lg:col-span-4 relative overflow-hidden rounded-md border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 lg:p-8 shadow-sm">
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 lg:mb-4">Total Submissions</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl lg:text-6xl font-black text-gray-900 dark:text-white leading-none">
                {loading ? "—" : totalSubmissions}
              </span>
              <span className="text-xs lg:text-sm font-bold text-indigo-500">12 Today</span>
            </div>
          </div>
          <FileText className="absolute -right-4 -bottom-4 h-24 lg:h-32 w-24 lg:w-32 text-gray-50 dark:text-zinc-800/50 -rotate-12 pointer-events-none" />
        </div>

        {/* Recent Activity — desktop only */}
        <div className="hidden lg:flex lg:col-span-4 flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Recent Activity</h3>
          </div>
          <div className="space-y-2 flex-1">
            {groups.slice(0, 2).map((g, idx) => (
              <div key={g.group_id} className="flex items-center gap-3 p-3.5 rounded-md border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-zinc-800/50 group cursor-pointer">
                <div className="h-8 w-8 rounded-md bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
                  {idx === 0 ? <Plus className="h-4 w-4 text-indigo-600" /> : <Clock className="h-4 w-4 text-amber-600" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">
                    {idx === 0 ? `New submission in ${g.name}` : `Evaluation completed for ${g.name}`}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">2 hours ago</p>
                </div>
              </div>
            ))}
            {groups.length === 0 && !loading && (
              <div className="p-8 text-center border-2 border-dashed border-gray-100 dark:border-zinc-800 rounded-md">
                <p className="text-xs text-gray-400 italic">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-md border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 p-4 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Groups Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[210px] animate-pulse rounded-md border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md bg-gray-100 dark:bg-zinc-800" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-100 dark:bg-zinc-800 rounded" />
                    <div className="h-3 w-20 bg-gray-50 dark:bg-zinc-800/50 rounded" />
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="h-2 w-full bg-gray-50 dark:bg-zinc-800/50 rounded" />
                  <div className="h-2 w-2/3 bg-gray-50 dark:bg-zinc-800/50 rounded" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-zinc-800/50">
                <div className="flex gap-4">
                  <div className="h-4 w-12 bg-gray-100 dark:bg-zinc-800 rounded" />
                  <div className="h-4 w-12 bg-gray-100 dark:bg-zinc-800 rounded" />
                </div>
                <div className="h-4 w-16 bg-gray-100 dark:bg-zinc-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
            <Users className="h-7 w-7 text-gray-300" />
          </div>
          <p className="text-base font-semibold text-gray-500">No groups found</p>
          <p className="text-sm text-gray-400 mt-1 mb-6">
            {search ? "Try a different search term." : "Create a group to get started."}
          </p>
          {!search && (
            <Button
              onClick={() => setShowDialog(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Create First Group
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((g, i) => (
            <GroupCard key={g.group_id} group={g} index={i} />
          ))}
        </div>
      )}

      {/* Dialog */}
      {showDialog && (
        <CreateGroupDialog
          onClose={() => setShowDialog(false)}
          onCreated={load}
        />
      )}
    </motion.div>
  );
}
