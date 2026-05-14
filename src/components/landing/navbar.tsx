"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut } from "lucide-react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signInWithGoogle, signOut, isSigningIn } = useAuth();
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

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How it Works", href: "#how-it-works" },
    { name: "FAQ", href: "#faq" },
    { name: "Pricing", href: "#pricing" },
  ];

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  return (
    <>
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 z-[100] w-full bg-white/80 backdrop-blur-md dark:bg-[#0a0a0a]/80 border-b border-transparent dark:border-white/[0.05]"
      >
        <div className="mx-auto flex h-20 md:h-24 max-w-[1440px] items-center justify-between px-6 lg:px-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 relative z-[101]">
            <img 
              src="/icon0.svg" 
              alt="PatentIQ Logo" 
              className="w-10 h-10 object-contain"
            />
            <div className="flex items-baseline gap-1.5">
              <span className="text-[20px] md:text-[22px] font-bold tracking-tight text-gray-900 dark:text-white">
                PatentIQ
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => {
                  const el = document.getElementById(link.href.replace("#", ""));
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white cursor-pointer"
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            <AnimatedThemeToggler 
              duration={400}
              className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-zinc-800 dark:hover:text-gray-300 [&>svg]:h-5 [&>svg]:w-5" 
            />

            <Button
              variant="outline"
              onClick={user ? signOut : handleSignIn}
              disabled={!user && isSigningIn}
              className={cn(
                "hidden md:flex h-10 gap-2 rounded-md border-gray-200 px-5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                user 
                  ? "border-red-100 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20" 
                  : "text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-zinc-900 dark:text-gray-300 dark:hover:bg-zinc-800"
              )}
            >
              {user ? (
                <>
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </>
              ) : (
                <>
                  <GoogleIcon />
                  Sign in
                </>
              )}
            </Button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative z-[10001] flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-gray-600 dark:border-zinc-800 dark:text-gray-400 md:hidden"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown - Compact */}
        <div
          className={cn(
            "absolute top-full left-0 right-0 z-[100] border-b border-gray-100 bg-white/95 backdrop-blur-xl transition-all duration-300 ease-in-out dark:border-zinc-800 dark:bg-[#0a0a0a]/95 md:hidden",
            isMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"
          )}
        >
          <div className="flex flex-col p-6 gap-4">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => {
                  setIsMenuOpen(false);
                  setTimeout(() => {
                    const el = document.getElementById(link.href.replace("#", ""));
                    el?.scrollIntoView({ behavior: "smooth" });
                  }, 300);
                }}
                className="text-left text-lg font-semibold text-gray-900 transition-colors hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400 cursor-pointer"
              >
                {link.name}
              </button>
            ))}
            <hr className="my-2 border-gray-100 dark:border-zinc-800" />
            <Button
              size="lg"
              onClick={user ? signOut : handleSignIn}
              disabled={!user && isSigningIn}
              className={cn(
                "w-full h-12 gap-3 rounded-md text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60",
                user 
                  ? "bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30" 
                  : "bg-indigo-600 text-white dark:bg-white dark:text-black"
              )}
            >
              <div className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full shadow-sm shrink-0",
                user ? "bg-red-100 dark:bg-red-900/40" : "bg-white"
              )}>
                {user ? <LogOut className="h-3.5 w-3.5" /> : <GoogleIcon />}
              </div>
              {user ? "Sign Out" : "Sign in with Google"}
            </Button>
          </div>
        </div>
      </motion.header>
    </>
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
