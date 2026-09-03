"use client";

import React from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { CloudOff, Cloud, Check } from "lucide-react";

interface ManualOfflineToggleProps {
  variant?: "settings" | "menu" | "compact";
}

export const ManualOfflineToggle: React.FC<ManualOfflineToggleProps> = ({
  variant = "settings",
}) => {
  const { isManualOffline, setIsManualOffline, isOnline, pendingOfflineChanges } =
    useKanbanStore();

  const handleToggle = () => {
    setIsManualOffline(!isManualOffline);
  };

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
          isManualOffline
            ? "bg-amber-100 dark:bg-amber-950/80 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300"
            : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
        }`}
      >
        {isManualOffline ? (
          <CloudOff className="w-3.5 h-3.5 text-amber-600" />
        ) : (
          <Cloud className="w-3.5 h-3.5 text-emerald-500" />
        )}
        <span>{isManualOffline ? "已啟動離線" : "在線模式"}</span>
      </button>
    );
  }

  return (
    <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={`p-2 rounded-xl transition-colors ${
            isManualOffline
              ? "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400"
              : "bg-slate-100 dark:bg-slate-700 text-slate-500"
          }`}
        >
          {isManualOffline ? <CloudOff className="w-4 h-4" /> : <Cloud className="w-4 h-4" />}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <span>離線工作模式 (Offline Mode)</span>
            {isManualOffline && (
              <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                已啟用
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {isManualOffline
              ? "純本機作業中，無網路請求，修改皆暫存本機。"
              : "自動連線同步，若斷網將自動平滑切換本機作業。"}
          </p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={isManualOffline}
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
          isManualOffline ? "bg-amber-500" : "bg-slate-200 dark:bg-slate-700"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
            isManualOffline ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
};
