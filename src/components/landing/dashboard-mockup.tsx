"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FileText,
  Users,
  Scale,
  BarChart3,
  TrendingUp,
  Settings,
  Bell,
  ChevronDown,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  AlertCircle,
  PlusCircle,
  Link as LinkIcon,
  Upload,
  Download,
  ChevronRight,
  MousePointer2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function DashboardMockup() {
  const [view, setView] = useState<"overview" | "groups">("overview");
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [cursorState, setCursorState] = useState({ x: 600, y: 350, type: "default" }); // Centered rest position
  const [isClicked, setIsClicked] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Animation Timeline Logic
  useEffect(() => {
    const runSequence = () => {
      // Phase 1: Overview
      setView("overview");
      setHoveredTab(null);
      setCursorState({ x: 600, y: 350, type: "default" });
      setLoadingProgress(0);
      setIsClicked(false);

      // 1.0s - Move to "Groups"
      const t1 = setTimeout(() => {
        setCursorState({ x: 88, y: 135, type: "pointer" });
      }, 1000);

      // 2.4s - Arrival at Groups (Hover starts)
      const t2 = setTimeout(() => setHoveredTab("groups"), 2400);

      // 3.0s - Click "Groups"
      const t3 = setTimeout(() => {
        setIsClicked(true);
        setHoveredTab(null);
        setTimeout(() => setIsClicked(false), 200);
      }, 3000);

      // 3.2s - Transition to Groups View
      const t4 = setTimeout(() => {
        setLoadingProgress(100);
        setView("groups");
        setTimeout(() => setLoadingProgress(0), 1000);
      }, 3200);

      // 5.5s - Move back to "Overview"
      const t5 = setTimeout(() => {
        setCursorState({ x: 88, y: 95, type: "pointer" });
      }, 5500);

      // 6.9s - Arrival at Overview (Hover starts)
      const t6 = setTimeout(() => setHoveredTab("overview"), 6900);

      // 7.5s - Click "Overview"
      const t7 = setTimeout(() => {
        setIsClicked(true);
        setHoveredTab(null);
        setTimeout(() => setIsClicked(false), 200);
      }, 7500);

      // 7.7s - Transition back to Overview
      const t8 = setTimeout(() => {
        setLoadingProgress(100);
        setView("overview");
        setTimeout(() => setLoadingProgress(0), 1000);
      }, 7700);

      // 8.8s - Retreat to Rest Position
      const t9 = setTimeout(() => {
        setCursorState({ x: 600, y: 350, type: "default" });
      }, 8800);

      return [t1, t2, t3, t4, t5, t6, t7, t8, t9];
    };

    let timeouts = runSequence();
    
    // Loop every 10 seconds for a clean never-ending cycle
    const interval = setInterval(() => {
      timeouts.forEach(clearTimeout);
      timeouts = runSequence();
    }, 10000);

    return () => {
      clearInterval(interval);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="relative group perspective-1000">
      {/* Simulated Cursor */}
      <motion.div
        className="pointer-events-none absolute z-[9999] text-gray-900 drop-shadow-xl"
        animate={{ 
          x: cursorState.x, 
          y: cursorState.y,
          scale: isClicked ? 0.85 : 1
        }}
        transition={{ 
          duration: cursorState.type === "pointer" ? 1.4 : 1.2,
          ease: [0.4, 0, 0.2, 1] 
        }}
      >
        <MousePointer2 className="h-5 w-5 fill-white stroke-[1.5px]" />
      </motion.div>

      {/* Dashboard Container */}
      <div className="overflow-hidden rounded-md border border-gray-100 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] w-full max-w-[1320px] dark:border-gray-800 dark:bg-[#09090b] transition-all duration-500 relative">
        {/* Full-Width Top Loading Progress Line */}
        <motion.div 
          className="absolute top-0 left-0 h-[2px] bg-indigo-500 z-[100]"
          initial={{ width: "0%" }}
          animate={{ width: `${loadingProgress}%` }}
          transition={{ duration: 0.3 }}
        />
        
        <div className="flex h-[540px]">
          {/* Sidebar */}
          <div className="w-44 shrink-0 border-r border-gray-100 p-4 pt-6 dark:border-gray-800 flex flex-col justify-between bg-white dark:bg-[#09090b]">
            <div>
              {/* Logo */}
              <div className="mb-6 flex items-center gap-2 px-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-white">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" />
                    <path d="M14 2V8H20" />
                    <circle cx="10" cy="14" r="2" />
                    <path d="M15 17H9" />
                  </svg>
                </div>
                <span className="text-base font-bold tracking-tight text-gray-900 dark:text-gray-100">PatentIQ</span>
              </div>

              {/* Nav Items */}
              <nav className="space-y-1">
                <SidebarItem
                  icon={<LayoutDashboard className="h-3.5 w-3.5" />}
                  label="Overview"
                  active={view === "overview"}
                  isHovered={hoveredTab === "overview"}
                  isClicked={isClicked && hoveredTab === "overview"}
                />
                <SidebarItem
                  icon={<Users className="h-3.5 w-3.5" />}
                  label="Groups"
                  active={view === "groups"}
                  isHovered={hoveredTab === "groups"}
                  isClicked={isClicked && hoveredTab === "groups"}
                />
                <SidebarItem icon={<Scale className="h-3.5 w-3.5" />} label="Rules" />
                <SidebarItem icon={<TrendingUp className="h-3.5 w-3.5" />} label="Analytics" />
              </nav>
            </div>

            {/* User Profile */}
            <div className="rounded-md border border-gray-100 bg-gray-50/50 p-2 dark:border-gray-800 dark:bg-zinc-900/50 flex items-center gap-2">
              <Avatar className="h-6 w-6 border border-white shadow-sm">
                <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop" />
                <AvatarFallback>SW</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-[9px] font-bold text-gray-900 dark:text-gray-100">Dr. Sarah Wilson</p>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="relative min-w-0 flex-1 flex flex-col bg-[#fcfcfd] dark:bg-[#0a0a0a]">
            {/* Content Area */}
            <div className="flex-1 overflow-hidden p-6 relative">
              <AnimatePresence mode="wait">
                {view === "overview" ? (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          Welcome back, Dr. Sarah! 👋
                        </h2>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                          Here&apos;s what&apos;s happening with your groups today.
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm dark:border-gray-800 dark:bg-zinc-900 dark:text-gray-300">
                          All Groups
                          <ChevronDown className="h-3 w-3 text-gray-400" />
                        </div>
                        <button className="relative flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-zinc-900">
                          <Bell className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        </button>
                      </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="mb-6 grid grid-cols-4 gap-3">
                      {[
                        { label: "Total Submissions", value: "128", icon: <FileText />, color: "indigo" },
                        { label: "Completed", value: "96", icon: <CheckCircle2 />, color: "emerald" },
                        { label: "In Progress", value: "24", icon: <Clock />, color: "amber" },
                        { label: "Needs Review", value: "8", icon: <AlertCircle />, color: "rose" },
                      ].map((stat) => (
                        <StatCard key={stat.label} {...stat} />
                      ))}
                    </div>

                    <div className="flex items-start gap-5">
                      <div className="flex-1 rounded-md border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-zinc-900/40">
                        <div className="mb-4 flex items-center justify-between">
                          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Recent Submissions</h3>
                          <button className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">View all</button>
                        </div>
                        <div className="space-y-3">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="border-b border-gray-50 dark:border-zinc-800 flex items-center px-2 h-10">
                              <div className="text-[11px] font-bold text-gray-700 dark:text-gray-300">Submission_Patent_00{i}.docx</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="w-64 rounded-md border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-zinc-900/40">
                        <h3 className="mb-4 text-sm font-bold text-gray-900 dark:text-gray-100">Quick Actions</h3>
                        <div className="space-y-2">
                          <QuickActionItem icon={<PlusCircle />} title="New Group" />
                          <QuickActionItem icon={<LinkIcon />} title="Generate Link" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="groups"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="mb-6">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">My Groups</h2>
                      <p className="text-xs text-gray-500 font-medium">Manage and monitor your evaluation groups.</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {["Quantum NLP", "Bio-Ethics 2026", "Green Energy", "Smart Cities", "Robotics A1", "Deep Sea Exploration"].map((g) => (
                        <div key={g} className="rounded-md border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-zinc-900/40 hover:border-indigo-200 transition-colors cursor-pointer">
                          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20">
                            <Users className="h-5 w-5" />
                          </div>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">{g}</h4>
                          <p className="mt-1 text-[10px] text-gray-500 font-medium">12 active submissions</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Decorative Background */}
            <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none overflow-hidden opacity-50">
               <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full text-indigo-500/10 fill-current">
                <path d="M0,160L48,176C96,192,192,224,288,229.3C384,235,480,213,576,186.7C672,160,768,128,864,128C960,128,1056,160,1152,181.3C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active, isHovered, isClicked }: any) {
  return (
    <motion.div
      animate={isClicked ? { scale: 0.96 } : { scale: 1 }}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-3 py-2 text-[11px] font-semibold transition-all duration-200",
        active
          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
          : isHovered 
            ? "bg-[#F3F0FF] text-gray-900 dark:bg-indigo-900/20 dark:text-white"
            : "text-gray-500 dark:text-gray-400"
      )}
    >
      <span className={cn(active ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400")}>
        {icon}
      </span>
      {label}
    </motion.div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className="rounded-md border border-gray-50 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-zinc-900/40">
      <div className="mb-2 flex items-center gap-2">
        <div className={cn("flex h-7 w-7 items-center justify-center rounded-md", `bg-${color}-50 text-${color}-600`)}>
          {React.cloneElement(icon as React.ReactElement<any>, { className: "h-3.5 w-3.5" })}
        </div>
        <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight">{label}</span>
      </div>
      <p className="text-xl font-black text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  );
}

function QuickActionItem({ icon, title }: any) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-gray-50 p-2.5 bg-white dark:bg-transparent">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
        {React.cloneElement(icon as React.ReactElement<any>, { className: "h-4 w-4" })}
      </div>
      <p className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">{title}</p>
      <ChevronRight className="h-3 w-3 text-gray-300 ml-auto" />
    </div>
  );
}
