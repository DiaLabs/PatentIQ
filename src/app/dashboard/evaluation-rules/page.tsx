"use client";

import { motion } from "framer-motion";
import { Sliders, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRefresh } from "@/context/RefreshContext";
import { useState, useCallback, useEffect } from "react";

const rules = [
  { id: 1, name: "Novelty Check", description: "Checks if the patent claim is novel against prior art.", weight: 30, enabled: true },
  { id: 2, name: "Inventive Step", description: "Evaluates non-obviousness of the invention.", weight: 25, enabled: true },
  { id: 3, name: "Industrial Applicability", description: "Ensures the invention can be industrially applied.", weight: 20, enabled: true },
  { id: 4, name: "Plagiarism Similarity", description: "Detects textual similarity with existing documents.", weight: 15, enabled: true },
  { id: 5, name: "Claims Clarity", description: "Checks clarity and precision of patent claims.", weight: 10, enabled: false },
];

export default function EvaluationRulesPage() {
  const { refreshTrigger, setRefreshing } = useRefresh();
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    // Mock fetch for now as data is static
    await new Promise(resolve => setTimeout(resolve, 600));
    setLoading(false);
    setRefreshing(false);
  }, [setRefreshing]);

  useEffect(() => {
    if (refreshTrigger > 0) {
      load(true);
    }
  }, [refreshTrigger, load]);

  return (
    <motion.div 
      key={refreshTrigger}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-12 py-8"
    >
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Evaluation Rules</h1>
        <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
          Configure and weight the criteria used to evaluate patent submissions.
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-end mb-8">
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center gap-2 h-[42px] px-5 font-semibold">
          <Plus className="h-4 w-4" />
          Add Rule
        </Button>
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        {rules.map((rule, i) => (
          <motion.div
            key={rule.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-zinc-900 rounded-md border border-gray-200 dark:border-zinc-800 p-5 flex items-center gap-5 hover:shadow-sm transition-shadow group"
          >
            {/* Icon */}
            <div className="h-10 w-10 rounded-md bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
              <Sliders className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{rule.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rule.enabled ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                  {rule.enabled ? "Active" : "Disabled"}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">{rule.description}</p>
            </div>

            {/* Weight */}
            <div className="text-right flex-shrink-0 mr-4">
              <p className="text-lg font-bold text-gray-900 dark:text-white">{rule.weight}%</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Weight</p>
            </div>

            {/* Progress */}
            <div className="w-28 flex-shrink-0">
              <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-500 dark:bg-indigo-400 transition-all"
                  style={{ width: `${rule.weight}%` }}
                />
              </div>
            </div>

            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
          </motion.div>
        ))}
      </div>

      {/* Total weight callout */}
      <div className="mt-6 flex items-center gap-3 rounded-md bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50 px-5 py-3">
        <div className="h-2 w-2 rounded-full bg-indigo-500 dark:bg-indigo-400" />
        <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">
          Total active weight: <span className="font-bold">90%</span> — weights must sum to 100% for scoring to be accurate.
        </p>
      </div>
    </motion.div>
  );
}
