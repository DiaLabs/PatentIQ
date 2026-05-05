import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PricingSection() {
  return (
    <section id="pricing" className="bg-white py-16 md:py-24 dark:bg-[#0a0a0a]">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-10 md:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
            Simple, transparent access
          </h2>
          <p className="mt-4 text-base md:text-lg text-gray-600 dark:text-gray-400">
            PatentIQ is currently in Beta. Early users get complete access for free.
          </p>
        </div>

        <div className="mx-auto max-w-lg">
          <div className="relative rounded-md border border-gray-100 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/40 transition-all duration-300">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                  Beta Access
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">$0</span>
                  <span className="text-sm font-medium text-gray-500">/ forever</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Evaluate patents with our full suite of AI tools while we refine the platform.
                </p>
              </div>

              <div className="h-px bg-gray-100 dark:bg-zinc-800" />

              <ul className="grid gap-3">
                {[
                  "Unlimited patent submissions",
                  "Full AI + Prior Art analysis",
                  "Custom evaluation rules",
                  "Batch processing & exports",
                  "Mentor dashboard access"
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <Check className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button className="h-12 w-full rounded-md bg-indigo-600 text-base font-semibold text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-all active:scale-[0.98]">
                Get Early Access
              </Button>
            </div>
          </div>
          
          <p className="mt-8 text-center text-xs text-gray-400 dark:text-zinc-600 uppercase tracking-widest font-bold">
            No credit card required during beta
          </p>
        </div>
      </div>
    </section>
  );
}
