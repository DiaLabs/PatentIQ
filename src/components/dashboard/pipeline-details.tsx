/**
 * Pipeline Details Component
 * 
 * Shows the detailed evaluation pipeline results for a specific submission.
 * Only visible to mentors in the group details page.
 */

"use client";

import { useState } from "react";
import { ChevronDown, Zap, AlertTriangle, CheckCircle2, Clock, Loader2 } from "lucide-react";
import type { PipelinePhase } from "@/lib/api";

interface PipelineDetailsProps {
  phases: PipelinePhase[];
  status: string;
  currentStage?: number;
  loading?: boolean;
}

export function PipelineDetails({ phases, status, currentStage = 0, loading = false }: PipelineDetailsProps) {
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 text-indigo-600 animate-spin mr-2" />
        <p className="text-sm text-gray-600">Loading pipeline data...</p>
      </div>
    );
  }

  if (!phases || phases.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-md">
        Pipeline execution has not started yet. Check back once the submission begins processing.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {phases.map((phase, idx) => {
        const isExpanded = expandedPhase === idx;
        const isCompleted = phase.status === "COMPLETED";
        const isFailed = phase.status === "FAILED";
        const isRejected = phase.status === "REJECTED";

        return (
          <div key={`${phase.stage_number}-${phase.timestamp}`} className="border border-gray-200 rounded-md overflow-hidden hover:border-gray-300 transition-colors">
            {/* Phase Header */}
            <button
              onClick={() => setExpandedPhase(isExpanded ? null : idx)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              {/* Status Icon */}
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : isFailed ? (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                ) : isRejected ? (
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                ) : (
                  <Clock className="h-5 w-5 text-gray-400" />
                )}
              </div>

              {/* Phase Name and Status */}
              <div className="flex-1 text-left">
                <p className={`text-sm font-medium ${
                  isFailed ? "text-red-700" : isRejected ? "text-amber-700" : "text-gray-900"
                }`}>
                  {phase.phase_name}
                </p>
                {phase.timestamp && (
                  <p className="text-xs text-gray-400">
                    {new Date(phase.timestamp * 1000).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Status Badge */}
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                isCompleted
                  ? "bg-emerald-50 text-emerald-700"
                  : isFailed
                  ? "bg-red-50 text-red-700"
                  : isRejected
                  ? "bg-amber-50 text-amber-700"
                  : "bg-gray-50 text-gray-700"
              }`}>
                {phase.status}
              </span>

              {/* Duration Badge */}
              {phase.duration_ms && (
                <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                  {(phase.duration_ms / 1000).toFixed(2)}s
                </span>
              )}

              {/* Expand Arrow */}
              <ChevronDown
                className={`h-4 w-4 text-gray-400 transition-transform flex-shrink-0 ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Phase Details (Expanded) */}
            {isExpanded && (
              <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 space-y-3">
                {/* Error Message */}
                {isFailed && phase.error_message && (
                  <div className="rounded bg-red-50 border border-red-200 p-3">
                    <p className="text-xs font-medium text-red-700 mb-1">❌ Error</p>
                    <p className="text-xs text-red-600 break-words font-mono">{phase.error_message}</p>
                  </div>
                )}

                {isRejected && (
                  <div className="rounded bg-amber-50 border border-amber-200 p-3">
                    <p className="text-xs font-medium text-amber-700">⚠️ Rejected</p>
                    <p className="text-xs text-amber-600 mt-1">This patent was rejected during evaluation</p>
                  </div>
                )}

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-3">
                  {phase.metadata?.patent_ids && phase.metadata.patent_ids.length > 0 && (
                    <div className="bg-white rounded p-2 border border-gray-200 col-span-2">
                      <p className="text-xs text-gray-500 font-medium">Extracted Patent IDs</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {phase.metadata.patent_ids.map((id: string) => (
                          <span key={id} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {id}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {phase.metadata?.invalid_ids && phase.metadata.invalid_ids.length > 0 && (
                    <div className="bg-white rounded p-2 border border-gray-200 col-span-2">
                      <p className="text-xs text-red-500 font-medium">Invalid/Not Found Patent IDs</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {phase.metadata.invalid_ids.map((id: string) => (
                          <span key={id} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-700 border border-red-100 line-through">
                            {id}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {phase.api_provider && (
                    <div className="bg-white rounded p-2 border border-gray-200">
                      <p className="text-xs text-gray-500 font-medium">API Provider</p>
                      <p className="text-xs text-gray-700 font-mono mt-0.5">{phase.api_provider}</p>
                    </div>
                  )}

                  {phase.duration_ms && (
                    <div className="bg-white rounded p-2 border border-gray-200">
                      <p className="text-xs text-gray-500 font-medium">Duration</p>
                      <p className="text-xs text-gray-700 font-mono mt-0.5">{(phase.duration_ms / 1000).toFixed(2)}s</p>
                    </div>
                  )}

                  {phase.tokens_used != null && (
                    <div className="bg-white rounded p-2 border border-gray-200">
                      <p className="text-xs text-gray-500 font-medium">Tokens Used</p>
                      <p className="text-xs text-gray-700 font-mono mt-0.5">{phase.tokens_used.toLocaleString()}</p>
                    </div>
                  )}

                  {phase.cost_usd != null && (
                    <div className="bg-white rounded p-2 border border-gray-200">
                      <p className="text-xs text-gray-500 font-medium">Cost</p>
                      <p className="text-xs text-gray-700 font-mono mt-0.5">${phase.cost_usd.toFixed(4)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
