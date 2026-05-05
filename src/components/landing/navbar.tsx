import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

export function Navbar() {
  return (
    <header className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-md dark:bg-[#0a0a0a]/80 border-b border-transparent dark:border-white/[0.05]">
      <div className="mx-auto flex h-24 max-w-[1440px] items-center justify-between px-6 lg:px-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-indigo-600 dark:text-indigo-400"
          >
            <path
              d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 2V8H20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="10"
              cy="14"
              r="2"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M15 17H9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[22px] font-bold tracking-tight text-gray-900 dark:text-white">
              PatentIQ
            </span>
            <div className="flex items-center gap-1.5">
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                BETA
              </span>
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="#features"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            How it Works
          </Link>
          <Link
            href="#institutions"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            For Institutions
          </Link>
          <Link
            href="#pricing"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            Pricing
          </Link>
          <button className="flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
            Resources
            <ChevronDown className="h-4 w-4" />
          </button>
        </nav>

        {/* Right Actions */}
        <div className="hidden items-center gap-4 md:flex">
          <AnimatedThemeToggler 
            duration={400}
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-zinc-800 dark:hover:text-gray-300 [&>svg]:h-5 [&>svg]:w-5" 
          />

          {/* CTA Button */}
          <Button
            variant="outline"
            className="h-10 gap-2 rounded-md border-gray-200 px-5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-zinc-900 dark:text-gray-300 dark:hover:bg-zinc-800"
          >
            <GoogleIcon />
            Sign in
          </Button>
        </div>
      </div>
    </header>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
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
