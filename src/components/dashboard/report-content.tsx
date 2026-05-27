"use client";

import { StatusBadge } from "./status-badge";
import { FileText, AlertTriangle, CheckCircle2, TrendingUp, ShieldAlert, Zap, X, Mail, Building } from "lucide-react";

interface ReportContentProps {
  data: any;
}

interface ReportPageProps {
  children: React.ReactNode;
  isCover?: boolean;
}

const ReportPage = ({ children, isCover }: ReportPageProps) => (
  <div className={`relative w-full max-w-[850px] min-h-0 sm:min-h-[1122px] bg-white dark:bg-zinc-900 shadow-2xl mb-6 sm:mb-10 border border-gray-100 dark:border-zinc-800 overflow-hidden mx-auto first:mt-0 sm:first:mt-2 last:mb-4 group select-none transition-all rounded-sm sm:rounded-none ${isCover ? '' : 'p-5 sm:p-[15mm] md:p-[20mm]'}`}>
    {/* Page Numbering Simulation */}
    <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 text-[9px] sm:text-[10px] font-bold text-gray-300 dark:text-zinc-700 uppercase tracking-widest">
      PatentIQ Report
    </div>

    {/* Watermark for each page */}
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-[0.03] dark:opacity-[0.05] z-0">
      <img src="/icon0.svg" alt="" className="w-[300px] h-[300px] sm:w-[550px] sm:h-[500px] object-contain" />
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

  let scoringData = null;
  if (data.detailed_scoring) {
    scoringData = data.detailed_scoring;
  } else if (data.analysis) {
    scoringData = Object.entries(data.analysis).map(([key, val]) => ({
      parameter: key,
      score: val,
      review_comment: "Detailed analysis available in PDF."
    }));
  }

  const scoringFirstHalf = scoringData ? scoringData.slice(0, Math.ceil(scoringData.length / 2)) : null;
  const scoringSecondHalf = scoringData ? scoringData.slice(Math.ceil(scoringData.length / 2)) : null;

  const renderScoringTable = (items: any[], showHeader: boolean = true) => (
    <div className="overflow-x-auto rounded-md border border-gray-100 dark:border-zinc-800 -mx-1 sm:mx-0">
      <table className="w-full text-left min-w-[500px] sm:min-w-full">
        {showHeader && (
          <thead>
            <tr className="bg-gray-50 dark:bg-zinc-800/50">
              <th className="px-4 sm:px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Parameter</th>
              <th className="px-4 sm:px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Score</th>
              <th className="px-4 sm:px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Review Comment</th>
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
          {items.map((item: any, i: number) => {
            const maxScores: Record<string, number> = {
              "Problem relevance": 5,
              "Novelty potential": 15,
              "Inventive step": 20,
              "Technical disclosure": 10,
              "Claim readiness": 5,
              "Prior-art differentiation": 5,
              "Commercial potential": 5,
              "Prototype readiness": 5,
              "Drafting quality": 5,
              "Patentability strength": 10,
              "Research integrity": 15
            };
            const maxScore = maxScores[item.parameter] || 100;
            return (
              <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 sm:px-6 py-4 sm:py-5 text-sm font-bold text-gray-900 dark:text-white">{item.parameter}</td>
                <td className="px-4 sm:px-6 py-4 sm:py-5">
                  <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                    {parseFloat(item.score).toFixed(0)}/{maxScore}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-4 sm:py-5 text-[11px] sm:text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed">{item.review_comment}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="w-full font-sans text-gray-900 dark:text-gray-100 py-0 sm:py-4 px-0 sm:px-4 flex flex-col items-center">
      {/* Cover Page */}
      <ReportPage isCover>
        <div className="flex flex-col h-full min-h-[1000px] sm:min-h-[1122px] justify-between relative">
          {/* Top Decorative Line */}
          <div className="absolute top-24 left-0 right-0 flex items-center justify-center opacity-50">
            <div className="flex-1 h-[1px] bg-indigo-200 dark:bg-indigo-900/50 relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-indigo-500" />
            </div>
            <div className="w-64" />
            <div className="flex-1 h-[1px] bg-indigo-200 dark:bg-indigo-900/50 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-indigo-500" />
            </div>
          </div>

          {/* Top Logo */}
          <div className="flex flex-col items-center pt-20 relative z-10 bg-white dark:bg-zinc-900 px-8 self-center">
            <div className="flex items-center gap-4">
              <img src="/icon0.svg" alt="PatentIQ Logo" className="h-16 w-16" />
              <div className="flex flex-col">
                <span className="text-4xl font-bold text-[#0f172a] dark:text-white tracking-tight">PatentIQ</span>
                <span className="text-[12px] font-medium text-gray-500 tracking-wide mt-1">Intelligence. Prior Art. Advantage.</span>
              </div>
            </div>
          </div>

          {/* Center Titles */}
          <div className="flex flex-col items-center mt-12 mb-10 relative z-10">
            <h1 className="text-[16px] sm:text-[24px] font-bold tracking-tight text-[#0f172a] dark:text-white mb-4 uppercase">
              EVALUATION REPORT
            </h1>
            <div className="w-16 h-[2px] bg-indigo-500 rounded-full mb-6" />
            <p className="text-[16px] sm:text-[18px] font-bold text-[#0f172a] dark:text-indigo-400 text-center max-w-4xl px-4 leading-relaxed">
              {data.invention_title || data.document_title || "Invention Disclosure"}
            </p>
          </div>

          {/* Bottom Info */}
          <div className="mt-8 w-full relative z-10 px-8 sm:px-16">
            <div className="w-full rounded-xl border-2 border-indigo-100 dark:border-indigo-900/20 bg-white/50 dark:bg-zinc-900/30 backdrop-blur-sm overflow-hidden shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y-2 sm:divide-y-0 sm:divide-x-2 divide-indigo-100 dark:divide-indigo-900/20">
                {/* Left Side */}
                <div className="p-6 flex flex-col gap-6">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">Submitted By</span>
                    <span className="text-[16px] font-bold text-[#0f172a] dark:text-white leading-none">{data.submitter_name || "Student"}</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">Email Address</span>
                    <span className="text-[16px] font-medium text-[#0f172a] dark:text-white leading-none">{data.submitter_email || "Not Provided"}</span>
                  </div>
                </div>

                {/* Right Side */}
                <div className="p-6 flex flex-col gap-6">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">Assigned To</span>
                    <span className="text-[16px] font-bold text-[#0f172a] dark:text-white leading-none">{data.assignee_name || "Mentor"}</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">Group / Cohort</span>
                    <span className="text-[16px] font-medium text-[#0f172a] dark:text-white leading-none">{data.group_name || "N/A"}</span>
                  </div>
                </div>
              </div>
              
              {/* Bottom Strip */}
              <div className="bg-gray-50 dark:bg-zinc-950/50 px-6 py-3 border-t-2 border-indigo-100 dark:border-indigo-900/20 flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Report Date</span>
                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 tracking-wide">
                  {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Meta Stats Table */}
          <div className="mb-auto mt-20 sm:mt-24 w-full px-16 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
              <div className="space-y-4 sm:space-y-5">
                <div className="flex justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
                  <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest">Overall Score</span>
                  <span className="text-lg sm:text-xl font-black text-indigo-600">{overallScore} / 100</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
                  <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest">Filing Status</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{filingStatus}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
                  <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest">Patent Strength</span>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{patentStrength}</span>
                </div>
              </div>
              <div className="p-5 sm:p-6 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-md border border-indigo-100 dark:border-indigo-900/20">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldAlert className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Main Risk Factor</span>
                </div>
                <p className="text-[12px] sm:text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed font-medium italic">
                  "{mainRisk}"
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto w-full border-t border-indigo-100 dark:border-indigo-900/20 py-6 flex items-center justify-center gap-4 bg-gray-50 dark:bg-zinc-900/50">
            <img src="/diaicon.png" alt="DiaLabs" className="h-10 w-10 object-contain invert dark:invert-0" />
            <div className="flex flex-col">
              <span className="text-[16px] font-bold text-[#0f172a] dark:text-white tracking-tight leading-none mb-1">DiaLabs</span>
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest leading-none">AI-Powered Innovation</span>
            </div>
          </div>
        </div>
      </ReportPage>

      {/* Page 1: Overview & Executive Summary */}
      <ReportPage>
        {/* 1. Executive Verdict */}
        <section className="mb-12 sm:mb-16">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-md bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm">1</div>
            <h3 className="text-base sm:text-lg font-bold uppercase tracking-widest">Executive Verdict</h3>
          </div>
          <div className="space-y-6 text-[13px] sm:text-[14px] text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>{summary}</p>
            <div className="p-5 sm:p-6 rounded-md bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
              <p className="text-[10px] sm:text-xs font-bold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-2 uppercase tracking-widest">
                <Zap className="h-3.5 w-3.5" /> Recommended Action
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{recommendedAction}</p>
            </div>
          </div>
        </section>

        {/* 2. Detailed Scoring Table (Part 1) */}
        {scoringFirstHalf && scoringFirstHalf.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-md bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm">2</div>
              <h3 className="text-base sm:text-lg font-bold uppercase tracking-widest text-gray-900 dark:text-white">Detailed Scoring</h3>
            </div>
            {renderScoringTable(scoringFirstHalf, true)}
          </section>
        )}
      </ReportPage>

      {/* Page 2: Detailed Analysis & Key Strengths */}
      {((scoringSecondHalf && scoringSecondHalf.length > 0) || data.key_strengths || data.strengths) && (
        <ReportPage>
          {/* 2. Detailed Scoring Table (Second Half) */}
          {scoringSecondHalf && scoringSecondHalf.length > 0 && (
            <section className="mb-16 sm:mb-20">

              {renderScoringTable(scoringSecondHalf, true)}
            </section>
          )}

          {/* 3. Key Strengths */}
          {(data.key_strengths || data.strengths) && (
            <section>
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-md bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm">3</div>
                <h3 className="text-base sm:text-lg font-bold uppercase tracking-widest">Key Strengths</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {data.key_strengths ? (
                  data.key_strengths.map((s: any, i: number) => (
                    <div key={i} className="p-4 sm:p-5 rounded-md border border-emerald-100 dark:border-emerald-900/20 bg-emerald-50/30 dark:bg-emerald-900/5">
                      <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4" /> {s.title}
                      </h4>
                      <p className="text-[11px] sm:text-[12px] text-gray-600 dark:text-gray-400 leading-relaxed">{s.description}</p>
                    </div>
                  ))
                ) : (
                  (data.strengths || []).map((s: any, i: number) => {
                    const title = typeof s === 'object' ? s.title : `Strength ${i + 1}`;
                    const description = typeof s === 'object' ? s.description : s;
                    return (
                      <div key={i} className="p-4 sm:p-5 rounded-md border border-emerald-100 dark:border-emerald-900/20 bg-emerald-50/30 dark:bg-emerald-900/5">
                        <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-4 w-4" /> {title}
                        </h4>
                        <p className="text-[11px] sm:text-[12px] text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          )}
        </ReportPage>
      )}

      {/* Page 3: Reference Patents & Weaknesses */}
      {(data.stage_1?.patent_ids || data.patent_identifiers || data.valid_patent_ids || data.major_weaknesses_and_improvements) && (
        <ReportPage>
          {/* 4. Patent Identifiers & Validation */}
          {(data.stage_1?.patent_ids || data.patent_identifiers || data.valid_patent_ids) && (
            <section className="mb-16 sm:mb-20">
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-md bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm">4</div>
                <h3 className="text-base sm:text-lg font-bold uppercase tracking-widest">Reference Validity</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                {(data.stage_1?.patent_ids || data.patent_identifiers || data.valid_patent_ids || []).map((id: string, i: number) => {
                  const isValid = data.stage_1?.valid_ids?.includes(id) || data.valid_patent_ids?.includes(id);
                  const isInvalid = data.stage_1?.invalid_ids?.includes(id) || data.invalid_patent_ids?.includes(id);

                  return (
                    <div key={i} className="flex items-center justify-between p-3 sm:p-4 rounded-md border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/20">
                      <span className="text-[12px] sm:text-[13px] font-mono font-bold text-gray-700 dark:text-gray-300">{id}</span>
                      {isValid ? (
                        <CheckCircle2 className="h-4 sm:h-5 w-4 sm:w-5 text-emerald-600 dark:text-emerald-400" />
                      ) : isInvalid ? (
                        <X className="h-4 sm:h-5 w-4 sm:w-5 text-red-500" />
                      ) : (
                        <span className="text-[8px] sm:text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">Extracted</span>
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
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-md bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm">5</div>
                <h3 className="text-base sm:text-lg font-bold uppercase tracking-widest">Major Weaknesses</h3>
              </div>
              <div className="overflow-x-auto rounded-md border border-gray-100 dark:border-zinc-800 -mx-1 sm:mx-0">
                <table className="w-full text-left min-w-[500px] sm:min-w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-zinc-800/50">
                      <th className="px-4 sm:px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Weakness</th>
                      <th className="px-4 sm:px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Problem</th>
                      <th className="px-4 sm:px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Improvement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
                    {data.major_weaknesses_and_improvements.map((item: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 sm:px-6 py-4 sm:py-5 text-sm font-bold text-gray-900 dark:text-white">{item.weakness}</td>
                        <td className="px-4 sm:px-6 py-4 sm:py-5 text-[11px] sm:text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed">{item.problem}</td>
                        <td className="px-4 sm:px-6 py-4 sm:py-5 text-[11px] sm:text-[12px] font-medium text-indigo-600 dark:text-indigo-400">{item.improvement_action}</td>
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
            <section className="mb-16 sm:mb-20">
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-md bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm">6</div>
                <h3 className="text-base sm:text-lg font-bold uppercase tracking-widest">Inventive Concept</h3>
              </div>
              <div className="p-5 sm:p-8 rounded-md bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20 italic text-[14px] sm:text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed">
                "{data.improved_core_inventive_concept.concept}"
              </div>
            </section>
          )}

          {/* 7. Claim Structure */}
          {(data.recommended_claim_structure) && (
            <section className="mb-16 sm:mb-20">
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-md bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm">7</div>
                <h3 className="text-base sm:text-lg font-bold uppercase tracking-widest">Claim Structure</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
                <div>
                  <h4 className="text-[10px] sm:text-[11px] font-bold text-gray-400 dark:text-gray-500 mb-4 sm:mb-5 uppercase tracking-widest">Independent System Claim</h4>
                  <ul className="space-y-3 sm:space-y-4">
                    {data.recommended_claim_structure.independent_system_claim?.components?.map((c: string, i: number) => (
                      <li key={i} className="text-[12px] sm:text-[13px] text-gray-500 dark:text-gray-400 flex items-start gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 dark:bg-indigo-500 mt-1.5 flex-shrink-0" /> {c}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] sm:text-[11px] font-bold text-gray-400 dark:text-gray-500 mb-4 sm:mb-5 uppercase tracking-widest">Independent Method Claim</h4>
                  <ol className="space-y-3 sm:space-y-4">
                    {data.recommended_claim_structure.independent_method_claim?.steps?.map((s: string, i: number) => (
                      <li key={i} className="text-[12px] sm:text-[13px] text-gray-500 dark:text-gray-400 flex gap-3">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{i + 1}.</span> {s}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </section>
          )}

          {/* 8. Risk Assessment */}
          {(data.risk_areas || data.risk_score_framework) && (
            <section className="mb-16 sm:mb-20">
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-md bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm">8</div>
                <h3 className="text-base sm:text-lg font-bold uppercase tracking-widest">Risk Assessment</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-[10px] sm:text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Risk Areas</h4>
                  {data.risk_areas?.map((r: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 sm:p-4 rounded-md border border-gray-100 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-800/40">
                      <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">{r.risk_area}</span>
                      <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full ${r.risk_level === 'High' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                        r.risk_level === 'Medium' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                          'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                        }`}>
                        {r.risk_level}
                      </span>
                    </div>
                  ))}
                </div>
                {data.risk_score_framework && (
                  <div className="p-5 sm:p-6 rounded-md bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 shadow-inner">
                    <h4 className="text-[10px] sm:text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Framework</h4>
                    <p className="text-[11px] sm:text-xs text-indigo-600 dark:text-indigo-400 font-mono leading-relaxed mb-4">{data.risk_score_framework.formula}</p>
                    <div className="space-y-2 sm:space-y-3">
                      {data.risk_score_framework.parameters?.map((p: any, i: number) => (
                        <div key={i} className="text-[10px] sm:text-[11px] text-gray-600 dark:text-gray-400 flex justify-between">
                          <span className="font-bold">{p.symbol} ({p.meaning})</span>
                          <span className="text-gray-400 dark:text-gray-500">Threshold: {p.threshold}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </ReportPage>
      )}

      {/* Page 5: Prior Art & Technical Roadmap */}
      {(data.prior_art_differentiation_matrix || data.missing_technical_details || data.prototype_component_table) && (
        <ReportPage>
          {/* 9. Prior Art Differentiation Matrix */}
          {data.prior_art_differentiation_matrix && (
            <section className="mb-16 sm:mb-20">
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-md bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm">9</div>
                <h3 className="text-base sm:text-lg font-bold uppercase tracking-widest text-gray-900 dark:text-white">Prior Art Matrix</h3>
              </div>
              <div className="overflow-x-auto rounded-md border border-gray-100 dark:border-zinc-800 -mx-1 sm:mx-0">
                <table className="w-full text-left min-w-[500px] sm:min-w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-zinc-800/50">
                      <th className="px-4 sm:px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Prior Art Type</th>
                      <th className="px-4 sm:px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Limitation</th>
                      <th className="px-4 sm:px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Differentiation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
                    {data.prior_art_differentiation_matrix.map((item: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 sm:px-6 py-4 sm:py-5 text-sm font-bold text-gray-900 dark:text-white">{item.prior_art_type}</td>
                        <td className="px-4 sm:px-6 py-4 sm:py-5 text-[11px] sm:text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed">{item.limitation}</td>
                        <td className="px-4 sm:px-6 py-4 sm:py-5 text-[11px] sm:text-[12px] font-medium text-indigo-600 dark:text-indigo-400">{item.differentiation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* 10. Technical Roadmap */}
          {(data.missing_technical_details || data.prototype_component_table) && (
            <section>
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-md bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm">10</div>
                <h3 className="text-base sm:text-lg font-bold uppercase tracking-widest">Technical Roadmap</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-[10px] sm:text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Missing Details</h4>
                  <div className="space-y-4">
                    {Object.entries(data.missing_technical_details || {}).map(([cat, details]: any, i: number) => (
                      <div key={i}>
                        <p className="text-[9px] sm:text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase mb-2">{cat}</p>
                        <ul className="space-y-1">
                          {details.map((d: string, j: number) => (
                            <li key={j} className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                              <div className="h-1 w-1 rounded-full bg-gray-300 dark:bg-zinc-700 mt-1.5" /> {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
                {data.prototype_component_table && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] sm:text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Implementation Path</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {data.prototype_component_table.map((item: any, i: number) => (
                        <div key={i} className="p-4 rounded-md border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/40 shadow-sm">
                          <p className="text-[11px] sm:text-xs font-bold text-gray-900 dark:text-white mb-1">{item.component}</p>
                          <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">{item.implementation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </ReportPage>
      )}

      {/* Page 6: Commercial & Drafting */}
      {(data.commercialization_feedback || data.improved_drafting_text || data.final_recommendation || data.expected_improved_score_after_revision) && (
        <ReportPage>
          {/* 11. Commercial Potential */}
          {data.commercialization_feedback && (
            <section className="mb-16 sm:mb-20">
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-md bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm">11</div>
                <h3 className="text-base sm:text-lg font-bold uppercase tracking-widest">Commercial Potential</h3>
              </div>
              <div className="p-5 sm:p-6 rounded-md bg-emerald-50/30 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 mb-6 flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-400">Market Potential Score</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">{data.commercialization_feedback.score}/10</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div>
                  <h4 className="text-[10px] sm:text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Target Segments</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.commercialization_feedback.targets?.map((t: string, i: number) => (
                      <span key={i} className="px-2 sm:px-3 py-1 bg-white dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 rounded-full text-[10px] sm:text-[11px] font-medium text-gray-700 dark:text-gray-300">{t}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] sm:text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Revenue Models</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.commercialization_feedback.revenue_models?.map((m: string, i: number) => (
                      <span key={i} className="px-2 sm:px-3 py-1 bg-white dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 rounded-full text-[10px] sm:text-[11px] font-medium text-gray-700 dark:text-gray-300">{m}</span>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 12. Improved Drafting Suggestions */}
          {data.improved_drafting_text && (
            <section className="mb-16 sm:mb-20">
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-md bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm">12</div>
                <h3 className="text-base sm:text-lg font-bold uppercase tracking-widest">Drafting Improvements</h3>
              </div>
              <div className="space-y-5 sm:space-y-6">
                <div>
                  <h4 className="text-[10px] sm:text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Refined Problem Statement</h4>
                  <p className="text-[13px] sm:text-sm italic text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800/50 p-4 rounded border-l-4 border-indigo-500 shadow-sm leading-relaxed">"{data.improved_drafting_text.problem_statement}"</p>
                </div>
                <div>
                  <h4 className="text-[10px] sm:text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Novelty Statement</h4>
                  <p className="text-[13px] sm:text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed">{data.improved_drafting_text.novelty_statement}</p>
                </div>
                <div>
                  <h4 className="text-[10px] sm:text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Technical Contributions</h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {data.improved_drafting_text.technical_contributions?.map((c: string, i: number) => (
                      <li key={i} className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <Zap className="h-3 w-3 text-amber-500 flex-shrink-0" /> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* 13. Revision Path & Expected Score */}
          {(data.final_recommendation || data.expected_improved_score_after_revision) && (
            <section>
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-md bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm">13</div>
                <h3 className="text-base sm:text-lg font-bold uppercase tracking-widest">Revision Roadmap</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8">
                <div className="p-5 sm:p-6 rounded-md bg-indigo-600 text-white shadow-xl shadow-indigo-600/20">
                  <h4 className="text-[10px] sm:text-[11px] font-bold opacity-70 uppercase tracking-widest mb-4">Post-Revision Projection</h4>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl sm:text-4xl font-black">{data.expected_improved_score_after_revision?.expected_overall_score || "90+"}</span>
                    <span className="text-xs sm:text-sm font-bold opacity-80">Target Score</span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] opacity-90 leading-relaxed italic">"Potential verdict after implementing suggested improvements: {data.expected_improved_score_after_revision?.final_verdict}"</p>
                </div>
                <div className="space-y-4 sm:space-y-5">
                  <div>
                    <h4 className="text-[10px] sm:text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Best Filing Path</h4>
                    <div className="space-y-3">
                      {data.final_recommendation?.best_filing_path?.provisional_filing && (
                        <div>
                          <p className="text-[9px] sm:text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase mb-1">Provisional</p>
                          <ul className="text-[10px] sm:text-[11px] text-gray-600 dark:text-gray-400 list-disc list-inside">
                            {data.final_recommendation.best_filing_path.provisional_filing.map((a: string, i: number) => <li key={i}>{a}</li>)}
                          </ul>
                        </div>
                      )}
                      {data.final_recommendation?.best_filing_path?.complete_filing && (
                        <div>
                          <p className="text-[9px] sm:text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase mb-1">Complete</p>
                          <ul className="text-[10px] sm:text-[11px] text-gray-600 dark:text-gray-400 list-disc list-inside">
                            {data.final_recommendation.best_filing_path.complete_filing.map((a: string, i: number) => <li key={i}>{a}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 14. Research Integrity Breakdown */}
          {data.patent_id_score_breakdown && (
            <section className="mt-16 sm:mt-20">
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-md bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm">14</div>
                <h3 className="text-base sm:text-lg font-bold uppercase tracking-widest">Integrity Breakdown</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="p-4 sm:p-5 rounded-md border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                  <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase mb-1">Verification Stats</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs">Valid: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{data.patent_id_score_breakdown.valid_count}</span></span>
                    <span className="text-[11px] sm:text-xs">Fake: <span className="text-red-500 font-bold">{data.patent_id_score_breakdown.invalid_count}</span></span>
                  </div>
                </div>
                <div className="p-4 sm:p-5 rounded-md border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                  <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase mb-1">Score Contribution</p>
                  <div className="flex items-center justify-between">
                    <span className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400">{data.patent_id_score_breakdown.final_contribution}</span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase">Net Points</span>
                  </div>
                </div>
                <div className="p-4 sm:p-5 rounded-md border border-gray-100 dark:border-zinc-800 bg-indigo-50/50 dark:bg-indigo-900/20 shadow-sm">
                  <p className="text-[9px] sm:text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-1">Integrity Verdict</p>
                  <p className="text-[12px] sm:text-sm font-black text-indigo-900 dark:text-indigo-100">{data.patent_id_score_breakdown.integrity_verdict}</p>
                </div>
              </div>
            </section>
          )}
        </ReportPage>
      )}

      {/* Footer Disclaimer */}
      <div className="mt-auto pt-12 text-[10px] text-gray-400 text-center leading-relaxed max-w-2xl mx-auto italic px-4 sm:px-20 pb-12">
        <p>
          <strong>DISCLAIMER:</strong> {data.document_metadata?.important_note || "This report is an automated assessment and does not constitute legal advice."}
        </p>
      </div>
    </div>
  );
}
