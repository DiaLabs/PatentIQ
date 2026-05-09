"use client";

import { useState, useCallback } from "react";
import { createGroup, type CreatedGroup } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { X, Copy, Check, ExternalLink } from "lucide-react";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export function CreateGroupDialog({ onClose, onCreated }: Props) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedGroup | null>(null);
  const [copied, setCopied] = useState(false);

  const [name, setName] = useState("");
  const [plagThreshold, setPlagThreshold] = useState(40);
  const [expiryDays, setExpiryDays] = useState(30);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await createGroup({
        name: name.trim(),
        plag_threshold: plagThreshold / 100,
        link_expiry_days: expiryDays,
      });
      setCreated(result);
      setStep("success");
      onCreated();
    } catch (err: any) {
      setError(err?.message ?? "Failed to create group.");
    } finally {
      setLoading(false);
    }
  }, [name, plagThreshold, expiryDays, onCreated]);

  const handleCopy = useCallback(() => {
    if (!created?.student_link) return;
    navigator.clipboard.writeText(created.student_link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [created]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">
            {step === "form" ? "Create New Group" : "Group Created!"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {step === "form" ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">
                {error}
              </p>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Group Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. AI Innovators Batch 2025"
                required
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Plagiarism Threshold —{" "}
                <span className="text-indigo-600 font-semibold">{plagThreshold}%</span>
              </label>
              <input
                type="range"
                min={10}
                max={90}
                step={5}
                value={plagThreshold}
                onChange={(e) => setPlagThreshold(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>10% (strict)</span>
                <span>90% (lenient)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Link Expires In
              </label>
              <select
                value={expiryDays}
                onChange={(e) => setExpiryDays(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              >
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
              </select>
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !name.trim()}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {loading ? "Creating..." : "Create Group"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-5">
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
              <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <Check className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900">{created?.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Expires {new Date(created?.expires_at ?? "").toLocaleDateString()}
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Student Submission Link
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5">
                <p className="flex-1 text-xs text-gray-600 truncate font-mono">
                  {created?.student_link}
                </p>
                <button
                  onClick={handleCopy}
                  className="flex-shrink-0 rounded-md p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-gray-400">
                Share this link with your students. No login required.
              </p>
            </div>

            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={onClose}>
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
