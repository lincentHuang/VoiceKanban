"use client";

import React from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { CloudOff, WifiOff, Cloud } from "lucide-react";

export const OfflineIndicator: React.FC = () => {
  const { isOnline, isManualOffline, pendingOfflineChanges, setIsOfflineBannerDismissed } =
    useKanbanStore();

  const isOffline = isManualOffline || !isOnline;

  if (!isOffline) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => setIsOfflineBannerDismissed(false)}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] font-bold shadow-2xs hover:bg-amber-200 dark:hover:bg-amber-900/80 transition-all cursor-pointer group"
      title="點擊展開離線詳細資訊"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
      </span>
      <span className="flex items-center gap-1">
        <CloudOff className="w-3 h-3 text-amber-600 dark:text-amber-400" />
        <span>離線工作</span>
      </span>
      {pendingOfflineChanges > 0 && (
        <span className="ml-0.5 px-1 py-0.2 rounded-md bg-amber-200 dark:bg-amber-800/80 text-[9px] font-mono font-black">
          {pendingOfflineChanges}
        </span>
      )}
    </button>
  );
};
