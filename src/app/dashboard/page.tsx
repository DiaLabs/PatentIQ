"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchDashboard, type DashboardData } from "@/lib/api";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Upload,
} from "lucide-react";
import Link from "next/link";

const PIPELINE_STAGES = [
  { key: "plagiarism", label: "1. Plagiarism Check" },
  { key: "prior_art", label: "2. Prior Art Search" },
  { key: "ai_analysis", label: "3. AI Analysis" },
  { key: "evaluation", label: "4. Rule Evaluation" },
  { key: "report", label: "5. Report Generation" },
];

export default function OverviewPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const ov = dashboard?.overview;

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.displayName?.split(" ")[0] ?? "Mentor"} 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here's what's happening with your groups today.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Submissions"
          value={loading ? "—" : String(ov?.total_submissions ?? 0)}
          icon={<FileText className="h-4 w-4 text-indigo-600" />}
          loading={loading}
        />
        <StatCard
          title="Completed"
          value={loading ? "—" : String(ov?.total_evaluated ?? 0)}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
          loading={loading}
        />
        <StatCard
          title="Groups"
          value={loading ? "—" : String(ov?.total_groups ?? 0)}
          icon={<Users className="h-4 w-4 text-violet-600" />}
          loading={loading}
        />
        <StatCard
          title="Avg. Score"
          value={
            loading
              ? "—"
              : ov?.avg_overall_score != null
              ? `${ov.avg_overall_score}/100`
              : "N/A"
          }
          icon={<CheckCircle2 className="h-4 w-4 text-amber-600" />}
          loading={loading}
        />
      </div>

      {/* Main Content: Recent Groups + Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Recent Groups */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Recent Groups</h2>
            <Link
              href="/dashboard/groups"
              className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-50" />
              ))}
            </div>
          ) : dashboard && dashboard.active_groups.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Group
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Completed
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Pending
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Avg Score
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {dashboard.active_groups.map((g) => (
                    <tr key={g.group_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5 font-medium text-gray-900">
                        <Link
                          href={`/dashboard/groups/${g.group_id}`}
                          className="hover:text-indigo-600 transition-colors"
                        >
                          {g.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 text-right text-gray-500">
                        {g.completed}
                      </td>
                      <td className="px-4 py-3.5 text-right text-gray-500">
                        {g.pending}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        {g.avg_score != null ? (
                          <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                            {g.avg_score}/100
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <Users className="mx-auto h-8 w-8 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">No groups yet.</p>
              <Link href="/dashboard/groups">
                <Button size="sm" className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white">
                  Create your first group
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Evaluation Pipeline */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Evaluation Pipeline</h2>
          </div>
          <div className="p-6 space-y-4">
            {PIPELINE_STAGES.map((stage, i) => (
              <div key={stage.key} className="flex items-center gap-3">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  i < 2
                    ? "bg-emerald-100"
                    : i === 2
                    ? "bg-indigo-100"
                    : "bg-gray-100"
                }`}>
                  {i < 2 ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  ) : i === 2 ? (
                    <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-gray-300" />
                  )}
                </div>
                <span className={`text-xs ${
                  i < 2
                    ? "text-gray-500 line-through"
                    : i === 2
                    ? "text-indigo-700 font-medium"
                    : "text-gray-400"
                }`}>
                  {stage.label}
                </span>
                {i < 2 && (
                  <span className="ml-auto text-xs text-emerald-600 font-medium">
                    Done
                  </span>
                )}
                {i === 2 && (
                  <span className="ml-auto text-xs text-indigo-600 font-medium">
                    Active
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Upload CTA */}
          <div className="mx-4 mb-4 rounded-xl bg-indigo-600 p-4 text-white">
            <p className="text-xs font-semibold mb-0.5">Smart Evaluation.</p>
            <p className="text-xs font-bold mb-3">Stronger Patents.</p>
            <p className="text-xs text-indigo-200 mb-3 leading-relaxed">
              AI-powered insights and mentor-driven evaluation.
            </p>
            <Link href="/dashboard/groups">
              <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-white text-indigo-700 text-xs font-semibold py-2 hover:bg-indigo-50 transition-colors">
                <Upload className="h-3.5 w-3.5" />
                Create a Group
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
