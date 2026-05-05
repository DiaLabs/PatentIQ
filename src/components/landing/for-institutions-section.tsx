import { Scale, Clock, FolderKanban, LineChart, Lock } from "lucide-react";

const benefits = [
  {
    name: "Standardized Evaluation",
    description: "Eliminate subjective grading inconsistencies and ensure fair, repeatable assessments across all student submissions.",
    icon: <Scale className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
  },
  {
    name: "Time Efficiency",
    description: "Automate repetitive review tasks so mentors can focus exclusively on critical, complex submissions.",
    icon: <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
  },
  {
    name: "Batch Management",
    description: "Organize submissions by groups or classes to seamlessly process hundreds of patents simultaneously.",
    icon: <FolderKanban className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
  },
  {
    name: "Insightful Analytics",
    description: "Track performance trends and easily identify common weaknesses across cohorts.",
    icon: <LineChart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
  },
  {
    name: "Secure & Controlled Access",
    description: "Mentor-only dashboards and token-based submission links mean no student accounts are required.",
    icon: <Lock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
  }
];

export function ForInstitutionsSection() {
  return (
    <section id="institutions" className="bg-gray-50 py-24 dark:bg-[#0a0a0a] sm:py-32">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center lg:gap-24">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Built for scale, consistency, and academic rigor
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              PatentIQ seamlessly integrates into your institutional workflow, providing mentors with the tools they need to evaluate cohorts efficiently without sacrificing quality.
            </p>
            <div className="mt-10 space-y-8">
              {benefits.map((benefit) => (
                <div key={benefit.name} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {benefit.name}
                    </h3>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative aspect-square w-full rounded-2xl bg-indigo-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 flex items-center justify-center p-8 overflow-hidden">
            {/* Abstract Decorative Element for Institutions */}
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#ffffff20_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_20%,transparent_100%)] opacity-50"></div>
            <div className="relative z-10 text-center">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40 mb-6">
                <Scale className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Institution Ready</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-[250px] mx-auto">Scale your patent evaluation program effortlessly.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
