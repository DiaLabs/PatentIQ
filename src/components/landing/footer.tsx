"use client";

import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const footerLinks = [
  { name: "Features", href: "#features" },
  { name: "How it Works", href: "#how-it-works" },
  { name: "FAQ", href: "#faq" },
  { name: "Pricing", href: "#pricing" },
  { name: "Privacy Policy", href: "#" },
  { name: "Terms of Service", href: "#" },
  { name: "Contact", href: "#" },
];

export function Footer() {
  const { user, signInWithGoogle, isSigningIn } = useAuth();
  const router = useRouter();

  const handleSignIn = async () => {
    if (user) {
      router.replace("/dashboard");
      return;
    }
    const result = await signInWithGoogle();
    if (result.user) {
      router.replace("/dashboard");
    }
  };

  return (
    <footer className="bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-zinc-900">
      <div className="mx-auto max-w-[1280px] px-6 py-20 lg:px-8">
        
        {/* CTA Section */}
        <div className="flex flex-col items-center justify-center text-center pb-20">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-4">
            Ready to streamline patent evaluation?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl">
            Join the early access beta to evaluate patents with consistency, clarity, and trust using PatentIQ by DiaLabs.
          </p>
          <Button
            onClick={handleSignIn}
            disabled={!user && isSigningIn}
            className="h-12 px-8 text-base bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Get Started for Free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Links Row */}
        <div className="border-t border-gray-100 dark:border-zinc-900 pt-10">
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-medium text-gray-500 dark:text-gray-400">
            {footerLinks.map((link) => (
              <li key={link.name}>
                <Link href={link.href} className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Copyright */}
        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-500">
          <img src="/icon0.svg" alt="" className="h-5 w-5 grayscale opacity-50" />
          <span>
            &copy; {new Date().getFullYear()} PatentIQ{" "}
            <a 
              href="https://dialabs.tech" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="opacity-60 ml-1 hover:opacity-100 hover:text-gray-900 dark:hover:text-white transition-all"
            >
              by DiaLabs
            </a>
          </span>
        </div>

      </div>
    </footer>
  );
}
