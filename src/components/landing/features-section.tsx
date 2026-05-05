import { BrainCircuit, Search, FileText, SlidersHorizontal } from "lucide-react";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { Marquee } from "@/components/ui/marquee";
import { cn } from "@/lib/utils";

const mockFiles = [
  { name: "invention_v1.docx", body: "A novel approach to decentralized energy distribution..." },
  { name: "patent_draft.pdf", body: "Methods and systems for accelerating AI inference..." },
  { name: "prior_art.xlsx", body: "List of related patents from 2018-2023..." },
  { name: "diagrams.svg", body: "Vector representation of the system architecture." },
];

const features = [
  {
    Icon: BrainCircuit,
    name: "AI-Powered Analysis",
    description: "Detects vague claims and inconsistencies instantly using advanced NLP.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <Marquee
        pauseOnHover
        className="absolute top-10 [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] [--duration:20s]"
      >
        {mockFiles.map((f, idx) => (
          <figure
            key={idx}
            className={cn(
              "relative w-32 cursor-pointer overflow-hidden rounded-xl border p-4",
              "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
              "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
              "transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none"
            )}
          >
            <div className="flex flex-col">
              <figcaption className="text-sm font-medium text-gray-900 dark:text-white">
                {f.name}
              </figcaption>
            </div>
            <blockquote className="mt-2 text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
              {f.body}
            </blockquote>
          </figure>
        ))}
      </Marquee>
    ),
  },
  {
    Icon: Search,
    name: "Prior Art Intelligence",
    description: "Automatic patent reference validation and semantic similarity search.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
      <div className="absolute right-4 top-10 w-[70%] h-full flex flex-col gap-3 [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] transition-all duration-300 ease-out group-hover:scale-105 origin-top">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              <Search className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">US-2023{i}456-A1</span>
              <span className="text-xs text-gray-500">8{i}% semantic overlap detected</span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    Icon: FileText,
    name: "Explainable Scoring",
    description: "Detailed, section-wise reasoning for every assigned score.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
      <div className="absolute right-4 top-10 w-[70%] h-full [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] transition-all duration-300 ease-out group-hover:scale-105 origin-top">
        <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80 flex flex-col gap-4">
          <div className="flex justify-between items-end border-b border-gray-100 dark:border-zinc-800 pb-3">
            <span className="text-base font-semibold text-gray-900 dark:text-white">Novelty Score</span>
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">8.5/10</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            The claims demonstrate significant deviation from existing prior art, particularly in the method of execution described in Claim 3.
          </p>
          <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
            <div className="h-full bg-emerald-500 w-[85%] rounded-full" />
          </div>
        </div>
      </div>
    ),
  },
  {
    Icon: SlidersHorizontal,
    name: "Custom Rulesets",
    description: "Mentors define exactly what the AI should prioritize.",
    className: "col-span-3 lg:col-span-1",
    href: "#",
    cta: "Learn more",
    background: (
      <div className="absolute right-0 top-10 w-full h-full flex flex-col gap-4 p-6 [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] transition-all duration-300 ease-out group-hover:scale-105 origin-top">
        {["Strict Claims", "Innovation Focus", "Formatting"].map((rule, idx) => (
          <div key={rule} className="flex items-center justify-between w-[80%] mx-auto">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{rule}</span>
            <div className={cn("h-5 w-9 rounded-full flex items-center p-0.5", idx === 0 ? "bg-indigo-600 justify-end" : "bg-gray-200 dark:bg-zinc-700 justify-start")}>
              <div className="h-4 w-4 rounded-full bg-white shadow-sm" />
            </div>
          </div>
        ))}
      </div>
    ),
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-gray-50 py-16 md:py-24 dark:bg-[#0a0a0a]">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
            AI-powered patent evaluation, built for clarity and trust
          </h2>
          <p className="mt-4 text-base md:text-lg text-gray-600 dark:text-gray-400">
            Analyze, validate, and improve patents with a structured, explainable system designed for mentors and institutions.
          </p>
        </div>

        <BentoGrid className="mx-auto max-w-5xl">
          {features.map((feature, idx) => (
            <BentoCard key={idx} {...feature} />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}
