"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchPublicReportData } from "@/lib/api";
import { generatePatentReport } from "@/lib/pdf-generator";
import { Loader2, Download, FileText, AlertTriangle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportContent } from "@/components/dashboard/report-content";
import { motion } from "framer-motion";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";

export default function PublicReportPage() {
  const params = useParams();
  const groupId = params.groupId as string;
  const submissionId = params.submissionId as string;
  
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      if (!groupId || !submissionId) {
        setError("Invalid link. Please check the URL and try again.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPublicReportData(groupId, submissionId);
        setReportData(data);
        setLoading(false);
      } catch (err: any) {
        setError(err?.message || "Failed to load report data. The link might be invalid or the report is still processing.");
        setLoading(false);
      }
    };
    load();
  }, [groupId, submissionId]);

  const handleDownload = async () => {
    if (!reportData) return;
    setGeneratingPdf(true);
    try {
      const dataCopy = JSON.parse(JSON.stringify(reportData));
      
      const [pdfMakeModule, pdfFontsModule] = await Promise.all([
        import("pdfmake/build/pdfmake"),
        import("pdfmake/build/vfs_fonts")
      ]);
      
      const pdfMake = pdfMakeModule.default || pdfMakeModule;
      const pdfFonts = pdfFontsModule.default || pdfFontsModule;
      
      if (pdfFonts && (pdfFonts as any).pdfMake) {
        (pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;
      } else if (pdfFonts) {
        (pdfMake as any).vfs = (pdfFonts as any).vfs;
      }

      const pdf = generatePatentReport(dataCopy);
      if (!(pdf as any).vfs) {
        (pdf as any).vfs = (pdfMake as any).vfs;
      }
      
      (pdf as any).download(`Patent_Report_${submissionId.slice(0, 8)}.pdf`);
      toast("Report downloaded", "success");
    } catch (err: any) {
      console.error("PDF generation error:", err);
      toast("Failed to generate PDF: " + err.message, "error");
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-[#0a0a0a]">
        <div className="relative">
          <div className="h-14 w-14 rounded-full border-4 border-indigo-100 dark:border-indigo-900/30 border-t-indigo-600 animate-spin" />
          <FileText className="h-5 w-5 text-indigo-600 absolute inset-0 m-auto" />
        </div>
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest animate-pulse">
          Loading Report…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-12 text-center bg-gray-50 dark:bg-[#0a0a0a]">
        <div className="h-16 w-16 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mb-5">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Could not load report
        </h4>
        <p className="text-sm text-gray-500 max-w-sm leading-relaxed">{error}</p>
        <p className="text-xs text-gray-400 mt-8">
          If you believe this is an error, please contact your mentor or support.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-gray-100 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
              <img src="/icon0.svg" alt="Logo" className="w-7 h-7" />
              <span className="text-sm font-bold tracking-tight hidden sm:inline-block">PatentIQ</span>
            </Link>
            <div className="h-4 w-px bg-gray-200 dark:bg-zinc-800" />
            <h1 className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-none">
              Report: {reportData.file_name}
            </h1>
          </div>

          <Button
            onClick={handleDownload}
            disabled={generatingPdf}
            className="rounded-md bg-indigo-600 hover:bg-indigo-700 text-white px-4 gap-2 h-9 text-xs font-bold shadow-sm"
          >
            {generatingPdf ? (
              <><Loader2 className="h-3 w-3 animate-spin" /> Preparing PDF…</>
            ) : (
              <><Download className="h-3 w-3" /> Download PDF</>
            )}
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-zinc-800 overflow-hidden"
        >
          <div className="p-1">
             <ReportContent data={reportData} />
          </div>
        </motion.div>
        
        {/* Footer info */}
        <footer className="mt-12 text-center pb-12">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} PatentIQ Evaluation Suite. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}
