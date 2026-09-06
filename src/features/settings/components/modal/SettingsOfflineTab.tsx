"use client";

import React from "react";
import { WifiOff, Cloud, Check } from "lucide-react";
import { ManualOfflineToggle } from "@/features/offline";

interface SettingsOfflineTabProps {
  onClose: () => void;
}

export const SettingsOfflineTab: React.FC<SettingsOfflineTabProps> = ({ onClose }) => {
  return (
    <div className="mt-4 space-y-4">
      <ManualOfflineToggle variant="settings" />

      <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/60 space-y-2">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-amber-600" />
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Local-First 本機優先架構
          </h4>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
          即使處於完全無網路（飛航模式、地下室）或手動離線狀態下，您仍可自由建立、拖曳排序、編輯與刪除任何看板任務。所有操作均會即時儲存至本地快取，並在網路恢復時自動無縫同步至雲端。
        </p>
      </div>

      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Cloud className="w-4 h-4 text-slate-400" />
          <span className="text-slate-600 dark:text-slate-300 font-medium">PWA Service Worker 快取</span>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
          <Check className="w-3 h-3" />
          <span>已就緒 (v2)</span>
        </span>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
        >
          完成
        </button>
      </div>
    </div>
  );
};
