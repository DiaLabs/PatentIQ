"use client";

import { AlertTriangle, FileText } from "lucide-react";
import Link from "next/link";

export default function GroupReportIndexPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-12 text-center bg-gray-50 dark:bg-[#0a0a0a]">
      <div className="h-16 w-16 bg-amber-50 dark:bg-amber-900/10 rounded-full flex items-center justify-center mb-5">
        <AlertTriangle className="h-8 w-8 text-amber-500" />
      </div>
      <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Invalid Report Link
      </h4>
      <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
        This link is incomplete. A full report link should include both a Group ID and a Submission ID.
      </p>
      <p className="text-xs text-gray-400 mt-8">
        Please check your source (e.g., your mentor or the exported Excel file) for the correct link.
      </p>
    </div>
  );
}
