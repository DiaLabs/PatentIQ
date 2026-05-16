"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchPublicReportData } from "@/lib/api";
import { generatePatentReport } from "@/lib/pdf-generator";
import { Loader2, Download, FileText, AlertTriangle, ChevronLeft, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportContent } from "@/components/dashboard/report-content";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast("Link copied to clipboard", "success");
  };

  const handleDownload = async () => {
    if (!reportData) return;
    setGeneratingPdf(true);
    try {
      const dataCopy = JSON.parse(JSON.stringify(reportData));
      
      // Fetch logo for watermark
      let logoBase64 = undefined;
      try {
        const response = await fetch('/icon1.png');
        const blob = await response.blob();
        logoBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.error("Failed to fetch logo for watermark:", err);
      }

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

      const pdf = generatePatentReport(dataCopy, logoBase64);
      if (!(pdf as any).vfs) {
        (pdf as any).vfs = (pdfMake as any).vfs;
      }
      
      const sName = reportData.submitter_name || 'Student';
      const uId = reportData.unique_id || submissionId.slice(0, 8);
      const fileName = `Evaluation_Report_${sName}_${uId}_PatentIQ.pdf`.replace(/\s+/g, '_');
      (pdf as any).download(fileName);
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
        <div className="max-w-full px-10 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-1.5 transition-all active:scale-95 group">
              <img src="/icon0.svg" alt="Logo" className="w-10 h-10 group-hover:rotate-12 transition-transform duration-500" />
              <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">PatentIQ</span>
            </Link>
            <div className="h-8 w-px bg-gray-200 dark:bg-zinc-800 hidden md:block" />
            <div className="hidden md:flex flex-col">
               <span className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-[0.2em] mb-0.5">Report</span>
               <h1 className="text-[11px] font-medium text-gray-400 truncate max-w-[400px]">
                {reportData.file_name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="rounded-md border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 px-4 gap-2 h-[42px] text-sm font-semibold shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all active:scale-95"
            >
              <Link2 className="h-4 w-4" />
              <span className="hidden sm:inline">Copy link</span>
            </Button>

            <Button
              onClick={handleDownload}
              disabled={generatingPdf}
              className="rounded-md bg-indigo-600 hover:bg-indigo-700 text-white px-5 gap-2 h-[42px] text-sm font-semibold shadow-sm transition-all active:scale-95"
            >
              {generatingPdf ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> <span className="hidden sm:inline">Preparing PDF…</span></>
              ) : (
                <><Download className="h-4 w-4" /> <span className="hidden sm:inline">Download PDF</span></>
              )}
            </Button>

            <div className="h-6 w-px bg-gray-200 dark:bg-zinc-800 hidden sm:block mx-1" />

            <AnimatedThemeToggler
              duration={400}
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-zinc-800 dark:hover:text-gray-300 [&>svg]:h-5 [&>svg]:w-5"
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-full px-10 mx-auto py-6 sm:py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden"
        >
          <div className="py-2">
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
