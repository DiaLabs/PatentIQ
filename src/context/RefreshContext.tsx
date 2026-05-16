"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface RefreshContextType {
  refreshTrigger: number;
  refresh: () => void;
  isRefreshing: boolean;
  setRefreshing: (val: boolean) => void;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

export function RefreshProvider({ children }: { children: React.ReactNode }) {
  const [trigger, setTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(() => {
    setTrigger((prev) => prev + 1);
  }, []);

  return (
    <RefreshContext.Provider
      value={{
        refreshTrigger: trigger,
        refresh,
        isRefreshing,
        setRefreshing: setIsRefreshing,
      }}
    >
      {children}
    </RefreshContext.Provider>
  );
}

export function useRefresh() {
  const context = useContext(RefreshContext);
  if (!context) {
    throw new Error("useRefresh must be used within a RefreshProvider");
  }
  return context;
}
