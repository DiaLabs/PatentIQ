import type { SubmissionStatus } from "@/lib/api";

const STATUS_CONFIG: Record<
  SubmissionStatus,
  { label: string; className: string }
> = {
  QUEUED:              { label: "Queued",       className: "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400" },
  PENDING:             { label: "Queued",       className: "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400" },
  PROCESSING:          { label: "In Progress",  className: "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" },
  EXTRACTING_IDS:      { label: "Extracting",   className: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  VALIDATING_IDS:      { label: "Validating",   className: "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" },
  CHECKING_PLAGIARISM: { label: "Plagiarism",   className: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  EVALUATING:          { label: "Evaluating",   className: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
  COMPLETED:           { label: "Completed",    className: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" },
  REJECTED:            { label: "Needs Review", className: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
  FAILED:              { label: "Failed",       className: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
  PAUSED:              { label: "Paused",       className: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
};

export function StatusBadge({ status, errorMessage }: { status: SubmissionStatus; errorMessage?: string | null }) {
  let resolvedStatus = status;
  if (status === "FAILED" && errorMessage?.includes("Evaluation paused")) {
    resolvedStatus = "PAUSED";
  }

  const config = STATUS_CONFIG[resolvedStatus] ?? { label: status, className: "bg-gray-100 text-gray-600" };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
