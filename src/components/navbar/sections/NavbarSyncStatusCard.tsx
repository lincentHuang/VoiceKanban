"use client";

import React from "react";
import { Cloud, CloudOff, RefreshCw, AlertCircle } from "lucide-react";
import { formatSyncTime } from "@/core/utils/dateUtils";
import { SyncState } from "@/core/types/auth";

interface NavbarSyncStatusCardProps {
  syncState: SyncState;
  currentTime: Date;
  isGuest: boolean;
  onTriggerSync: () => void;
}

export const NavbarSyncStatusCard: React.FC<NavbarSyncStatusCardProps> = ({
  syncState,
  currentTime,
  isGuest,
  onTriggerSync,
}) => {
  const formattedSync = formatSyncTime(syncState.lastSyncedAt, currentTime);

  return (
    <div
      className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs transition-all"
      title={`完整同步時間：${formattedSync.full}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="shrink-0 p-1.5 rounded-xl bg-white dark:bg-slate-700/80 shadow-2xs border border-slate-100 dark:border-slate-700/50">
            {syncState.status === "syncing" ? (
              <RefreshCw className="w-4 h-4 animate-spin text-orange-500" />
            ) : syncState.status === "offline" ? (
              <CloudOff className="w-4 h-4 text-slate-400" />
            ) : syncState.status === "error" ? (
              <AlertCircle className="w-4 h-4 text-amber-500" />
            ) : (
              <Cloud className="w-4 h-4 text-emerald-500" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                {syncState.status === "syncing"
                  ? "正在同步..."
                  : syncState.status === "offline"
                  ? "離線模式"
                  : syncState.status === "error"
                  ? "同步異常"
                  : isGuest
                  ? "本機已存檔"
                  : "雲端已同步"}
              </span>
              {syncState.status === "synced" && formattedSync.isLatest && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800 shrink-0 leading-none">
                  最新
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {syncState.status === "syncing"
                ? "正在更新雲端資料"
                : syncState.status === "offline"
                ? `${syncState.lastSyncedAt ? `上次同步於 ${formattedSync.relative}` : "離線快取中"}・連線後自動上傳`
                : syncState.status === "error"
                ? `${syncState.errorMessage || "連線異常"}・點擊重試`
                : isGuest
                ? `${formattedSync.relative}（訪客本機模式）`
                : formattedSync.isLatest
                ? "剛剛（目前為最新版本）"
                : `上次同步：${formattedSync.relative}`}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onTriggerSync}
          disabled={syncState.status === "syncing"}
          className="px-2.5 py-1 rounded-xl text-[11px] font-semibold text-orange-600 dark:text-orange-400 hover:bg-orange-100/60 dark:hover:bg-orange-950/40 active:scale-95 transition-all cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed border border-orange-200/60 dark:border-orange-900/40"
        >
          {syncState.status === "syncing" ? "同步中..." : "立即同步"}
        </button>
      </div>
    </div>
  );
};
