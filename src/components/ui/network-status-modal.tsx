"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NetworkStatusModal() {
  const [isOffline, setIsOffline] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check initial status
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setIsOffline(true);
      setShowModal(true);
    }

    const handleOffline = () => {
      setIsOffline(true);
      setShowModal(true);
    };

    const handleOnline = () => {
      setIsOffline(false);
      // Auto-hide modal when back online
      setTimeout(() => setShowModal(false), 2000);
      
      // Dispatch an event so components know to refetch or sync
      window.dispatchEvent(new CustomEvent("api-network-restored"));
    };

    const handleApiError = () => {
      setIsOffline(true);
      setShowModal(true);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    window.addEventListener("api-network-error", handleApiError);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("api-network-error", handleApiError);
    };
  }, []);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md transition-opacity duration-300"
      />
      <div className="relative bg-white dark:bg-zinc-900 border border-orange-100 dark:border-orange-950/30 rounded-2xl max-w-md w-full shadow-2xl p-8 text-center overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full border-2 mb-6 transition-colors duration-300 ${isOffline ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/20 animate-pulse' : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/20'}`}>
          {isOffline ? (
            <WifiOff className="h-8 w-8 text-orange-500 dark:text-orange-400" />
          ) : (
            <Wifi className="h-8 w-8 text-emerald-500 dark:text-emerald-400" />
          )}
        </div>

        <h3 className="text-xl font-bold text-gray-950 dark:text-white tracking-tight mb-2">
          {isOffline ? "Connection Lost" : "Back Online"}
        </h3>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
          {isOffline 
            ? "We couldn't connect to the server. Your recent data is cached locally. We will automatically catch up once the connection is restored."
            : "Your connection has been restored. Everything is syncing up."}
        </p>

        {isOffline && (
          <Button
            type="button"
            onClick={() => setShowModal(false)}
            className="w-full py-6 text-base font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/10 dark:shadow-none transition-all duration-200"
          >
            Acknowledge
          </Button>
        )}
      </div>
    </div>
  );
}
