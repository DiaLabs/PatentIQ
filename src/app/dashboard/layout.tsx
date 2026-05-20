"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Sidebar } from "@/components/dashboard/sidebar";
import { PageTopBarWrapper } from "@/components/dashboard/page-top-bar-wrapper";
import { Menu } from "lucide-react";
import { PageTopBar } from "@/components/dashboard/dashboard-header";
import { useRefresh } from "@/context/RefreshContext";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { refresh, isRefreshing } = useRefresh();

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden relative bg-white dark:bg-[#0a0a0a]">
        {/* Backdrop for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main content area — relative so the floating top-bar anchors here */}
        <div className="flex-1 ml-0 lg:ml-64 overflow-y-auto relative z-10 flex flex-col h-screen">
          {/* Sticky Mobile Header Bar */}
          <header className="lg:hidden shrink-0 h-16 border-b border-gray-100 dark:border-zinc-800 bg-white/85 dark:bg-[#0a0a0a]/85 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-30">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-850 text-gray-600 dark:text-gray-400 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/dashboard" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              <img src="/icon0.svg" alt="PatentIQ Logo" className="w-8 h-8" />
              <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">PatentIQ</span>
            </Link>
            <div className="flex items-center">
              <PageTopBar onRefresh={refresh} isLoading={isRefreshing} />
            </div>
          </header>

          {/* Floating top-right icons on desktop — absolutely positioned, zero height impact */}
          <div className="hidden lg:block">
            <PageTopBarWrapper />
          </div>

          <main className="flex-grow">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
