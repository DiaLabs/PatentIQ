"use client";

import React from "react";
import { motion } from "framer-motion";
import { LoadingSpinner } from "./loading-spinner";

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#0a0a0a]">
      <div className="relative flex items-center gap-6">
        {/* Animated SVG Logo */}
        <LoadingSpinner size="lg" />

        {/* Loading Text and Dots */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col justify-center gap-1"
        >
          <span className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            PatentIQ
          </span>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"
                animate={{
                  opacity: [0.2, 1, 0.2],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
