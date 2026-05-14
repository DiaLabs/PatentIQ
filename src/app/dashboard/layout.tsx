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
      <div className="flex h-screen overflow-hidden relative">
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
