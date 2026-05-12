import { useEffect, useState } from "react";
import { fetchSubmissionReport } from "@/lib/api";
import { generatePatentReport } from "@/lib/pdf-generator";
import { X, Loader2, Download, Printer, FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportContent } from "./report-content";

interface ReportModalProps {
  submissionId: string;
  onClose: () => void;
}

export function ReportModal({ submissionId, onClose }: ReportModalProps) {
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadReportData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchSubmissionReport(submissionId);
        setReportData(data);
        setLoading(false);
        
        // Start PDF generation in background
        generatePdfInBackground(data);
      } catch (err: any) {
        setError(err?.message || "Failed to load report data");
        setLoading(false);
      }
    };

    loadReportData();

    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [submissionId]);

  const generatePdfInBackground = (data: any) => {
    setGeneratingPdf(true);
    try {
      // Deep clone data to prevent pdfmake from mutating the original state
      const dataCopy = JSON.parse(JSON.stringify(data));
      const pdf = generatePatentReport(dataCopy);
      (pdf as any).getBlob((blob: Blob) => {
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        setGeneratingPdf(false);
      });
    } catch (err) {
      console.error("PDF generation error:", err);
      setGeneratingPdf(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `Patent_Report_${submissionId}.pdf`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl w-full max-w-6xl h-[95vh] flex flex-col overflow-hidden border border-gray-100 dark:border-zinc-800 transition-all duration-500 scale-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-10 py-6 border-b border-gray-50 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl z-10">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                Evaluation Report
              </h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                Ref: {submissionId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {reportData && (
              <Button 
                onClick={handleDownload}
                disabled={!pdfUrl || generatingPdf}
                className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 shadow-md shadow-indigo-100 dark:shadow-none gap-2"
              >
                {generatingPdf ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {generatingPdf ? "Preparing PDF..." : "Download Report"}
              </Button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 transition-colors"
            >
              <X className="h-7 w-7" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#0a0a0a] scroll-smooth p-10">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-indigo-100 dark:border-indigo-900/30 border-t-indigo-600 animate-spin" />
                <FileText className="h-6 w-6 text-indigo-600 absolute inset-0 m-auto" />
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">Initializing Report...</p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
              <div className="h-20 w-20 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="h-10 w-10 text-red-600" />
              </div>
              <h4 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Access Denied</h4>
              <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">{error}</p>
              <Button onClick={onClose} variant="outline" className="mt-8 rounded-full px-8">Return to Dashboard</Button>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <ReportContent data={reportData} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
