"use client";

import { MessageSquareWarning, X, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Portal } from "@/components/ui/portal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export function FeedbackButton() {
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  return (
    <>
      <div 
        className="hidden lg:flex fixed right-0 top-[45%] -translate-y-1/2 z-40 items-center justify-center cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsModalOpen(true)}
      >
        <motion.div 
          layout
          className="flex items-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-l-2xl p-3 pl-4 pr-2.5 shadow-2xl overflow-hidden transition-colors border border-r-0 border-gray-800 dark:border-gray-200"
          initial={{ width: "auto" }}
        >
          <MessageSquareWarning className="h-5 w-5 shrink-0" />
          <AnimatePresence>
            {isHovered && (
              <motion.span 
                initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                animate={{ width: "auto", opacity: 1, marginLeft: 8 }}
                exit={{ width: 0, opacity: 0, marginLeft: 0 }}
                className="text-sm font-bold whitespace-nowrap overflow-hidden mr-1"
              >
                Feedback
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <Portal>
            <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  if (!isSending) {
                    setIsModalOpen(false);
                    setTimeout(() => setIsSuccess(false), 300);
                  }
                }}
                className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm transition-all"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-md border border-gray-100 dark:border-zinc-800 shadow-2xl p-6 sm:p-8 z-10"
              >
                {isSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-8 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
                      <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Thank You!
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Your feedback has been successfully sent. We really appreciate your input!
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                          <MessageSquareWarning className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Are we missing something?
                          </h3>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setIsModalOpen(false);
                          setTimeout(() => setIsSuccess(false), 300);
                        }}
                        disabled={isSending}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors disabled:opacity-50"
                      >
                        <X className="h-5 w-5 text-gray-400" />
                      </button>
                    </div>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      What feature, data, or insight would make PatentIQ better for you?
                    </p>

                    <textarea 
                      className="w-full h-32 p-4 text-sm bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 mb-6"
                      placeholder="I wish PatentIQ had..."
                      autoFocus
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      disabled={isSending}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsModalOpen(false);
                          setTimeout(() => setIsSuccess(false), 300);
                        }}
                        disabled={isSending}
                        className="h-11 font-bold rounded-md border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
                      >
                        Cancel
                      </Button>
                      <Button 
                        className="h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md shadow-lg shadow-indigo-500/10 transition-all flex items-center justify-center gap-2"
                        disabled={isSending || !feedback.trim()}
                        onClick={async () => {
                          if (!feedback.trim()) return;
                          setIsSending(true);
                          try {
                            const response = await fetch('/api/feedback', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                feedback,
                                userName: user?.displayName || '',
                                userEmail: user?.email || '',
                              })
                            });
                            
                            if (response.ok) {
                              setFeedback('');
                              setIsSuccess(true);
                              setTimeout(() => {
                                setIsModalOpen(false);
                                setTimeout(() => setIsSuccess(false), 300);
                              }, 2500);
                            } else {
                              const errorData = await response.json();
                              console.error("Server Error:", errorData);
                              alert(`Failed to send feedback: ${errorData.error || 'Unknown error'}`);
                            }
                          } catch (err) {
                            console.error('Failed to send feedback', err);
                          } finally {
                            setIsSending(false);
                          }
                        }}
                      >
                        {isSending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Send Feedback"
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          </Portal>
        )}
      </AnimatePresence>
    </>
  );
}
