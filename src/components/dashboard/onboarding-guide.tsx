"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MousePointer2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

interface Step {
  target: string | null;
  title: string;
  text: string;
  placement: "top" | "bottom" | "left" | "right" | "center";
  action?: () => void;
}

export function OnboardingGuide() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Only show the interactive tour on desktop. 
    // Mobile layouts hide elements (like sidebars) making DOM-targeting brittle.
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      const hasSeenTour = localStorage.getItem("patent_iq_has_seen_onboarding");
      if (!hasSeenTour) {
        setIsOpen(true);
      }
    }
  }, []);

  const steps: Step[] = [
    {
      target: null,
      title: "Welcome to PatentIQ",
      text: "Seamlessly evaluate patent applications, research papers, and academic reports hassle-free from one focused dashboard.",
      placement: "center"
    },
    {
      target: "#sidebar-nav-groups",
      title: "Groups Tab",
      text: "Navigate to the Groups section — this is where you manage all your evaluation cohorts.",
      placement: "right",
      action: () => {
        router.push("/dashboard/groups");
      }
    },
    {
      target: "#tour-create-group",
      title: "Create a Group",
      text: "Click here to create a new group. Give it a name and set a link expiry date for student submissions.",
      placement: "bottom",
      action: () => {
        document.getElementById("tour-create-group")?.click();
      }
    },
    {
      target: "#tour-create-group-modal",
      title: "Fill Group Details",
      text: "Give your group a name and set a link expiry date — then hit Create Group.",
      placement: "right",
      action: () => {
        const modalEl = document.getElementById("tour-create-group-modal");
        if (modalEl) {
          const closeBtn = modalEl.querySelector("button") as HTMLButtonElement;
          if (closeBtn) closeBtn.click();
        }
      }
    },
    {
      target: null,
      title: "Share Your Submission Link",
      text: "Once your group is created, you'll get a unique submission link. Share it with students — they can upload their patent documents directly, no account needed.",
      placement: "center"
    },
    {
      target: "#tour-credits",
      title: "Top Up Credits",
      text: "Each evaluation uses credits. Click the credits button in the top bar to top up and start evaluating right away.",
      placement: "bottom"
    }
  ];

  const updateRect = () => {
    const step = steps[currentStep];
    if (step && step.target) {
      const el = document.querySelector(step.target);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    } else {
      setTargetRect(null);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    // Slight delay to allow DOM/route changes
    const timer = setTimeout(updateRect, 500);
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [currentStep, isOpen, pathname]);

  if (!isOpen) return null;

  const finishTour = () => {
    localStorage.setItem("patent_iq_has_seen_onboarding", "true");
    setIsOpen(false);
  };

  const handleNext = () => {
    const step = steps[currentStep];
    if (step.action) {
      step.action();
    }
    if (currentStep < steps.length - 1) {
      setIsTransitioning(true);
      const nextIndex = currentStep + 1;
      setCurrentStep(nextIndex);
      
      const delay = (currentStep === 3 && nextIndex === 4) ? 400 : 2000;
      setTimeout(() => {
        setIsTransitioning(false);
      }, delay);
    } else {
      finishTour();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setIsTransitioning(true);
      const prevIndex = currentStep - 1;
      
      if (currentStep === 4 && prevIndex === 3) {
        document.getElementById("tour-create-group")?.click();
      } else if (currentStep === 3 && prevIndex === 2) {
        const modalEl = document.getElementById("tour-create-group-modal");
        if (modalEl) {
          const closeBtn = modalEl.querySelector("button") as HTMLButtonElement;
          if (closeBtn) closeBtn.click();
        }
      }
      
      setCurrentStep(prevIndex);
      
      const delay = (currentStep === 4 && prevIndex === 3) ? 400 : 2000;
      setTimeout(() => {
        setIsTransitioning(false);
      }, delay);
    }
  };

  const handleSkip = () => {
    const modalEl = document.getElementById("tour-create-group-modal");
    if (modalEl) {
      const closeBtn = modalEl.querySelector("button") as HTMLButtonElement;
      if (closeBtn) closeBtn.click();
    }
    finishTour();
  };

  const activeStep = steps[currentStep];

  // Calculate Tooltip position
  let tooltipStyle: any = { top: "50%", left: "50%", x: "-50%", y: "-50%" };
  let cursorStyle: React.CSSProperties = { top: "50%", left: "50%" };

  if (targetRect && activeStep.placement !== "center") {
    const padding = 30; // Increased padding to prevent overlap
    cursorStyle = {
      top: targetRect.top + targetRect.height / 2,
      left: targetRect.left + targetRect.width / 2,
    };

    switch (activeStep.placement) {
      case "bottom": {
        let bLeft = targetRect.left + targetRect.width / 2;
        if (typeof window !== 'undefined' && bLeft > window.innerWidth - 220) bLeft = window.innerWidth - 220;
        tooltipStyle = { top: targetRect.bottom + padding, left: bLeft, x: "-50%", y: 0 };
        break;
      }
      case "top": {
        let tLeft = targetRect.left + targetRect.width / 2;
        if (typeof window !== 'undefined' && tLeft > window.innerWidth - 220) tLeft = window.innerWidth - 220;
        tooltipStyle = { top: targetRect.top - padding, left: tLeft, x: "-50%", y: "-100%" };
        break;
      }
      case "right":
        tooltipStyle = { top: targetRect.top + targetRect.height / 2, left: targetRect.right + padding, x: 0, y: "-50%" };
        break;
      case "left":
        tooltipStyle = { top: targetRect.top + targetRect.height / 2, left: targetRect.left - padding, x: "-100%", y: "-50%" };
        break;
    }
  }

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Spotlight Overlay */}
      <motion.svg
        initial={{ opacity: 0 }}
        animate={{ opacity: (isTransitioning && activeStep.placement !== 'center') ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 w-full h-full pointer-events-auto" onClick={(e) => e.stopPropagation()}
      >
        <defs>
          <mask id="spotlight">
            <rect width="100%" height="100%" fill="white" />
            {!isTransitioning && targetRect && activeStep.placement !== "center" && (
              <rect
                x={targetRect.left - 4}
                y={targetRect.top - 4}
                width={targetRect.width + 8}
                height={targetRect.height + 8}
                rx={8}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#spotlight)" />
      </motion.svg>

      {/* Animated Cursor */}
      <AnimatePresence>
        {(targetRect && activeStep.placement !== "center") || isTransitioning ? (
          <motion.div
            initial={{ opacity: 0, top: "50%", left: "50%" }}
            animate={{ opacity: 1, top: cursorStyle.top, left: cursorStyle.left }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 50 }}
            className="absolute z-[130] text-blue-500 drop-shadow-xl pointer-events-none"
            style={{ transform: "translate(-20%, -20%)" }} // Offset tip of cursor to center
          >
            <motion.div
              animate={{ scale: [1, 0.8, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <MousePointer2 className="h-8 w-8 fill-blue-500 stroke-white stroke-[1.5px]" />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Tooltip Card */}
      <AnimatePresence>
        {!isTransitioning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              top: tooltipStyle.top,
              left: tooltipStyle.left,
              x: tooltipStyle.x,
              y: tooltipStyle.y
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 150 }}
            className={`absolute z-[120] ${activeStep.placement === 'center' ? 'w-[450px]' : 'w-[400px]'} bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-gray-100 dark:border-zinc-800 p-0 pointer-events-auto flex flex-col overflow-hidden`}
          >
            {activeStep.placement === 'center' && (
              <div className="w-full h-56 bg-indigo-50/50 dark:bg-indigo-900/10 flex items-center justify-center p-6 border-b border-indigo-100/50 dark:border-indigo-900/30 relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />
                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />

                <div className="w-full h-full bg-white dark:bg-zinc-900 rounded-lg shadow-md border border-indigo-100/50 dark:border-indigo-800/50 flex flex-col p-4 relative z-10 overflow-hidden">
                  {/* Dashboard Mock Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <img src="/icon0.svg" alt="Logo" className="w-6 h-6" />
                      <span className="font-bold text-gray-900 dark:text-white text-sm">PatentIQ</span>
                    </div>
                    <div className="flex gap-1.5">
                      <div className="h-2 w-8 bg-indigo-100 dark:bg-indigo-900/40 rounded-full" />
                      <div className="h-2 w-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-full" />
                    </div>
                  </div>

                  {/* Dashboard Mock Content */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="h-12 bg-gray-50 dark:bg-zinc-800/50 rounded-md border border-gray-100 dark:border-zinc-800 flex flex-col justify-center px-2">
                      <div className="h-1.5 w-6 bg-gray-200 dark:bg-zinc-700 rounded mb-1" />
                      <div className="h-3 w-10 bg-indigo-600/80 rounded" />
                    </div>
                    <div className="h-12 bg-gray-50 dark:bg-zinc-800/50 rounded-md border border-gray-100 dark:border-zinc-800 flex flex-col justify-center px-2">
                      <div className="h-1.5 w-8 bg-gray-200 dark:bg-zinc-700 rounded mb-1" />
                      <div className="h-3 w-12 bg-emerald-500/80 rounded" />
                    </div>
                    <div className="h-12 bg-gray-50 dark:bg-zinc-800/50 rounded-md border border-gray-100 dark:border-zinc-800 flex flex-col justify-center px-2">
                      <div className="h-1.5 w-5 bg-gray-200 dark:bg-zinc-700 rounded mb-1" />
                      <div className="h-3 w-8 bg-purple-500/80 rounded" />
                    </div>
                  </div>

                  <div className="flex-1 bg-gray-50 dark:bg-zinc-800/50 rounded-md border border-gray-100 dark:border-zinc-800 p-2 space-y-2">
                    <div className="h-2 w-full bg-gray-200 dark:bg-zinc-700 rounded-sm" />
                    <div className="h-2 w-5/6 bg-gray-200 dark:bg-zinc-700 rounded-sm" />
                    <div className="h-2 w-4/6 bg-gray-200 dark:bg-zinc-700 rounded-sm" />
                  </div>
                </div>

                {/* Overlay floating badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="absolute bottom-4 right-4 z-20 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-lg border-2 border-white dark:border-zinc-900"
                >
                  Evaluation Ready ✨
                </motion.div>
              </div>
            )}

            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-base font-bold text-gray-900 dark:text-white">{activeStep.title}</h4>
                <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md">Step {currentStep + 1} of {steps.length}</span>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                {activeStep.text}
              </p>

              <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50 dark:border-zinc-800/50">
                <button
                  onClick={handleSkip}
                  className="text-xs font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Skip
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="px-4 py-2.5 rounded-md text-xs font-bold text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1"
                  >
                    <ChevronLeft className="h-3 w-3" /> Prev
                  </button>
                  <button
                    onClick={handleNext}
                    className="px-5 py-2.5 rounded-md bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-1 shadow-lg shadow-indigo-500/20"
                  >
                    {currentStep === steps.length - 1 ? "Finish" : "Next"} <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
