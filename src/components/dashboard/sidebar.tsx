"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  FileText,
  Users,
  Sliders,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";

import React, { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

const navItems: NavItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Dashboard overview",
  },
  {
    label: "Submissions",
    href: "/dashboard/submissions",
    icon: FileText,
    description: "Manage all submissions",
  },
  {
    label: "Groups",
    href: "/dashboard/groups",
    icon: Users,
    description: "Manage evaluation groups",
  },
  {
    label: "Evaluation Rules",
    href: "/dashboard/evaluation-rules",
    icon: Sliders,
    description: "Configure evaluation criteria",
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    description: "View analytics and reports",
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    description: "Account settings",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
  };

  const isNavItemActive = (href: string): boolean => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-zinc-800 flex flex-col z-30 shadow-sm"
    >
      {/* Header - Logo Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex items-center gap-3 px-6 py-6 border-b border-gray-100 dark:border-zinc-800"
      >
        <svg
          width="44"
          height="44"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-indigo-600 shrink-0"
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
          <circle cx="10" cy="14" r="2" stroke="currentColor" strokeWidth="2" />
          <path
            d="M15 17H9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          PatentIQ
        </span>
      </motion.div>

      {/* Navigation Section */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto"
      >
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = isNavItemActive(item.href);

          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.3,
                delay: 0.15 + index * 0.05,
                ease: "easeOut",
              }}
            >
              <Link
                href={item.href}
                className={`group relative flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 shadow-sm dark:from-indigo-900/20 dark:to-indigo-900/10 dark:text-indigo-300"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-zinc-900 dark:hover:text-gray-200"
                }`}
              >

                {/* Icon */}
                <Icon
                  className={`h-5 w-5 flex-shrink-0 transition-all duration-200 ${
                    isActive
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                  }`}
                />

                {/* Label */}
                <span className="flex-1">{item.label}</span>

                {/* Hover indicator */}
                {!isActive && (
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-600 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                )}
              </Link>
            </motion.div>
          );
        })}
      </motion.nav>

      {/* User Section - Fixed at Bottom */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="relative border-t border-gray-100 dark:border-zinc-800 p-4"
      >

        <div className="relative z-10 space-y-3">
          {/* User Profile Card */}
          <div className="px-4 py-3 rounded-md bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-200/50 dark:from-indigo-900/20 dark:to-indigo-900/10 dark:border-indigo-800/30">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              {user?.photoURL ? (
                <motion.img
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.4,
                  }}
                  src={user.photoURL}
                  alt={user.displayName ?? "User"}
                  className="h-9 w-9 rounded-full object-cover flex-shrink-0 ring-2 ring-white"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center flex-shrink-0 ring-2 ring-white text-white">
                  <span className="text-xs font-bold">
                    {user?.displayName?.[0]?.toUpperCase() ?? "M"}
                  </span>
                </div>
              )}

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                  {user?.displayName || "Mentor"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email || "(Not verified)"}
                </p>
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <motion.button
            onClick={handleSignOut}
            disabled={isSigningOut}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-gray-300 dark:hover:text-gray-100 font-medium text-sm transition-all duration-200 border border-gray-200 dark:border-zinc-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <LogOut className="h-4 w-4" strokeWidth={2} />
            <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.aside>
  );
}
