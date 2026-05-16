"use client";

import { useRouter } from "next/navigation";
import { PageTopBar } from "./dashboard-header";
import { useRefresh } from "@/context/RefreshContext";

/** Floats the top-right controls (theme / bell / refresh) without occupying
 *  any vertical space. Positioned absolutely in the top-right corner of the
 *  main content column. No background, no separator line. */
export function PageTopBarWrapper() {
  const router = useRouter();
  const { refresh, isRefreshing } = useRefresh();

  return (
    <div className="absolute top-0 right-0 z-20 flex items-center px-8 py-5 pointer-events-none">
      <div className="pointer-events-auto">
        <PageTopBar 
          onRefresh={() => {
            refresh();
          }} 
          isLoading={isRefreshing}
        />
      </div>
    </div>
  );
}
