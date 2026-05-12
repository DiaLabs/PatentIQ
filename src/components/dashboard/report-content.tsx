"use client";

import { StatusBadge } from "./status-badge";
import { FileText, AlertTriangle, CheckCircle2, TrendingUp, ShieldAlert, Zap } from "lucide-react";

interface ReportContentProps {
  data: any;
}

export function ReportContent({ data }: ReportContentProps) {
  if (!data) return null;

  // Fallbacks for simplified JSON (legacy or minimal)
  const overallScore = data.document_metadata?.overall_score ?? data.overall_score ?? "0";
  const filingStatus = data.document_metadata?.current_filing_status ?? data.verdict ?? "Review Required";
  const patentStrength = data.document_metadata?.patent_strength ?? (parseFloat(overallScore) > 70 ? "Strong" : "Moderate");
  const mainRisk = data.document_metadata?.main_risk ?? "Incomplete technical disclosure";
  const summary = data.executive_verdict?.summary ?? data.summary ?? "Evaluation summary not available.";
  const recommendedAction = data.executive_verdict?.recommended_action ?? (data.final_recommendation?.best_filing_path?.provisional_filing?.[0] ?? "Improve technical disclosure before filing.");

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 p-10 shadow-sm border border-gray-100 dark:border-zinc-800 font-sans text-gray-900 dark:text-gray-100">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-black tracking-tight mb-2 uppercase border-b-4 border-indigo-600 inline-block pb-1 text-gray-900 dark:text-white">
          {data.document_title || "Patent Scoring and Improvement Report"}
        </h1>
        <h2 className="text-xl font-bold text-gray-600 dark:text-gray-400 mt-4 max-w-2xl mx-auto leading-tight">
          {data.invention_title || "Invention Disclosure"}
        </h2>
        <p className="text-sm font-medium text-gray-400 mt-2 uppercase tracking-widest">
          Internal Patent-Screening Evaluation
        </p>
      </div>

      {/* Meta Stats Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="space-y-4">
          <div className="flex justify-between border-b border-gray-100 dark:border-zinc-800 pb-2">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Overall Score</span>
            <span className="text-lg font-black text-indigo-600">{overallScore} / 100</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 dark:border-zinc-800 pb-2">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Filing Status</span>
            <span className="text-sm font-semibold">{filingStatus}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 dark:border-zinc-800 pb-2">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Patent Strength</span>
            <span className="text-sm font-semibold text-emerald-600">{patentStrength}</span>
          </div>
        </div>
        <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/20">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="h-4 w-4 text-indigo-600" />
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Main Risk</span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium italic">
            "{mainRisk}"
          </p>
        </div>
      </div>

      {/* 1. Executive Verdict */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold">1</div>
          <h3 className="text-xl font-bold uppercase tracking-tight">Executive Verdict</h3>
        </div>
        <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>{summary}</p>
          <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
            <p className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-1 flex items-center gap-2">
              <Zap className="h-4 w-4" /> Recommended Action
            </p>
            <p className="text-sm font-medium">{recommendedAction}</p>
          </div>
        </div>
      </section>

      {/* 2. Detailed Scoring Table */}
      {(data.detailed_scoring || data.analysis) && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold">2</div>
            <h3 className="text-xl font-bold uppercase tracking-tight">Detailed Scoring</h3>
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-zinc-800">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-zinc-800/50">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Parameter</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Score</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Comment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
                {data.detailed_scoring ? (
                  data.detailed_scoring.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{item.parameter}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-indigo-600">{item.score}/10</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 leading-relaxed">{item.review_comment}</td>
                    </tr>
                  ))
                ) : (
                  Object.entries(data.analysis || {}).map(([key, val]: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{key}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-indigo-600">{val}/10</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 leading-relaxed">Detailed analysis available in PDF.</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 3. Key Strengths */}
      {(data.key_strengths || data.strengths) && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold">3</div>
            <h3 className="text-xl font-bold uppercase tracking-tight">Key Strengths</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.key_strengths ? (
              data.key_strengths.map((s: any, i: number) => (
                <div key={i} className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/20 bg-emerald-50/30 dark:bg-emerald-900/5">
                  <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 mb-1">
                    <CheckCircle2 className="h-4 w-4" /> {s.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{s.description}</p>
                </div>
              ))
            ) : (
              (data.strengths || []).map((s: string, i: number) => (
                <div key={i} className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/20 bg-emerald-50/30 dark:bg-emerald-900/5">
                  <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 mb-1">
                    <CheckCircle2 className="h-4 w-4" /> Strength {i+1}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{s}</p>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* 4. Major Weaknesses and Improvements */}
      {(data.major_weaknesses_and_improvements) && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold">4</div>
            <h3 className="text-xl font-bold uppercase tracking-tight">Major Weaknesses</h3>
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-zinc-800">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 dark:bg-zinc-800/50">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Weakness</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Problem</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Improvement Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
                {data.major_weaknesses_and_improvements.map((item: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{item.weakness}</td>
                    <td className="px-6 py-4 text-xs text-gray-500 leading-relaxed">{item.problem}</td>
                    <td className="px-6 py-4 text-xs font-medium text-indigo-600 dark:text-indigo-400">{item.improvement_action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 5. Improved Core Inventive Concept */}
      {(data.improved_core_inventive_concept) && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold">5</div>
            <h3 className="text-xl font-bold uppercase tracking-tight">Inventive Concept</h3>
          </div>
          <div className="p-6 rounded-2xl bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20 italic text-gray-700 dark:text-gray-300 leading-relaxed">
            "{data.improved_core_inventive_concept.concept}"
          </div>
        </section>
      )}

      {/* 6. Claim Structure */}
      {(data.recommended_claim_structure) && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold">6</div>
            <h3 className="text-xl font-bold uppercase tracking-tight">Claim Structure</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">Independent System Claim</h4>
              <ul className="space-y-2">
                {data.recommended_claim_structure.independent_system_claim?.components?.map((c: string, i: number) => (
                  <li key={i} className="text-xs text-gray-500 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" /> {c}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">Independent Method Claim</h4>
              <ol className="space-y-2">
                {data.recommended_claim_structure.independent_method_claim?.steps?.map((s: string, i: number) => (
                  <li key={i} className="text-xs text-gray-500 flex gap-2">
                    <span className="font-bold text-indigo-600">{i + 1}.</span> {s}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      )}

      {/* Footer Disclaimer */}
      <div className="mt-20 pt-8 border-t border-gray-100 dark:border-zinc-800 text-[10px] text-gray-400 text-center leading-relaxed max-w-2xl mx-auto">
        <p>
          <strong>DISCLAIMER:</strong> {data.document_metadata?.important_note}
        </p>
      </div>
    </div>
  );
}
