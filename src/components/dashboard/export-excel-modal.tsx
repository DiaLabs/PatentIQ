"use client";

import { useState } from "react";
import { Portal } from "@/components/ui/portal";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileSpreadsheet, ChevronRight, AlertCircle, Loader2 } from "lucide-react";
import { CustomSelect } from "@/components/ui/custom-select";
import { Button } from "@/components/ui/button";

interface ExportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: { value: string; label: string }[];
  onExport: (groupId: string) => Promise<void>;
}

export function ExportExcelModal({ isOpen, onClose, groups, onExport }: ExportExcelModalProps) {
  const [selectedGroup, setSelectedGroup] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(selectedGroup);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-md border border-gray-100 dark:border-zinc-800 shadow-2xl p-8"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Export as Excel</h3>
                  <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                    Choose the evaluation group you wish to export. The generated Excel file will include comprehensive data for all student submissions.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {/* Body */}
              <div className="mb-10">
                <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                  Evaluation Group
                </label>
                <CustomSelect
                  value={selectedGroup}
                  onChange={setSelectedGroup}
                  options={groups}
                  placeholder="Select a cohort to export"
                  className="w-full h-12"
                />
              </div>

              {/* Footer Actions */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="h-12 font-bold rounded-md"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={!selectedGroup || isExporting}
                  className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2 group transition-all"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      ...
                    </>
                  ) : (
                    <>
                      Download
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        </Portal>
      )}
    </AnimatePresence>
  );
}
