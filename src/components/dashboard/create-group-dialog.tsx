"use client";

import { useState, useCallback } from "react";
import { createGroup, type CreatedGroup } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { X, Copy, Check, ExternalLink, Calendar } from "lucide-react";
import { Portal } from "@/components/ui/portal";

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
  const [expiryDate, setExpiryDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const selected = new Date(expiryDate);
      const today = new Date();
      // compute days difference, ensure at least 1 day
      let diffDays = Math.ceil((selected.getTime() - today.getTime()) / (1000 * 3600 * 24));
      if (diffDays < 1) diffDays = 1;

      const result = await createGroup({
        name: name.trim(),
        plag_threshold: plagThreshold / 100,
        link_expiry_days: diffDays,
      });
      setCreated(result);
      setStep("success");
      onCreated();
    } catch (err: any) {
      setError(err?.message ?? "Failed to create group.");
    } finally {
      setLoading(false);
    }
  }, [name, plagThreshold, expiryDate, onCreated]);

  const handleCopy = useCallback(() => {
    if (!created?.student_link) return;
    navigator.clipboard.writeText(created.student_link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [created]);

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-md shadow-xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">
              {step === "form" ? "Create New Group" : "Group Created!"}
            </h2>
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {step === "form" ? (
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <p className="rounded-md bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">
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
                  className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
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
                  className="w-full h-2 bg-indigo-100 rounded-md appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:scale-110 transition-all"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>10% (strict)</span>
                  <span>90% (lenient)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Link Expires On
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={expiryDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full rounded-md border border-gray-200 pl-10 pr-4 py-3 text-sm text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all cursor-pointer bg-white"
                  />
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-md"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className="flex-1 rounded-md"
                >
                  {loading ? "Creating..." : "Create Group"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="p-6 space-y-5">
              <div className="rounded-md bg-emerald-50 border border-emerald-200 p-4 text-center">
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
                <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3.5 py-2.5">
                  <p className="flex-1 text-xs text-gray-600 truncate font-mono">
                    {created?.student_link}
                  </p>
                  <button
                    onClick={handleCopy}
                    className="flex-shrink-0 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
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

              <Button className="w-full rounded-md" onClick={onClose}>
                Done
              </Button>
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}
