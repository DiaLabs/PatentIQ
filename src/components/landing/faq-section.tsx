"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "What file formats are supported?",
    answer: "Currently, PatentIQ supports .docx and .pdf files. We are working on adding support for .txt and LaTeX formats soon."
  },
  {
    question: "Is my patent data secure?",
    answer: "Your security is our priority. All documents are encrypted during transit and processed in isolated, transient environments. We do not store your intellectual property longer than required for analysis."
  },
  {
    question: "How accurate is the AI evaluation?",
    answer: "Our evaluation engine is fine-tuned on millions of global patent filings. It provides highly accurate feedback on claim structure, semantic overlap, and consistency, though we always recommend a final human review."
  },
  {
    question: "Can I customize the evaluation rules?",
    answer: "Yes! Mentors and institutions can create custom rulesets to prioritize specific evaluation criteria like novelty, technical clarity, or formatting standards."
  },
  {
    question: "How do I export the reports?",
    answer: "Reports can be instantly exported as professional PDF summaries or detailed JSON files for integration with your existing management systems."
  }
];

export function FaqSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-white py-16 md:py-24 dark:bg-[#0a0a0a]">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
              Common questions about PatentIQ
            </h2>
            <p className="mt-4 text-base md:text-lg text-gray-600 dark:text-gray-400">
              Everything you need to know about our evaluation process and security.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={cn(
                  "overflow-hidden rounded-md border transition-all duration-300",
                  activeIndex === index
                    ? "border-indigo-200 bg-indigo-50/30 dark:border-indigo-500/30 dark:bg-indigo-500/5 shadow-sm"
                    : "border-gray-100 bg-white dark:border-zinc-800 dark:bg-zinc-900/30 hover:border-gray-200 dark:hover:border-zinc-700"
                )}
              >
                <button
                  onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                  className="flex w-full items-center justify-between p-5 text-left"
                >
                  <span className={cn(
                    "text-base font-semibold transition-colors duration-300",
                    activeIndex === index ? "text-indigo-600 dark:text-indigo-400" : "text-gray-900 dark:text-white"
                  )}>
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: activeIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-300",
                      activeIndex === index ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400" : "bg-gray-100 dark:bg-zinc-800 text-gray-500"
                    )}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {activeIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 text-base text-gray-600 dark:text-gray-400 border-t border-indigo-100/50 dark:border-indigo-500/10 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
