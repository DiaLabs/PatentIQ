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
import { FileText, Upload, Check, AlertCircle, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Step = "form" | "uploading" | "tracking" | "done" | "error";

const PIPELINE_STEPS = [
  { status: "EXTRACTING_IDS", label: "Extracting patent references" },
  { status: "VALIDATING_IDS", label: "Verifying patent IDs" },
  { status: "CHECKING_PLAGIARISM", label: "Plagiarism check" },
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
  const [teammates, setTeammates] = useState<string[]>([""]);
  const [file, setFile] = useState<File | null>(null);
  const [groupInfo, setGroupInfo] = useState<{ name: string; plag_threshold: number } | null>(null);
  const [loadingGroup, setLoadingGroup] = useState(true);

  const fileRef = useRef<HTMLInputElement>(null);

  // Fetch group info
  useEffect(() => {
    if (!token) return;
    const loadGroup = async () => {
      try {
        const info = await fetchGroupPublic(token);
        setGroupInfo(info);
      } catch (err: any) {
        setError(err?.message ?? "Failed to load group info.");
        setStep("error");
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !submitterName.trim() || !token) return;

    setStep("uploading");
    setError(null);

    try {
      const fileHash = await computeFileHash(file);
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
      
      // Fix: Must be a proper UUID for the backend
      const idempotencyKey = crypto.randomUUID();
      
      // Fix: Ensure at least one member (the submitter) if list is empty
      const filteredTeams = teammates.filter((t) => t.trim());
      const teamMembers = filteredTeams.length > 0 ? filteredTeams : [submitterName];

      // 1. Prepare upload
      const prep = await prepareUpload({
        access_token: token,
        submitter_name: submitterName.trim(),
        team_member_names: teamMembers,
        group_name: groupInfo?.name || "Submitted Group",
        file_name: file.name,
        file_type: ext,
        file_size_bytes: file.size,
        file_hash: fileHash,
        idempotency_key: idempotencyKey,
      });

      // 2. Upload file to R2 via backend proxy
      await uploadFile(prep.upload_url, file, prep.content_type);

      // 3. Confirm upload & start pipeline
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
  }, [file, submitterName, token, teammates]);

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

  const currentStepIdx = statusData
    ? PIPELINE_STEPS.findIndex((s) => s.status === statusData.status)
    : -1;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">PatentIQ</span>
          <span className="text-gray-300 mx-1">·</span>
          <span className="text-sm text-gray-500">Student Submission</span>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center py-12 px-4">
        <div className="w-full max-w-2xl">
          {/* Submission Form */}
          {step === "form" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-100">
                <h1 className="text-xl font-bold text-gray-900">
                  Submit Your Patent {groupInfo && <span className="text-indigo-600">to {groupInfo.name}</span>}
                </h1>
                {loadingGroup ? (
                   <div className="h-4 w-32 bg-gray-100 animate-pulse rounded mt-1" />
                ) : (
                  <p className="text-sm text-gray-500 mt-1">
                    Upload your patent document for AI-powered evaluation.
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
                {/* Submitter Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={submitterName}
                    onChange={(e) => setSubmitterName(e.target.value)}
                    placeholder="Full name"
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>

                {/* Team Members */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                    Team Members (optional)
                  </label>
                  <div className="space-y-2">
                    {teammates.map((tm, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          value={tm}
                          onChange={(e) => updateTeammate(i, e.target.value)}
                          placeholder={`Team member ${i + 1}`}
                          className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                        />
                        {teammates.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTeammate(i)}
                            className="rounded-xl border border-gray-200 px-3 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
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
                    className="mt-2 flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add team member
                  </button>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                    Patent Document *
                  </label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className={`rounded-xl border-2 border-dashed cursor-pointer transition-all p-8 text-center ${
                      file
                        ? "border-indigo-300 bg-indigo-50"
                        : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50"
                    }`}
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {file ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-indigo-600" />
                        </div>
                        <p className="text-sm font-medium text-indigo-700">{file.name}</p>
                        <p className="text-xs text-indigo-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setFile(null); }}
                          className="text-xs text-indigo-400 hover:text-indigo-600 underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <Upload className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-600">
                          Click to upload or drag & drop
                        </p>
                        <p className="text-xs text-gray-400">PDF, DOC, DOCX up to 25MB</p>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!file || !submitterName.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-sm font-semibold"
                >
                  Submit Patent
                </Button>
              </form>
            </div>
          )}

          {/* Uploading State */}
          {step === "uploading" && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
              <Loader2 className="mx-auto h-10 w-10 text-indigo-500 animate-spin mb-4" />
              <h2 className="text-lg font-semibold text-gray-900">Uploading your document...</h2>
              <p className="text-sm text-gray-400 mt-2">Please don't close this page.</p>
            </div>
          )}

          {/* Tracking/Done State - Simple Success Message (No Pipeline for Students) */}
          {(step === "tracking" || step === "done") && statusData && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-8 py-12 text-center">
                {/* Checkmark Icon */}
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-50 mb-4">
                  <Check className="h-8 w-8 text-emerald-600" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Patent Submitted Successfully! ✓
                </h2>

                <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                  Your patent has been received and is now under evaluation. Your mentor will review the results and share them with you.
                </p>

                <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 mb-6 text-left">
                  <p className="text-xs text-blue-700 font-medium mb-1">Submission ID</p>
                  <p className="text-sm font-mono text-blue-900 break-all">{submissionId}</p>
                </div>

                <p className="text-xs text-gray-400">
                  You will be notified once your mentor has reviewed the evaluation results.
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {step === "error" && (
            <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8 text-center">
              <AlertCircle className="mx-auto h-10 w-10 text-red-400 mb-4" />
              <h2 className="text-lg font-semibold text-gray-900">
                Submission Failed
              </h2>
              <p className="text-sm text-gray-500 mt-2 mb-6">{error}</p>
              <Button
                onClick={() => { setStep("form"); setError(null); }}
                variant="outline"
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
