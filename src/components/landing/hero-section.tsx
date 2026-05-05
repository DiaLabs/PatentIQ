import Image from "next/image";
import { DashboardMockup } from "./dashboard-mockup";
import { ShieldCheck, Search, SlidersHorizontal, PlayCircle } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-white dark:bg-[#0a0a0a]">


      {/* Base Background */}
      <div className="absolute inset-0 -z-20 bg-white dark:bg-[#0a0a0a]" />
      {/* Ambient Blobs */}
      <div className="absolute right-[10%] top-[15%] z-0 h-[600px] w-[600px] rounded-full bg-indigo-50/80 mix-blend-multiply blur-3xl dark:bg-indigo-900/20 dark:mix-blend-lighten" />
      <div className="absolute right-[25%] top-[30%] z-0 h-[500px] w-[500px] rounded-full bg-violet-50/80 mix-blend-multiply blur-3xl dark:bg-violet-900/20 dark:mix-blend-lighten" />
      <div className="relative z-10 mx-auto max-w-[1440px] px-6 pb-0 pt-[160px] lg:px-12">
        <div className="flex items-start justify-between gap-12 lg:gap-20">
          {/* ── Left Column ── */}
          <div className="w-full max-w-[600px] shrink-0 pb-20">
            {/* Pill Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/50 px-4 py-1.5 text-sm text-indigo-900 shadow-sm dark:border-indigo-900/50 dark:bg-indigo-900/20 dark:text-indigo-200">
              <ShieldCheck className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
              <span className="font-medium text-indigo-600 dark:text-indigo-300">AI-Powered</span>
              <span className="text-indigo-300 dark:text-indigo-700">·</span>
              <span className="font-medium text-indigo-600 dark:text-indigo-300">Mentor-Driven</span>
              <span className="text-indigo-300 dark:text-indigo-700">·</span>
              <span className="font-medium text-indigo-600 dark:text-indigo-300">Patent Evaluation</span>
            </div>

            {/* Heading */}
            <h1 className="text-[3rem] font-bold leading-[1.05] tracking-tight text-gray-900 dark:text-white lg:text-[3.75rem]">
              Smarter Patent
              <br />
              Evaluation.
              <br />
              <span className="whitespace-nowrap bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent dark:from-violet-400 dark:to-indigo-400">
                Stronger Innovations.
              </span>
            </h1>

            {/* Subtext */}
            <p className="mt-6 max-w-[480px] text-[16px] leading-relaxed text-gray-500 dark:text-gray-400">
              PatentIQ combines AI, prior art search, and mentor-defined
              criteria to evaluate patents with accuracy, consistency,
              and clarity — so you can focus on what truly matters:{" "}
              <span className="font-semibold text-violet-600 dark:text-violet-400">
                building the future.
              </span>
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex items-center gap-4">
              {/* Primary — solid indigo rounded-md with Google icon */}
              <button className="flex h-14 items-center gap-3 rounded-md bg-indigo-600 px-8 text-[16px] font-semibold text-white transition-colors hover:bg-indigo-700">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm">
                  <GoogleIcon />
                </div>
                Continue with Google
              </button>

              {/* Secondary — bordered box with play icon */}
              <button className="flex h-14 items-center gap-2.5 rounded-md border border-gray-200 bg-white px-7 text-[16px] font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-zinc-900 dark:text-gray-300 dark:hover:bg-zinc-800">
                <PlayCircle className="h-5 w-5 text-gray-400 dark:text-gray-500" strokeWidth={2} />
                See how it works
              </button>
            </div>

            {/* 3 Feature items */}
            <div className="mt-16 flex w-[800px] max-w-[150%] items-start gap-12">
              <FeatureItem
                icon={<ShieldCheck className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />}
                title="AI-Powered Analysis"
                desc={<>Advanced NLP and AI<br />for deep insights</>}
              />
              <FeatureItem
                icon={<Search className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />}
                title="Prior Art Intelligence"
                desc={<>Real-time patent search<br />and validation</>}
              />
              <FeatureItem
                icon={<SlidersHorizontal className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />}
                title="Mentor-Driven Rules"
                desc={<>Custom evaluation<br />rules that matter</>}
              />
            </div>
          </div>

          {/* ── Right Column — Dashboard ── */}
          <div className="relative min-w-0 flex-1">
            {/* Decorative Ambient Shape Behind Dashboard */}
            <div className="absolute -left-10 -right-20 -top-10 bottom-0 -z-10 rounded-full bg-indigo-50/80 blur-3xl dark:bg-indigo-900/20" />
            
            {/* Decorative Dot Grid Block (Peeking right) */}
            <div className="absolute -right-12 top-10 -z-20 h-40 w-40 bg-[radial-gradient(#c7d2fe_1.5px,transparent_1.5px)] [background-size:16px_16px] dark:bg-[radial-gradient(#4f46e540_1.5px,transparent_1.5px)]" />

            {/* Subtle solid circular shape (Top Right) */}
            <div className="absolute -right-20 -top-20 -z-30 h-80 w-80 rounded-full bg-indigo-50/80 dark:bg-indigo-900/10" />
            
            {/* Subtle solid circular shape (Bottom Left) */}
            <div className="absolute -bottom-16 -left-16 -z-30 h-64 w-64 rounded-full bg-violet-50/60 dark:bg-violet-900/10" />

            <div className="relative z-10 pointer-events-none select-none -mr-8 pt-2">
              <DashboardMockup />
            </div>
          </div>
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
      <div className="pt-1">
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
