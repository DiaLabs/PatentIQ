"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  fetchGroupDetails,
  deleteGroup,
  fetchSubmissionPipeline,
  type GroupDetails,
  type SubmissionStatus,
  type PipelinePhase,
} from "@/lib/api";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  AlertCircle,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
} from "lucide-react";
import Link from "next/link";
import { PipelineDetails } from "@/components/dashboard/pipeline-details";
import { RetrySubmissionButton } from "@/components/dashboard/retry-submission-button";

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "Queued", value: "QUEUED" },
  { label: "Evaluating", value: "EVALUATING" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Failed", value: "FAILED" },
];

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [data, setData] = useState<GroupDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedSubmissionPipeline, setSelectedSubmissionPipeline] = useState<string | null>(null);
  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [pipelinePhases, setPipelinePhases] = useState<PipelinePhase[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchGroupDetails(groupId, {
        page,
        limit: 20,
        status: statusFilter || undefined,
      });
      setData(result);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load group.");
    } finally {
      setLoading(false);
    }
  }, [groupId, page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  // Fetch pipeline data when modal is opened
  useEffect(() => {
    if (!selectedSubmissionPipeline || !data) return;

    const fetchPipeline = async () => {
      setPipelineLoading(true);
      try {
        const result = await fetchSubmissionPipeline(groupId, selectedSubmissionPipeline);
        setPipelinePhases(result.phases);
      } catch (err) {
        console.error('Failed to fetch pipeline:', err);
        setPipelinePhases([]);
      } finally {
        setPipelineLoading(false);
      }
    };

    fetchPipeline();
  }, [selectedSubmissionPipeline, data, groupId]);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      await deleteGroup(groupId);
      router.push("/dashboard/groups");
    } catch (e: any) {
      setError(e?.message ?? "Failed to delete group.");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [groupId, router]);

  const studentLink = data?.group.student_link || "";

  const handleCopy = () => {
    if (!studentLink) return;
    navigator.clipboard.writeText(studentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Link
          href="/dashboard/groups"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Groups
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-900 font-medium">
          {loading ? "Loading..." : data?.group.name}
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Group Header Card */}
      {data && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900">
                  {data.group.name}
                </h1>
                {data.group.is_expired ? (
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                    Expired
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                    Active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span>
                  Plagiarism limit:{" "}
                  <strong className="text-gray-700">
                    {Math.round(data.group.plag_threshold * 100)}%
                  </strong>
                </span>
                <span>
                  Expires:{" "}
                  <strong className="text-gray-700">
                    {new Date(data.group.expires_at).toLocaleDateString()}
                  </strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Student Link */}
          <div className="mt-4 rounded-lg bg-indigo-50 border border-indigo-100 p-3 flex items-center gap-3">
            <ExternalLink className="h-4 w-4 text-indigo-400 flex-shrink-0" />
            <p className="flex-1 text-xs text-indigo-700 font-mono truncate">
              {studentLink}
            </p>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 rounded-md p-1.5 text-indigo-400 hover:bg-indigo-100 transition-colors"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Submissions Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">
            Submissions{" "}
            {data && (
              <span className="ml-1.5 text-xs font-normal text-gray-400">
                ({data.pagination.total} total)
              </span>
            )}
          </h2>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="text-xs rounded-lg border border-gray-200 px-3 py-1.5 text-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 outline-none"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-50" />
            ))}
          </div>
        ) : data && data.submissions.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Submitter
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Team
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Score
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Verdict
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Submitted
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.submissions.map((s) => (
                    <tr
                      key={s.submission_id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {s.submitter_name}
                      </td>
                      <td className="px-4 py-4 text-gray-500 text-xs">
                        {s.team_member_names.length > 0
                          ? s.team_member_names.join(", ")
                          : "—"}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <StatusBadge status={s.status as SubmissionStatus} />
                      </td>
                      <td className="px-4 py-4 text-right">
                        {s.overall_score != null ? (
                          <span className="font-semibold text-gray-900">
                            {s.overall_score}
                            <span className="text-gray-400 font-normal">/100</span>
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {s.verdict ? (
                          <span
                            className={`text-xs font-medium ${
                              s.verdict === "ACCEPTED"
                                ? "text-emerald-600"
                                : s.verdict === "REJECTED"
                                ? "text-red-600"
                                : "text-amber-600"
                            }`}
                          >
                            {s.verdict}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-gray-400">
                        {new Date(s.submitted_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => setSelectedSubmissionPipeline(s.submission_id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Pipeline
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data.pagination.total_pages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Page {data.pagination.page} of {data.pagination.total_pages}
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="rounded-lg border border-gray-200 p-1.5 text-gray-500 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    disabled={page >= data.pagination.total_pages}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-lg border border-gray-200 p-1.5 text-gray-500 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-500">No submissions yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              Share the student link above to start receiving submissions.
            </p>
          </div>
        )}
      </div>

      {/* Pipeline Details Modal */}
      {selectedSubmissionPipeline && data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 my-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Evaluation Pipeline
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Submission ID: <span className="font-mono">{selectedSubmissionPipeline}</span>
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedSubmissionPipeline(null);
                  setPipelinePhases([]);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Pipeline Details */}
            <div className="border-t border-gray-100 pt-4">
              <PipelineDetails
                phases={pipelinePhases}
                status="PENDING"
                loading={pipelineLoading}
              />
            </div>

            {/* Retry Button */}
            <div className="mt-6">
              <RetrySubmissionButton
                groupId={groupId}
                submissionId={selectedSubmissionPipeline}
                status={data?.submissions.find(s => s.submission_id === selectedSubmissionPipeline)?.status || "PENDING"}
                retryCount={data?.submissions.find(s => s.submission_id === selectedSubmissionPipeline)?.retry_count}
                onRetrySuccess={() => {
                  // Refresh data after successful retry
                  load();
                  // Optionally close the modal and reopen to show the updated status
                }}
              />
            </div>

            {/* Info Note */}
            <div className="mt-6 rounded-lg bg-blue-50 border border-blue-100 p-3">
              <p className="text-xs text-blue-700">
                <strong>Pipeline Phases:</strong> 
                <br />1️⃣ Extracting Patent IDs → 2️⃣ Validating IDs → 3️⃣ Plagiarism Check → 4️⃣ AI Evaluation → 5️⃣ Report Gen
              </p>
            </div>

            {/* Close Button */}
            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedSubmissionPipeline(null);
                  setPipelinePhases([]);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Delete Group?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              This will permanently delete <strong>{data?.group.name}</strong> and
              all its submissions. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Group"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
