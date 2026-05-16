"use client";

import { StatusBadge } from "./status-badge";
import { FileText, AlertTriangle, CheckCircle2, TrendingUp, ShieldAlert, Zap, X } from "lucide-react";

interface ReportContentProps {
  data: any;
}

interface ReportPageProps {
  children: React.ReactNode;
}

const ReportPage = ({ children }: ReportPageProps) => (
  <div className="relative w-full min-h-[1122px] bg-white dark:bg-zinc-900 p-[15mm] md:p-[20mm] shadow-xl mb-10 border border-gray-100 dark:border-zinc-800 overflow-hidden mx-auto first:mt-4 last:mb-4 group select-none">
    {/* Page Numbering Simulation */}
    <div className="absolute bottom-8 right-8 text-[10px] font-bold text-gray-300 dark:text-zinc-700 uppercase tracking-widest">
      PatentIQ Report
    </div>
    
    {/* Watermark for each page */}
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-[0.03] dark:opacity-[0.06] z-0">
      <img src="/icon0.svg" alt="" className="w-[550px] h-[500px] object-contain" />
    </div>

    <div className="relative z-10 h-full">
      {children}
    </div>
  </div>
);

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
    <div className="max-w-4xl mx-auto font-sans text-gray-900 dark:text-gray-100 py-4">
      {/* Page 1: Overview & Executive Summary */}
      <ReportPage>
        {/* Header Section */}
        <div className="text-center mb-16 pt-8">
          <h1 className="text-3xl font-black tracking-tight mb-3 uppercase border-b-4 border-indigo-600 inline-block pb-1 text-gray-900 dark:text-white">
            {data.document_title || "Patent Scoring and Improvement Report"}
          </h1>
          <h2 className="text-xl font-bold text-gray-600 dark:text-gray-400 mt-4 max-w-2xl mx-auto leading-tight">
            {data.invention_title || "Invention Disclosure"}
          </h2>
          <p className="text-sm font-medium text-gray-400 mt-4 uppercase tracking-[0.2em]">
            Internal Patent-Screening Evaluation
          </p>
        </div>

        {/* Meta Stats Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          <div className="space-y-5">
            <div className="flex justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Overall Score</span>
              <span className="text-xl font-black text-indigo-600">{overallScore} / 100</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Filing Status</span>
              <span className="text-sm font-semibold">{filingStatus}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Patent Strength</span>
              <span className="text-sm font-semibold text-emerald-600">{patentStrength}</span>
            </div>
          </div>
          <div className="p-6 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-md border border-indigo-100 dark:border-indigo-900/20">
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="h-4 w-4 text-indigo-600" />
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Main Risk Factor</span>
            </div>
            <p className="text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed font-medium italic">
              "{mainRisk}"
            </p>
          </div>
        </div>

        {/* 1. Executive Verdict */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-8 w-8 rounded-md bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm">1</div>
            <h3 className="text-lg font-bold uppercase tracking-widest">Executive Verdict</h3>
          </div>
          <div className="space-y-6 text-[14px] text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>{summary}</p>
            <div className="p-6 rounded-md bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
              <p className="text-xs font-bold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-2 uppercase tracking-widest">
                <Zap className="h-3.5 w-3.5" /> Recommended Action
              </p>
              <p className="text-sm font-medium">{recommendedAction}</p>
            </div>
          </div>
        </section>
      </ReportPage>

      {/* Page 2: Detailed Analysis & Key Strengths */}
      {(data.detailed_scoring || data.analysis || data.key_strengths || data.strengths) && (
        <ReportPage>
          {/* 2. Detailed Scoring Table */}
          {(data.detailed_scoring || data.analysis) && (
            <section className="mb-20">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-8 w-8 rounded-md bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm">2</div>
                <h3 className="text-lg font-bold uppercase tracking-widest">Detailed Scoring</h3>
              </div>
              <div className="overflow-hidden rounded-md border border-gray-100 dark:border-zinc-800">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-zinc-800/50">
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Parameter</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Score</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Review Comment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
                    {data.detailed_scoring ? (
                      data.detailed_scoring.map((item: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                          <td className="px-6 py-5 text-sm font-bold text-gray-900 dark:text-white">{item.parameter}</td>
                          <td className="px-6 py-5">
                            <span className="text-sm font-black text-indigo-600">{parseFloat(item.score).toFixed(0)}/100</span>
                          </td>
                          <td className="px-6 py-5 text-[12px] text-gray-500 leading-relaxed">{item.review_comment}</td>
                        </tr>
                      ))
                    ) : (
                      Object.entries(data.analysis || {}).map(([key, val]: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                          <td className="px-6 py-5 text-sm font-bold text-gray-900 dark:text-white">{key}</td>
                          <td className="px-6 py-5">
                            <span className="text-sm font-black text-indigo-600">{parseFloat(val).toFixed(0)}/100</span>
                          </td>
                          <td className="px-6 py-5 text-[12px] text-gray-500 leading-relaxed">Detailed analysis available in PDF.</td>
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
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="h-8 w-8 rounded-md bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm">3</div>
                <h3 className="text-lg font-bold uppercase tracking-widest">Key Strengths</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.key_strengths ? (
                  data.key_strengths.map((s: any, i: number) => (
                    <div key={i} className="p-5 rounded-md border border-emerald-100 dark:border-emerald-900/20 bg-emerald-50/30 dark:bg-emerald-900/5">
                      <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4" /> {s.title}
                      </h4>
                      <p className="text-[12px] text-gray-600 dark:text-gray-400 leading-relaxed">{s.description}</p>
                    </div>
                  ))
                ) : (
                  (data.strengths || []).map((s: string, i: number) => (
                    <div key={i} className="p-5 rounded-md border border-emerald-100 dark:border-emerald-900/20 bg-emerald-50/30 dark:bg-emerald-900/5">
                      <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4" /> Strength {i+1}
                      </h4>
                      <p className="text-[12px] text-gray-600 dark:text-gray-400 leading-relaxed">{s}</p>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}
        </ReportPage>
      )}

      {/* Page 3: Reference Patents & Weaknesses */}
      {(data.stage_1?.patent_ids || data.patent_identifiers || data.major_weaknesses_and_improvements) && (
        <ReportPage>
          {/* 4. Patent Identifiers & Validation */}
          {(data.stage_1?.patent_ids || data.patent_identifiers) && (
            <section className="mb-20">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-8 w-8 rounded-md bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm">4</div>
                <h3 className="text-lg font-bold uppercase tracking-widest">Reference Patents</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {(data.stage_1?.patent_ids || data.patent_identifiers || []).map((id: string, i: number) => {
                  const isValid = data.stage_1?.valid_ids?.includes(id);
                  const isInvalid = data.stage_1?.invalid_ids?.includes(id);
                  
                  return (
                    <div key={i} className="flex items-center justify-between p-4 rounded-md border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/20">
                      <span className="text-[13px] font-mono font-bold text-gray-700 dark:text-gray-300">{id}</span>
                      {isValid ? (
                        <div className="flex items-center gap-1 text-emerald-600">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-[9px] font-bold uppercase tracking-tighter">Verified</span>
                        </div>
                      ) : isInvalid ? (
                        <div className="flex items-center gap-1 text-red-500">
                          <X className="h-4 w-4" />
                          <span className="text-[9px] font-bold uppercase tracking-tighter">Invalid</span>
                        </div>
                      ) : (
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Extracted</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 5. Major Weaknesses and Improvements */}
          {(data.major_weaknesses_and_improvements) && (
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="h-8 w-8 rounded-md bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm">5</div>
                <h3 className="text-lg font-bold uppercase tracking-widest">Major Weaknesses</h3>
              </div>
              <div className="overflow-hidden rounded-md border border-gray-100 dark:border-zinc-800">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-zinc-800/50">
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Weakness</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Problem</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Improvement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
                    {data.major_weaknesses_and_improvements.map((item: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-5 text-sm font-bold text-gray-900 dark:text-white">{item.weakness}</td>
                        <td className="px-6 py-5 text-[12px] text-gray-500 leading-relaxed">{item.problem}</td>
                        <td className="px-6 py-5 text-[12px] font-medium text-indigo-600 dark:text-indigo-400">{item.improvement_action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </ReportPage>
      )}

      {/* Page 4: Inventive Concept & Claim Structure */}
      {(data.improved_core_inventive_concept || data.recommended_claim_structure) && (
        <ReportPage>
          {/* 6. Improved Core Inventive Concept */}
          {(data.improved_core_inventive_concept) && (
            <section className="mb-20">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-8 w-8 rounded-md bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm">6</div>
                <h3 className="text-lg font-bold uppercase tracking-widest">Inventive Concept</h3>
              </div>
              <div className="p-8 rounded-md bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20 italic text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed">
                "{data.improved_core_inventive_concept.concept}"
              </div>
            </section>
          )}

          {/* 7. Claim Structure */}
          {(data.recommended_claim_structure) && (
            <section className="mb-20">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-8 w-8 rounded-md bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm">7</div>
                <h3 className="text-lg font-bold uppercase tracking-widest">Claim Structure</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h4 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 mb-5 uppercase tracking-widest">Independent System Claim</h4>
                  <ul className="space-y-4">
                    {data.recommended_claim_structure.independent_system_claim?.components?.map((c: string, i: number) => (
                      <li key={i} className="text-[13px] text-gray-500 flex items-start gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" /> {c}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 mb-5 uppercase tracking-widest">Independent Method Claim</h4>
                  <ol className="space-y-4">
                    {data.recommended_claim_structure.independent_method_claim?.steps?.map((s: string, i: number) => (
                      <li key={i} className="text-[13px] text-gray-500 flex gap-3">
                        <span className="font-bold text-indigo-600">{i + 1}.</span> {s}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </section>
          )}

          {/* Footer Disclaimer */}
          <div className="mt-auto pt-12 border-t border-gray-100 dark:border-zinc-800 text-[10px] text-gray-400 text-center leading-relaxed max-w-2xl mx-auto italic">
            <p>
              <strong>DISCLAIMER:</strong> {data.document_metadata?.important_note || "This report is an automated assessment and does not constitute legal advice."}
            </p>
          </div>
        </ReportPage>
      )}
    </div>
  );
}
