import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        {/* Main content scrolls independently */}
        <main className="flex-1 ml-56 overflow-y-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
