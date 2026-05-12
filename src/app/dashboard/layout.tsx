import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Sidebar } from "@/components/dashboard/sidebar";
import { PageTopBarWrapper } from "@/components/dashboard/page-top-bar-wrapper";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-white dark:bg-[#0a0a0a] overflow-hidden relative">
        {/* Ambient Blobs */}
        <div className="absolute right-[10%] top-[15%] z-0 h-[600px] w-[600px] rounded-full bg-indigo-50/80 mix-blend-multiply blur-3xl dark:bg-indigo-900/20 dark:mix-blend-lighten" />
        <div className="absolute right-[25%] top-[30%] z-0 h-[500px] w-[500px] rounded-full bg-violet-50/80 mix-blend-multiply blur-3xl dark:bg-violet-900/20 dark:mix-blend-lighten" />

        <Sidebar />

        {/* Main content area — relative so the floating top-bar anchors here */}
        <div className="flex-1 ml-64 overflow-y-auto relative z-10">
          {/* Floating top-right icons — absolutely positioned, zero height impact */}
          <PageTopBarWrapper />
          <main>
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
