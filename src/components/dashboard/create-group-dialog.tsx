"use client";

import { useState, useCallback } from "react";
import { createGroup, type CreatedGroup } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { X, Copy, Check, ChevronRight, Calendar, Loader2, Users } from "lucide-react";
import { Portal } from "@/components/ui/portal";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
  const [expiryDate, setExpiryDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
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
      let diffDays = Math.ceil((selected.getTime() - today.getTime()) / (1000 * 3600 * 24));
      if (diffDays < 1) diffDays = 1;

      const result = await createGroup({
        name: name.trim(),
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
  }, [name, expiryDate, onCreated]);

  const handleCopy = useCallback(() => {
    if (!created?.group_id) return;
    const link = `${window.location.origin}/submit?token=${created.group_id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [created]);

  return (
    <AnimatePresence>
      <Portal>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
          />

          <motion.div
            id="tour-create-group-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-md border border-gray-100 dark:border-zinc-800 shadow-2xl p-8"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {step === "form" ? "Create New Group" : "Group Created!"}
                </h3>
                <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                  {step === "form" 
                    ? "Initialize a new evaluation cohort with custom link expiry rules."
                    : "Your group is ready. Share the secure submission link with your students."}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            {step === "form" ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="flex items-center gap-3 p-3 rounded-md bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-xs text-red-600 dark:text-red-400">
                    <X className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                    Group Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Group Name"
                    required
                    className="w-full h-12 bg-white dark:bg-zinc-900 rounded-md border border-gray-200 dark:border-zinc-800 px-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                    Link Expiry
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={expiryDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full h-12 bg-white dark:bg-zinc-900 rounded-md border border-gray-200 dark:border-zinc-800 pl-11 pr-4 text-sm text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/40 outline-none transition-all cursor-pointer"
                    />
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="h-12 font-bold rounded-md border-gray-200 dark:border-zinc-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !name.trim()}
                    className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2 group transition-all"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Create Group
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-8">
                <div className="p-6 rounded-md bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 text-center">
                  <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Check className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">{created?.name}</h4>
                  <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-widest">
                    Live Until {(() => {
                      const val = created?.expires_at;
                      if (!val) return "—";
                      // If it's a number or numeric string (UNIX timestamp in seconds), multiply by 1000
                      const date = !isNaN(Number(val)) && Number(val) < 10000000000 
                        ? new Date(Number(val) * 1000) 
                        : new Date(val);
                      return date.toLocaleDateString();
                    })()}
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                    Student Submission Link
                  </label>
                  <div className="group relative flex items-center gap-2 rounded-md border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50 px-4 py-3.5 transition-all hover:border-indigo-200 dark:hover:border-indigo-900/50">
                    <p className="flex-1 text-xs text-gray-600 dark:text-gray-300 truncate font-mono">
                      {window.location.origin}/submit?token={created?.group_id}
                    </p>
                    <button
                      onClick={handleCopy}
                      className="flex-shrink-0 rounded-md p-1.5 text-gray-400 hover:bg-white dark:hover:bg-zinc-700 hover:shadow-sm transition-all"
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    {copied && (
                      <span className="absolute -top-8 right-0 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded shadow-sm">
                        Copied!
                      </span>
                    )}
                  </div>
                </div>

                <Button className="w-full h-12 font-bold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-lg shadow-indigo-500/10" onClick={onClose}>
                  Back to Dashboard
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </Portal>
    </AnimatePresence>
  );
}

