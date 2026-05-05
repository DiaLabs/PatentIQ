"use client";

import { useState, useRef } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Upload, ShieldCheck, Search, BrainCircuit, SlidersHorizontal, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    name: "Submit Patent",
    description: "Students upload DOCX files securely.",
    icon: Upload
  },
  {
    name: "Plagiarism Check",
    description: "Similarity checks flag sentence-level risks.",
    icon: ShieldCheck
  },
  {
    name: "Prior Art",
    description: "Validates against global databases.",
    icon: Search
  },
  {
    name: "AI Evaluation",
    description: "Analyzes claims, clarity, and innovation.",
    icon: BrainCircuit
  },
  {
    name: "Rule Scoring",
    description: "Applies customized mentor rules.",
    icon: SlidersHorizontal
  },
  {
    name: "Report Gen",
    description: "Exports breakdown of issues.",
    icon: FileText
  }
];

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end end"]
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // latest is between 0 and 1. We map it to 0 -> 5.
    const step = Math.min(steps.length - 1, Math.max(0, Math.floor(latest * steps.length)));
    setActiveStep(step);
  });

  return (
    <section ref={sectionRef} id="how-it-works" className="bg-white py-24 dark:bg-[#0a0a0a] sm:py-32 overflow-hidden">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-24">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            From submission to insight — fully automated
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
            A seamless pipeline ensuring every patent is rigorously evaluated.
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-6xl">
          {/* Connecting Line Background */}
          <div className="absolute top-10 left-[8%] right-[8%] h-[2px] bg-gray-100 dark:bg-zinc-800 hidden md:block" />
          
          {/* Animated Connecting Line Foreground */}
          <motion.div 
            className="absolute top-10 left-[8%] h-[2px] bg-indigo-500 dark:bg-indigo-400 hidden md:block"
            initial={{ width: "0%" }}
            animate={{ width: `${(activeStep / (steps.length - 1)) * 84}%` }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />

          <div className="grid grid-cols-2 md:grid-cols-6 gap-x-4 gap-y-12">
            {steps.map((step, index) => {
              const isActive = index === activeStep;
              const isPast = index < activeStep;
              
              return (
                <div 
                  key={step.name} 
                  className="relative flex flex-col items-center text-center"
                >
                  {/* Icon Container */}
                  <div className="relative mb-6">
                    <motion.div 
                      className={cn(
                        "relative z-10 flex h-20 w-20 items-center justify-center rounded-full transition-colors duration-500",
                        isActive 
                          ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 dark:bg-indigo-500 dark:shadow-indigo-500/30" 
                          : isPast
                            ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400"
                            : "bg-gray-50 text-gray-400 dark:bg-zinc-900 dark:text-zinc-500"
                      )}
                      initial={false}
                      animate={{ scale: isActive ? 1.1 : 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <motion.div
                        initial={false}
                        animate={{ scale: isActive ? 1.1 : 1, opacity: isActive ? 1 : 0.8 }}
                        transition={{ duration: 0.3 }}
                      >
                        <step.icon className="h-8 w-8" />
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* Text Content */}
                  <div className={cn(
                    "transition-all duration-500",
                    isActive || isPast ? "opacity-100" : "opacity-50"
                  )}>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2 block">
                      Step {index + 1}
                    </span>
                    <h3 className={cn(
                      "text-sm sm:text-base font-bold mb-2 leading-tight",
                      isActive ? "text-indigo-900 dark:text-indigo-100" : "text-gray-900 dark:text-white"
                    )}>
                      {step.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-[150px] mx-auto">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
