"use client";

import { ShieldCheck, Search, SlidersHorizontal, PlayCircle } from "lucide-react";
import { DashboardMockup } from "./dashboard-mockup";
import { motion, Variants } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export function HeroSection() {
  const { user, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleSignIn = async () => {
    await signInWithGoogle();
    router.push("/dashboard");
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as any, // Explicitly cast to bypass strict array type inference
      },
    },
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-white dark:bg-[#0a0a0a]">
      {/* Base Background */}
      <div className="absolute inset-0 -z-20 bg-white dark:bg-[#0a0a0a]" />
      
      {/* Ambient Blobs */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute right-[10%] top-[15%] z-0 h-[600px] w-[600px] rounded-full bg-indigo-50/80 mix-blend-multiply blur-3xl dark:bg-indigo-900/20 dark:mix-blend-lighten" 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut", delay: 0.3 }}
        className="absolute right-[25%] top-[30%] z-0 h-[500px] w-[500px] rounded-full bg-violet-50/80 mix-blend-multiply blur-3xl dark:bg-violet-900/20 dark:mix-blend-lighten" 
      />

      <div className="relative z-10 mx-auto max-w-[1600px] px-8 pb-20 pt-[120px] md:pt-[160px] lg:px-24">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-12 lg:gap-20">
          {/* ── Left Column ── */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full lg:max-w-[600px] text-center lg:text-left"
          >
            {/* Heading */}
            <motion.h1 variants={itemVariants} className="text-[2.5rem] sm:text-[3rem] md:text-[3.5rem] font-bold leading-[1.1] tracking-tight text-gray-900 dark:text-white lg:text-[3.75rem]">
              Smarter Patent
              <br />
              Evaluation.
              <br />
              <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent dark:from-violet-400 dark:to-indigo-400">
                Stronger Innovations.
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p variants={itemVariants} className="mt-6 mx-auto lg:mx-0 max-w-[480px] text-[15px] md:text-[16px] leading-relaxed text-gray-500 dark:text-gray-400">
              PatentIQ combines AI, prior art search, and mentor-defined
              criteria to evaluate patents with accuracy, consistency,
              and clarity.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button 
                onClick={handleSignIn}
                className="flex h-14 w-full sm:w-auto items-center justify-center gap-3 rounded-md bg-indigo-600 px-8 text-[16px] font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm shrink-0">
                  <GoogleIcon />
                </div>
                {user ? "Go to Dashboard" : "Continue with Google"}
              </button>

              <button className="flex h-14 w-full sm:w-auto items-center justify-center gap-2.5 rounded-md border border-gray-200 bg-white px-7 text-[16px] font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-zinc-900 dark:text-gray-300 dark:hover:bg-zinc-800">
                <PlayCircle className="h-5 w-5 text-gray-400 dark:text-gray-500" strokeWidth={2} />
                See how it works
              </button>
            </motion.div>

            {/* 3 Feature items */}
            <motion.div variants={itemVariants} className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 lg:w-[800px] lg:max-w-[150%]">
              <FeatureItem
                icon={<ShieldCheck className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />}
                title="AI-Powered"
                desc="Advanced NLP for deep insights"
              />
              <FeatureItem
                icon={<Search className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />}
                title="Prior Art"
                desc="Real-time patent validation"
              />
              <FeatureItem
                icon={<SlidersHorizontal className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />}
                title="Mentor-Driven"
                desc="Custom evaluation rules"
              />
            </motion.div>
          </motion.div>

          {/* ── Right Column — Dashboard ── */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden w-full lg:flex lg:min-w-0 lg:flex-1 lg:mt-[-30px] justify-end items-start"
          >
            {/* Ambient Background shapes */}
            <div className="absolute -inset-10 -z-10 rounded-full bg-indigo-50/50 blur-3xl dark:bg-indigo-900/10" />
            
            <div className="relative z-10 pointer-events-none select-none">
              <div className="scale-[0.88] xl:scale-[0.98] origin-top-right">
                <DashboardMockup />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FeatureItem({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/20">
        {icon}
      </div>
      <div className="pt-1 text-left">
        <p className="text-[15px] font-bold text-gray-900 dark:text-gray-100">{title}</p>
        <p className="mt-1 text-[13px] leading-snug text-gray-500 dark:text-gray-400">{desc}</p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.04 10.04 0 0 0 1.64 12c0 1.61.39 3.14 1.07 4.49l3.13-2.4z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
