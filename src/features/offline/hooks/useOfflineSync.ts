"use client";

import { useEffect } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";

export function useOfflineSync() {
  const {
    isOnline,
    isManualOffline,
    pendingOfflineChanges,
    syncState,
    triggerSync,
    setIsManualOffline,
    setIsOnline,
  } = useKanbanStore();

  const isOffline = isManualOffline || !isOnline;

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      }
    };
  }, [setIsOnline]);

  return {
    isOffline,
    isOnline,
    isManualOffline,
    pendingOfflineChanges,
    syncState,
    triggerSync,
    setIsManualOffline,
  };
}
