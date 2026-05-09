import type { SubmissionStatus } from "@/lib/api";

const STATUS_CONFIG: Record<
  SubmissionStatus,
  { label: string; className: string }
> = {
  QUEUED:              { label: "Queued",       className: "bg-gray-100 text-gray-600" },
  EXTRACTING_IDS:      { label: "Extracting",   className: "bg-blue-50 text-blue-700" },
  VALIDATING_IDS:      { label: "Validating",   className: "bg-violet-50 text-violet-700" },
  CHECKING_PLAGIARISM: { label: "Plagiarism",   className: "bg-amber-50 text-amber-700" },
  EVALUATING:          { label: "Evaluating",   className: "bg-indigo-50 text-indigo-700" },
  COMPLETED:           { label: "Completed",    className: "bg-emerald-50 text-emerald-700" },
  REJECTED:            { label: "Rejected",     className: "bg-red-50 text-red-700" },
  FAILED:              { label: "Failed",       className: "bg-red-50 text-red-700" },
};

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: "bg-gray-100 text-gray-600" };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
