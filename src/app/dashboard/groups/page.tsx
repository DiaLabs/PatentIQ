"use client";

import { useEffect, useState, useCallback } from "react";
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

// Deterministic color palette for group icons based on index
const GROUP_COLORS = [
  { bg: "bg-indigo-100", text: "text-indigo-600", bar: "bg-indigo-500" },
  { bg: "bg-emerald-100", text: "text-emerald-600", bar: "bg-emerald-500" },
  { bg: "bg-orange-100", text: "text-orange-600", bar: "bg-orange-500" },
  { bg: "bg-red-100", text: "text-red-600", bar: "bg-red-500" },
  { bg: "bg-violet-100", text: "text-violet-600", bar: "bg-violet-500" },
  { bg: "bg-cyan-100", text: "text-cyan-600", bar: "bg-cyan-500" },
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
      ? (group.stats.avg_score / 10).toFixed(1)
      : null;
  const flagged = group.stats.rejected;

  // Score color
  const scoreColor =
    avgScore == null
      ? "text-gray-400"
      : parseFloat(avgScore) >= 8
      ? "text-emerald-600"
      : parseFloat(avgScore) >= 6
      ? "text-violet-600"
      : "text-orange-600";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="bg-white rounded-md border border-gray-200 p-5 hover:shadow-md transition-all group relative"
    >
      {/* Top Row: Icon + menu */}
      <div className="flex items-start justify-between mb-4">
        <div className={`h-12 w-12 rounded-md ${color.bg} flex items-center justify-center flex-shrink-0`}>
          <Layers className={`h-6 w-6 ${color.text}`} />
        </div>
        <button className="p-1 rounded-md text-gray-300 hover:text-gray-500 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      {/* Name + Description */}
      <h3 className="text-base font-bold text-gray-900 mb-0.5 truncate">{group.name}</h3>
      <p className="text-xs text-gray-400 mb-4 truncate">
        {group.is_expired ? "Expired" : `Expires ${formatDate(group.expires_at)}`}
      </p>

      {/* Stats row */}
      <div className="flex gap-5 mb-4">
        <div>
          <p className="text-xl font-bold text-gray-900">{group.stats.total_submissions}</p>
          <p className="text-xs text-gray-400">Submissions</p>
        </div>
        <div>
          <p className={`text-xl font-bold ${avgScore ? scoreColor : "text-gray-300"}`}>
            {avgScore ? `${avgScore}/10` : "—"}
          </p>
          <p className="text-xs text-gray-400">Avg. Score</p>
        </div>
        <div>
          <p className={`text-xl font-bold ${flagged > 0 ? "text-red-500" : "text-gray-300"}`}>
            {flagged}
          </p>
          <p className="text-xs text-gray-400">Flagged</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full rounded-full bg-gray-100 mb-3 overflow-hidden">
        <div
          className={`h-full rounded-full ${color.bar} transition-all`}
          style={{
            width: group.stats.total_submissions > 0
              ? `${Math.min((group.stats.completed / group.stats.total_submissions) * 100, 100)}%`
              : "0%",
          }}
        />
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">
          Last activity: {formatDate(group.expires_at)}
        </p>
        <Link
          href={`/dashboard/groups/${group.group_id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 opacity-0 group-hover:opacity-100 transition-all"
        >
          View <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
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
    <div className="bg-white rounded-md border border-gray-200 p-5 flex items-center gap-4 shadow-sm">
      <div className={`h-12 w-12 rounded-md ${iconBg} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium mb-0.5">{label}</p>
        {loading ? (
          <div className="h-7 w-16 animate-pulse rounded bg-gray-100" />
        ) : (
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        )}
      </div>
    </div>
  );
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGroups();
      setGroups(data.groups);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load groups.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

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

  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-12 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Groups</h1>
          <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
            Organize and manage your evaluation groups.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search groups..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-md border border-gray-200 bg-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all w-52"
            />
          </div>

          {/* Filter button */}
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 rounded-md border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4" />
            Filter
          </button>

          {/* Create */}
          <Button
            onClick={() => setShowDialog(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
          >
            <Plus className="h-4 w-4" />
            Create Group
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatPill
          icon={<Users className="h-5 w-5 text-indigo-600" />}
          iconBg="bg-indigo-50"
          label="Total Groups"
          value={loading ? "—" : String(groups.length)}
          loading={loading}
        />
        <StatPill
          icon={<FileText className="h-5 w-5 text-emerald-600" />}
          iconBg="bg-emerald-50"
          label="Total Submissions"
          value={loading ? "—" : String(totalSubmissions)}
          loading={loading}
        />
        <StatPill
          icon={<Star className="h-5 w-5 text-orange-500" />}
          iconBg="bg-orange-50"
          label="Average Score"
          value={loading ? "—" : avgOverall ? `${avgOverall}/10` : "N/A"}
          loading={loading}
        />
        <StatPill
          icon={<Flag className="h-5 w-5 text-red-500" />}
          iconBg="bg-red-50"
          label="Flagged (Needs Review)"
          value={loading ? "—" : String(totalFlagged)}
          loading={loading}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Groups Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-52 animate-pulse rounded-md bg-gray-100" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-24 text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
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
    </div>
  );
}
