"use client";

import { useEffect, useState } from "react";
import { fetchSubmissionReport } from "@/lib/api";
import { generatePatentReport } from "@/lib/pdf-generator";
import { X, Loader2, Download, FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportContent } from "./report-content";
import { Portal } from "@/components/ui/portal";
import { motion } from "framer-motion";
import { useToast } from "@/context/ToastContext";

interface ReportModalProps {
  submissionId: string;
  onClose: () => void;
}

export function ReportModal({ submissionId, onClose }: ReportModalProps) {
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const { toast } = useToast();

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSubmissionReport(submissionId);
        setReportData(data);
        setLoading(false);
      } catch (err: any) {
        setError(err?.message || "Failed to load report data");
        setLoading(false);
      }
    };
    load();
  }, [submissionId]);

  const handleDownload = async () => {
    if (!reportData) return;
    setGeneratingPdf(true);
    try {
      // Deep clone data to prevent pdfmake from mutating the original state
      const dataCopy = JSON.parse(JSON.stringify(reportData));
      
      // Dynamic import pdfMake and pdfFonts to avoid SSR issues
      const [pdfMakeModule, pdfFontsModule] = await Promise.all([
        import("pdfmake/build/pdfmake"),
        import("pdfmake/build/vfs_fonts")
      ]);
      
      const pdfMake = pdfMakeModule.default || pdfMakeModule;
      const pdfFonts = pdfFontsModule.default || pdfFontsModule;
      
      // Initialize pdfMake fonts
      if (pdfFonts && (pdfFonts as any).pdfMake) {
        (pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;
      } else if (pdfFonts) {
        (pdfMake as any).vfs = (pdfFonts as any).vfs;
      }

      // We still use our layout generator
      const pdf = generatePatentReport(dataCopy);
      
      // Set fonts if it wasn't set globally by the generator
      if (!(pdf as any).vfs) {
        (pdf as any).vfs = (pdfMake as any).vfs;
      }
      
      (pdf as any).download(`Patent_Report_${submissionId}.pdf`);
      toast("Report downloaded", "success");
    } catch (err: any) {
      console.error("PDF generation error:", err);
      toast("Failed to generate PDF: " + err.message, "error");
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <Portal>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-white dark:bg-zinc-900 rounded-md shadow-2xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden border border-gray-100 dark:border-zinc-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0">
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className="h-10 w-10 rounded-md bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-none">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Evaluation Report
                </h3>
                <p className="text-xs text-gray-400 mt-0.5 font-medium">
                  Patent originality & quality assessment
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {reportData && (
                <Button
                  onClick={handleDownload}
                  disabled={generatingPdf}
                  className="rounded-md bg-indigo-600 hover:bg-indigo-700 text-white px-5 gap-2 h-9 text-sm font-semibold shadow-sm"
                >
                  {generatingPdf ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Preparing PDF…</>
                  ) : (
                    <><Download className="h-3.5 w-3.5" /> Download PDF</>
                  )}
                </Button>
              )}

              {/* Close button */}
              <button
                onClick={onClose}
                className="h-9 w-9 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-[#0a0a0a] p-8">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <div className="h-14 w-14 rounded-full border-4 border-indigo-100 dark:border-indigo-900/30 border-t-indigo-600 animate-spin" />
                  <FileText className="h-5 w-5 text-indigo-600 absolute inset-0 m-auto" />
                </div>
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest animate-pulse">
                  Loading Report…
                </p>
              </div>
            ) : error ? (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                <div className="h-16 w-16 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mb-5">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Could not load report
                </h4>
                <p className="text-sm text-gray-500 max-w-sm leading-relaxed">{error}</p>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="mt-6 rounded-md px-6"
                >
                  Close
                </Button>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <ReportContent data={reportData} />
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </Portal>
  );
}
