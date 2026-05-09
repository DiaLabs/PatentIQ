"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchGroups, type Group } from "@/lib/api";
import { StatCard } from "@/components/dashboard/stat-card";
import { CreateGroupDialog } from "@/components/dashboard/create-group-dialog";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Users,
  AlertCircle,
  Clock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

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

  const activeGroups = groups.filter((g) => !g.is_expired);
  const totalSubmissions = groups.reduce((a, g) => a + g.stats.total_submissions, 0);
  const totalCompleted = groups.reduce((a, g) => a + g.stats.completed, 0);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your student groups and their submission links.
          </p>
        </div>
        <Button
          onClick={() => setShowDialog(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus className="h-4 w-4" />
          New Group
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Total Groups"
          value={loading ? "—" : String(groups.length)}
          icon={<Users className="h-4 w-4 text-indigo-600" />}
          loading={loading}
        />
        <StatCard
          title="Total Submissions"
          value={loading ? "—" : String(totalSubmissions)}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
          loading={loading}
        />
        <StatCard
          title="Completed Evaluations"
          value={loading ? "—" : String(totalCompleted)}
          icon={<CheckCircle2 className="h-4 w-4 text-violet-600" />}
          loading={loading}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Groups Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">All Groups</h2>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-50" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="mx-auto h-10 w-10 text-gray-200 mb-4" />
            <p className="text-sm font-medium text-gray-500">No groups yet</p>
            <p className="text-xs text-gray-400 mt-1 mb-5">
              Create a group to generate a student submission link.
            </p>
            <Button
              onClick={() => setShowDialog(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Create First Group
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Group Name
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Submissions
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Completed
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Avg Score
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Expires
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {groups.map((g) => (
                  <tr key={g.group_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {g.name}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {g.is_expired ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                          <Clock className="h-3 w-3" />
                          Expired
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right text-gray-500">
                      {g.stats.total_submissions}
                    </td>
                    <td className="px-4 py-4 text-right text-gray-500">
                      {g.stats.completed}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {g.stats.avg_score != null ? (
                        <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                          {Math.round(g.stats.avg_score)}/100
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right text-xs text-gray-400">
                      {new Date(g.expires_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/groups/${g.group_id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        View <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
