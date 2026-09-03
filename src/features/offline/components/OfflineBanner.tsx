"use client";

import React from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { WifiOff, RefreshCw, X, CloudOff, ArrowRight, ShieldCheck } from "lucide-react";

export const OfflineBanner: React.FC = () => {
  const {
    isOnline,
    isManualOffline,
    setIsManualOffline,
    pendingOfflineChanges,
    isOfflineBannerDismissed,
    setIsOfflineBannerDismissed,
    triggerSync,
    syncState,
  } = useKanbanStore();

  const isOffline = isManualOffline || !isOnline;

  if (!isOffline || isOfflineBannerDismissed) {
    return null;
  }

  const handleRetryOrReconnect = async () => {
    if (isManualOffline) {
      setIsManualOffline(false);
    } else {
      await triggerSync();
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full bg-gradient-to-r from-amber-500/90 via-orange-500/90 to-amber-600/90 dark:from-amber-900/90 dark:via-orange-950/90 dark:to-amber-950/90 backdrop-blur-md text-white px-3 sm:px-4 py-2 shadow-sm border-b border-white/20 transition-all duration-300 ease-in-out z-40 relative flex items-center justify-between gap-3 text-xs"
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="p-1 rounded-lg bg-white/20 dark:bg-black/20 shrink-0">
          {isManualOffline ? (
            <CloudOff className="w-4 h-4 text-white" />
          ) : (
            <WifiOff className="w-4 h-4 text-white animate-pulse" />
          )}
        </div>

        <div className="min-w-0 flex items-center flex-wrap gap-x-2 gap-y-0.5">
          <span className="font-bold tracking-tight">
            {isManualOffline ? "已開啟離線工作模式" : "目前處於離線狀態"}
          </span>
          <span className="text-white/90 hidden sm:inline text-[11px]">
            所有修改已安全暫存本機，連線後自動同步
          </span>

          {pendingOfflineChanges > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/25 text-[10px] font-mono font-bold tracking-wide">
              <span>{pendingOfflineChanges} 筆變更待同步</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleRetryOrReconnect}
          disabled={syncState.status === "syncing"}
          className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 active:scale-95 text-white font-semibold text-[11px] transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
        >
          {syncState.status === "syncing" ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <RefreshCw className="w-3 h-3" />
          )}
          <span>{isManualOffline ? "切換連線" : "重試連線"}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsOfflineBannerDismissed(true)}
          className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          aria-label="關閉提示"
          title="暫時關閉提示"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
