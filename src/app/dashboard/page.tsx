"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";

export default function DashboardPage() {
  const { user, signOut } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
        <Navbar />
        
        <main className="mx-auto max-w-7xl px-4 pt-32 pb-12 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
            <div className="p-6 sm:p-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                    <User className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Welcome, {user?.displayName || "User"}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 grid gap-6 md:grid-cols-3">
                <DashboardCard 
                  title="Patent Analyses" 
                  value="12" 
                  description="Completed in the last 30 days" 
                />
                <DashboardCard 
                  title="Prior Art Found" 
                  value="48" 
                  description="Potential matches identified" 
                />
                <DashboardCard 
                  title="Average Score" 
                  value="8.4/10" 
                  description="Based on mentor criteria" 
                />
              </div>

              <div className="mt-10 rounded-xl border border-dashed border-gray-300 p-12 text-center dark:border-zinc-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Start a new evaluation</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Upload your patent documentation to begin the AI analysis.</p>
                <Button className="mt-6 bg-indigo-600 hover:bg-indigo-700">
                  New Analysis
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

function DashboardCard({ title, value, description }: { title: string, value: string, description: string }) {
  return (
    <div className="rounded-xl border border-gray-200 p-6 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{description}</p>
    </div>
  );
}
