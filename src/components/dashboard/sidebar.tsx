"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Sliders, 
  BarChart3, 
  Settings,
  LogOut,
  ChevronRight,
  X,
  Coins
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Groups", href: "/dashboard/groups", icon: Users },
  { name: "Submissions", href: "/dashboard/submissions", icon: FileText },
  { name: "Evaluation Rules", href: "/dashboard/evaluation-rules", icon: Sliders },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, mentorProfile, signOut } = useAuth();

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen w-64 border-r border-gray-100 dark:border-zinc-800 bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-xl z-50 flex flex-col transition-transform duration-300",
      isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}>
      {/* Brand */}
      <div className="px-8 py-10 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-1" onClick={onClose}>
          <img src="/icon0.svg" alt="PatentIQ Logo" className="w-10 h-10" />
          <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">PatentIQ</span>
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.href === "/dashboard" 
            ? pathname === "/dashboard" 
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "group flex items-center gap-3 px-4 py-3 rounded-md text-sm font-semibold transition-all relative overflow-hidden",
                isActive 
                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-500/20" 
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-6 bg-indigo-600 dark:bg-indigo-400 rounded-r-full"
                />
              )}
              <Icon className={cn("h-5 w-5", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-zinc-500")} />
              {item.name}
              {!isActive && (
                <ChevronRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Credits Display — mobile only, integrated with bottom section */}
      {mentorProfile && (
        <div
          onClick={() => {
            if (mentorProfile.credits === 0) {
              const event = new CustomEvent('insufficient-credits-modal', { detail: { pausedSubIds: [] } });
              window.dispatchEvent(event);
            }
          }}
          className={`lg:hidden mx-4 mb-2 flex items-center gap-3 px-4 py-2.5 rounded-md border transition-all ${
            mentorProfile.credits === 0
              ? "border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/10 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/20"
              : mentorProfile.credits <= 5
              ? "border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-900/10"
              : "border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30"
          }`}
        >
          <Coins className={`h-4 w-4 shrink-0 ${
            mentorProfile.credits <= 5 ? "text-red-500 dark:text-red-400" : "text-gray-400 dark:text-gray-500"
          }`} />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 leading-none mb-0.5">Credits</p>
            <p className={`text-sm font-bold tabular-nums ${
              mentorProfile.credits <= 5 ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"
            }`}>{mentorProfile.credits} available</p>
          </div>
          {mentorProfile.credits === 0 && (
            <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">Tap to refill</span>
          )}
        </div>
      )}

      {/* User / Bottom */}
      <div className="p-4 border-t border-gray-100 dark:border-zinc-800">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-sm uppercase">
            {user?.displayName?.[0] || user?.email?.[0] || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.displayName || "Mentor"}</p>
            <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        
        <button
          onClick={signOut}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md transition-all group"
        >
          <LogOut className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
