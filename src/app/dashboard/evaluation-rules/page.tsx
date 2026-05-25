"use client";

import { motion } from "framer-motion";
import { Sliders } from "lucide-react";

export default function EvaluationRulesPage() {
  return (
    <div className="flex h-full items-center justify-center min-h-[70vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-8 max-w-md w-full mx-4"
      >
        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sliders className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Coming Soon</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Custom evaluation rules are currently in development. Soon you'll be able to configure and weight your own criteria for patent evaluation.
        </p>
      </motion.div>
    </div>
  );
}
