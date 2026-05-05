import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

export function PricingSection() {
  return (
    <section id="pricing" className="bg-white py-24 dark:bg-[#0a0a0a] sm:py-32">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-full dark:text-indigo-400 dark:bg-indigo-900/20 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Public Beta
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Simple, transparent access
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
            PatentIQ is currently in Beta. Join now to get early access to all evaluation features completely free.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-lg lg:mt-20">
          <Card className="relative overflow-hidden border-2 border-indigo-600 shadow-xl dark:border-indigo-500 dark:bg-zinc-900/80">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 -z-10 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl dark:bg-indigo-500/20" />
            
            <CardHeader className="text-center pb-8 pt-10">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Beta Access</CardTitle>
              <div className="mt-4 flex items-baseline justify-center gap-x-2">
                <span className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">$0</span>
                <span className="text-base font-semibold leading-6 text-gray-600 dark:text-gray-400">/ forever for early users</span>
              </div>
              <CardDescription className="mt-4 text-base">
                Get full access to the AI engine while we refine the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 text-sm leading-6 text-gray-600 dark:text-gray-300">
                <li className="flex gap-x-3">
                  <Check className="h-6 w-5 flex-none text-indigo-600 dark:text-indigo-400" />
                  Unlimited patent submissions
                </li>
                <li className="flex gap-x-3">
                  <Check className="h-6 w-5 flex-none text-indigo-600 dark:text-indigo-400" />
                  Full AI + Prior Art analysis
                </li>
                <li className="flex gap-x-3">
                  <Check className="h-6 w-5 flex-none text-indigo-600 dark:text-indigo-400" />
                  Custom evaluation rules & parameters
                </li>
                <li className="flex gap-x-3">
                  <Check className="h-6 w-5 flex-none text-indigo-600 dark:text-indigo-400" />
                  Batch processing & exports
                </li>
              </ul>
            </CardContent>
            <CardFooter className="pb-10 pt-4">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:text-white" size="lg">
                Join the Beta
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
