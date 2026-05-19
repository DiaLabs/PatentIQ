"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  prepareUpload,
  uploadFile,
  confirmUpload,
  checkSubmissionStatus,
  fetchGroupPublic,
  type SubmissionStatusResponse,
} from "@/lib/api";
import { FileText, CheckCircle, Check, Upload, AlertCircle, Loader2, Plus, X, Calendar, User, UserPlus, FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

type Step = "form" | "uploading" | "tracking" | "done" | "error";

const PIPELINE_STEPS = [
  { status: "EXTRACTING_IDS", label: "Extracting patent references" },
  { status: "VALIDATING_IDS", label: "Verifying patent IDs" },
  { status: "EVALUATING", label: "AI evaluation" },
  { status: "COMPLETED", label: "Report generation" },
];

async function computeFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function SubmitForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [step, setStep] = useState<Step>("form");
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [submitterName, setSubmitterName] = useState("");
  const [uniqueId, setUniqueId] = useState("");
  const [inventionTitle, setInventionTitle] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [teammates, setTeammates] = useState<string[]>([""]);
  const [file, setFile] = useState<File | null>(null);
  const [groupInfo, setGroupInfo] = useState<{ name: string; expires_at?: number; mentor_name?: string } | null>(null);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  // Fetch group info
  useEffect(() => {
    if (!token) return;
    const loadGroup = async () => {
      try {
        const info = await fetchGroupPublic(token);
        setGroupInfo(info);
      } catch (err: any) {
        console.warn('Failed to load group info, using defaults:', err);
        // Fallback to default values instead of showing error
        setGroupInfo({
          name: 'Group Submission',
          mentor_name: 'Mentor',
        });
      } finally {
        setLoadingGroup(false);
      }
    };
    loadGroup();
  }, [token]);

  // Tracking state
  const [statusData, setStatusData] = useState<SubmissionStatusResponse | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const addTeammate = () => setTeammates((t) => [...t, ""]);
  const removeTeammate = (i: number) =>
    setTeammates((t) => t.filter((_, idx) => idx !== i));
  const updateTeammate = (i: number, val: string) =>
    setTeammates((t) => t.map((x, idx) => (idx === i ? val : x)));

  const processFile = (f: File) => {
    if (f.size > 2 * 1024 * 1024) {
      alert("File size exceeds 2MB limit");
      return;
    }
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf") {
      alert("Only PDF files are allowed");
      return;
    }
    setFile(f);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !submitterName.trim() || !email.trim() || !uniqueId.trim() || !inventionTitle.trim() || !token) return;

    setStep("uploading");
    setError(null);

    try {
      const fileHash = await computeFileHash(file);
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
      
      const idempotencyKey = crypto.randomUUID();
      
      const confirmedTeammates = teammates.filter((t) => t.trim());
      
      const prep = await prepareUpload({
        access_token: token,
        submitter_name: submitterName.trim(),
        unique_id: uniqueId.trim(),
        submitter_email: email.trim(),
        invention_title: inventionTitle.trim(),
        phone: "N/A",
        team_member_names: confirmedTeammates,
        group_name: groupInfo?.name || "Submitted Group",
        file_name: file.name,
        file_type: ext,
        file_size_bytes: file.size,
        file_hash: fileHash,
        idempotency_key: idempotencyKey,
      });

      await uploadFile(prep.upload_url, file, prep.content_type);

      const confirmed = await confirmUpload({
        submission_id: prep.submission_id,
        access_token: token,
      });

      setSubmissionId(confirmed.submission_id);
      setStep("tracking");
    } catch (err: any) {
      setError(err?.message ?? "Submission failed. Please try again.");
      setStep("error");
    }
  }, [file, submitterName, uniqueId, email, inventionTitle, phone, token, teammates, groupInfo]);

  // Poll for status
  useEffect(() => {
    if (step !== "tracking" || !submissionId) return;

    const poll = async () => {
      try {
        const status = await checkSubmissionStatus(submissionId);
        setStatusData(status);
        if (status.status === "COMPLETED" || status.status === "REJECTED" || status.status === "FAILED") {
          setStep("done");
        }
      } catch { /* keep polling */ }
    };

    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [step, submissionId]);

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-red-400 mb-4" />
          <h1 className="text-lg font-semibold text-gray-900">Invalid Link</h1>
          <p className="text-sm text-gray-500 mt-1">
            This submission link is missing or invalid. Please ask your mentor for the correct link.
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (ts: number | undefined) => {
    if (!ts) return "No deadline set";
    return new Date(ts * 1000).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen flex flex-col relative transition-colors duration-300">
      {/* Absolute Header Logo */}
      {/* Fixed Header */}
      <header className="absolute top-0 left-0 w-full h-24 px-6 lg:px-8 flex items-center justify-between z-20">
        <div className="flex items-center gap-1">
          <img 
            src="/icon0.svg" 
            alt="PatentIQ Logo" 
            className="w-10 h-10 object-contain"
          />
          <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            PatentIQ
          </span>
        </div>

        <AnimatedThemeToggler
          duration={400}
          className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
        />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4 w-full">
        <div className="w-full max-w-6xl mt-12 lg:mt-0">
          {/* Submission Form */}
          {step === "form" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Form Section */}
              <div className="lg:col-span-7 flex flex-col gap-10">
                
                {/* Group Details */}
                <div>
                  {loadingGroup ? (
                    <div className="h-9 w-64 bg-gray-100 animate-pulse rounded-md mb-4" />
                  ) : (
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
                      {groupInfo?.name || "Group Submission"}
                    </h1>
                  )}
                  <div className="flex flex-wrap gap-8 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span>
                        Deadline:{" "}
                        <span className="font-medium text-gray-900 dark:text-white">
                          {loadingGroup ? "..." : formatDate(groupInfo?.expires_at)}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span>
                        Assignee: <span className="font-medium text-gray-900 dark:text-white">{groupInfo?.mentor_name || "Mentor"}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Submission Details</h2>
                  <form id="submission-form" onSubmit={handleSubmit} className="space-y-6">
                    {/* Invention Title */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1 mb-1.5">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={inventionTitle}
                        onChange={(e) => setInventionTitle(e.target.value)}
                        placeholder="Enter the title of your invention"
                        required
                        className="w-full rounded-md border border-gray-200 dark:border-zinc-800 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 bg-white dark:bg-zinc-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 outline-none transition-all"
                      />
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={submitterName}
                        onChange={(e) => setSubmitterName(e.target.value)}
                        placeholder="Full name"
                        required
                        className="w-full rounded-md border border-gray-200 dark:border-zinc-800 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 bg-white dark:bg-zinc-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 outline-none transition-all"
                      />
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1 mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address"
                        required
                        className="w-full rounded-md border border-gray-200 dark:border-zinc-800 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 bg-white dark:bg-zinc-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 outline-none transition-all"
                      />
                    </div>

                    {/* Unique Id */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1 mb-1.5">
                        Unique Id *
                      </label>
                      <input
                        type="text"
                        value={uniqueId}
                        onChange={(e) => setUniqueId(e.target.value)}
                        placeholder="Student ID / Unique ID"
                        required
                        className="w-full rounded-md border border-gray-200 dark:border-zinc-800 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 bg-white dark:bg-zinc-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 outline-none transition-all"
                      />
                    </div>

                    <div className="pt-2">
                      <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1 mb-1.5">
                        Team Members (optional)
                      </label>
                      <div className="space-y-3">
                        {teammates.map((tm, i) => (
                          <div key={i} className="flex gap-2">
                            <input
                              type="text"
                              value={tm}
                              onChange={(e) => updateTeammate(i, e.target.value)}
                              placeholder={`Team member ${i + 1}`}
                              className="flex-1 rounded-md border border-gray-200 dark:border-zinc-800 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 bg-white dark:bg-zinc-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 outline-none transition-all"
                            />
                            {teammates.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeTeammate(i)}
                                className="rounded-md border border-gray-200 px-4 text-gray-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={addTeammate}
                        className="mt-3 flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Add another team member
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Right Column: Upload Widget */}
              <div className="lg:col-span-5 lg:pl-12 lg:sticky lg:top-24">
                <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1 mb-6">
                  Upload Document
                </label>
                
                {/* File Upload */}
                <div className="mb-8">
                  <div
                    onClick={() => fileRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`rounded-md border-2 border-dashed cursor-pointer transition-all p-10 text-center ${
                      file
                        ? "border-indigo-300 bg-indigo-50 dark:bg-indigo-900/20"
                        : isDragging
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                        : "border-gray-200 dark:border-zinc-800 hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10"
                    }`}
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {file ? (
                      <div className="flex flex-col items-center gap-3">
                        {(() => {
                          const IconComp = file.name.toLowerCase().endsWith(".pdf") ? FileText : FileIcon;
                          return (
                            <div className="h-10 w-10 rounded-md bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                              <IconComp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                          );
                        })()}
                        <div className="flex-1 min-w-0 max-w-full px-4">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate text-center" title={file.name}>
                            {file.name}
                          </p>
                          <p className="text-xs text-indigo-500 dark:text-indigo-400 font-medium text-center">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); setFile(null); }}
                          className="mt-2 text-xs h-8 border-indigo-200 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                        >
                          Change file
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-12 w-12 rounded-md bg-gray-50 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-zinc-700 transition-colors">
                          <Upload className="h-6 w-6 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Click to upload or drag & drop
                          </p>
                          <p className="text-xs text-gray-400">PDF up to 2MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-zinc-900 rounded-md p-4 mb-8 border border-gray-100 dark:border-zinc-800">
                   <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1 mb-2">Checklist</label>
                   <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                     <li className="flex gap-2 items-start">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Ensure all team members are listed</span>
                     </li>
                     <li className="flex gap-2 items-start">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Document must be in PDF format</span>
                     </li>
                     <li className="flex gap-2 items-start">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>File size is under the 2MB limit</span>
                     </li>
                   </ul>
                </div>

                <Button
                  form="submission-form"
                  type="submit"
                  disabled={!file || !submitterName.trim() || !email.trim() || !uniqueId.trim() || !inventionTitle.trim()}
                  className="w-full py-7 text-base rounded-md font-bold transition-all bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 dark:shadow-none disabled:bg-gray-200 dark:disabled:bg-zinc-800 disabled:text-gray-400"
                >
                  Submit Patent Evaluation
                </Button>
              </div>
            </div>
          )}

          {/* Uploading State */}
          {step === "uploading" && (
            <div className="max-w-md mx-auto bg-white dark:bg-zinc-900 rounded-md border border-gray-200 dark:border-zinc-800 shadow-sm p-12 text-center">
              <Loader2 className="mx-auto h-12 w-12 text-indigo-500 animate-spin mb-6" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Uploading your document...</h2>
              <p className="text-sm text-gray-500 mt-2">Please don't close this page while we process your submission.</p>
            </div>
          )}

          {/* Tracking/Done State */}
          {(step === "tracking" || step === "done") && statusData && (
            <div className="max-w-2xl mx-auto w-full transition-colors duration-300">
              <div className="py-6 text-center">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border-2 border-white dark:border-[#0a0a0a] shadow-sm">
                    <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                  </div>
                  <h2 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                    Submitted Successfully!
                  </h2>
                </div>

                <p className="text-gray-500 mb-6 max-w-lg mx-auto leading-relaxed text-sm">
                  Your patent has been received and is now getting evaluated. Your mentor will review the results soon.
                </p>

                <div className="rounded-md bg-gray-50/50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800/50 p-5 mb-8 text-left space-y-3.5">
                  <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-3">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Title</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[250px] text-right">{inventionTitle}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-3">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Name / Unique ID</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{submitterName} <span className="text-gray-400 mx-1">·</span> {uniqueId}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-3">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Email</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{email}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-3">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Group</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{groupInfo?.name || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Document</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[200px]" title={file?.name}>
                      {file?.name}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => window.location.reload()}
                  className="w-full py-7 text-base rounded-md font-bold transition-all bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 dark:shadow-none"
                >
                  Submit Another Document
                </Button>
              </div>
            </div>
          )}

          {/* Error State */}
          {step === "error" && (
            <div className="max-w-md mx-auto bg-white rounded-md border border-red-200 shadow-sm p-10 text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-red-50 mb-6">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Submission Failed
              </h2>
              <p className="text-sm text-gray-500 mb-8">{error}</p>
              <Button
                onClick={() => { setStep("form"); setError(null); }}
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
