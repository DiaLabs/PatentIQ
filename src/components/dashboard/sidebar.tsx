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
  ChevronRight
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

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-gray-100 dark:border-zinc-800 bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-xl z-50 flex flex-col">
      {/* Brand */}
      <div className="p-8">
        <Link href="/dashboard" className="flex items-center gap-3">
          <img src="/icon0.svg" alt="PatentIQ Logo" className="w-9 h-9" />
          <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">PatentIQ</span>
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-4 py-3 rounded-md text-sm font-semibold transition-all relative overflow-hidden",
                isActive 
                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10" 
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
