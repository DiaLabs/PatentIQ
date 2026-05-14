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
  const [rollNumber, setRollNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [teammates, setTeammates] = useState<string[]>([""]);
  const [file, setFile] = useState<File | null>(null);
  const [groupInfo, setGroupInfo] = useState<{ name: string; plag_threshold: number; expires_at?: number; mentor_name?: string } | null>(null);
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
    if (!file || !submitterName.trim() || !email.trim() || !phone.trim() || !rollNumber.trim() || !token) return;

    setStep("uploading");
    setError(null);

    try {
      const fileHash = await computeFileHash(file);
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
      
      const idempotencyKey = crypto.randomUUID();
      
      const filteredTeams = teammates.filter((t) => t.trim());
      const teamMembers = filteredTeams.length > 0 ? filteredTeams : [submitterName];

      const prep = await prepareUpload({
        access_token: token,
        submitter_name: submitterName.trim(),
        roll_number: rollNumber.trim(),
        email: email.trim(),
        phone: phone.trim(),
        team_member_names: teamMembers,
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
  }, [file, submitterName, rollNumber, email, phone, token, teammates, groupInfo]);

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
    <div className="min-h-screen bg-white flex flex-col relative">
      {/* Absolute Header Logo */}
      <div className="absolute top-6 left-6 lg:top-8 lg:left-8 flex items-center gap-3 z-10">
        <svg
          width="44"
          height="44"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-indigo-600 shrink-0"
        >
          <path
            d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 2V8H20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="10" cy="14" r="2" stroke="currentColor" strokeWidth="2" />
          <path
            d="M15 17H9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-2xl font-bold text-gray-900 tracking-tight">
          PatentIQ
        </span>
      </div>

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
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
                      {groupInfo?.name || "Group Submission"}
                    </h1>
                  )}
                  <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-md bg-indigo-50 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span>
                        Deadline:{" "}
                        <span className="font-medium text-gray-900">
                          {loadingGroup ? "..." : formatDate(groupInfo?.expires_at)}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-md bg-indigo-50 flex items-center justify-center">
                        <User className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span>
                        Assignee: <span className="font-medium text-gray-900">{groupInfo?.mentor_name || "Mentor"}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Details</h2>
                  <form id="submission-form" onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                          className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                        />
                      </div>

                      {/* Roll Number */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                          Roll Number *
                        </label>
                        <input
                          type="text"
                          value={rollNumber}
                          onChange={(e) => setRollNumber(e.target.value)}
                          placeholder="Roll number"
                          required
                          className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Email */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email address"
                          required
                          className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                          Phone *
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Phone number"
                          pattern="[0-9]{10}"
                          title="Please enter a valid 10-digit phone number"
                          required
                          className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Team Members */}
                    <div className="pt-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
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
                              className="flex-1 rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
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
                <h3 className="text-xl font-bold text-gray-900 mb-6">Upload Document</h3>
                
                {/* File Upload */}
                <div className="mb-8">
                  <div
                    onClick={() => fileRef.current?.click()}
                    className={`rounded-md border-2 border-dashed cursor-pointer transition-all p-10 text-center ${
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
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-12 w-12 rounded-md bg-indigo-100 flex items-center justify-center">
                          <FileText className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-indigo-900 mb-1 truncate max-w-[200px]">{file.name}</p>
                          <p className="text-xs text-indigo-500 font-medium">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setFile(null); }}
                          className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-100/50 px-3 py-1.5 rounded-md transition-colors"
                        >
                          Change file
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-12 w-12 rounded-md bg-gray-50 flex items-center justify-center group-hover:bg-white transition-colors">
                          <Upload className="h-6 w-6 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Click to upload or drag & drop
                          </p>
                          <p className="text-xs text-gray-400">PDF, DOC, DOCX up to 25MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-md p-4 mb-8">
                   <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Checklist</h4>
                   <ul className="space-y-2 text-sm text-gray-600">
                     <li className="flex gap-2 items-start">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Ensure all team members are listed</span>
                     </li>
                     <li className="flex gap-2 items-start">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>Document is in a supported format</span>
                     </li>
                     <li className="flex gap-2 items-start">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>File size is under the 25MB limit</span>
                     </li>
                   </ul>
                </div>

                <Button
                  form="submission-form"
                  type="submit"
                  disabled={!file || !submitterName.trim() || !email.trim() || !phone.trim() || !rollNumber.trim()}
                  className="w-full py-6 text-base"
                >
                  Submit Patent Evaluation
                </Button>
              </div>
            </div>
          )}

          {/* Uploading State */}
          {step === "uploading" && (
            <div className="max-w-md mx-auto bg-white rounded-md border border-gray-200 shadow-sm p-12 text-center">
              <Loader2 className="mx-auto h-12 w-12 text-indigo-500 animate-spin mb-6" />
              <h2 className="text-xl font-bold text-gray-900">Uploading your document...</h2>
              <p className="text-sm text-gray-500 mt-2">Please don't close this page while we process your submission.</p>
            </div>
          )}

          {/* Tracking/Done State */}
          {(step === "tracking" || step === "done") && statusData && (
            <div className="max-w-xl mx-auto bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-8 py-12 text-center">
                <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-emerald-50 mb-6 border-4 border-white shadow-sm">
                  <CheckCircle className="h-12 w-12 text-emerald-600" strokeWidth={1.5} />
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
                  Submitted Successfully!
                </h2>

                <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
                  Your patent has been received and is now getting evaluated. Your mentor will review the results soon.
                </p>

                <div className="rounded-md bg-gray-50 border border-gray-100 p-6 mb-8 text-left space-y-3">
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="text-sm font-semibold text-gray-500">Name</span>
                    <span className="text-sm font-medium text-gray-900">{submitterName}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-3">
                    <span className="text-sm font-semibold text-gray-500">Roll Number</span>
                    <span className="text-sm font-medium text-gray-900">{rollNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold text-gray-500">Document</span>
                    <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{file?.name}</span>
                  </div>
                </div>

                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="w-full"
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
