"use client";

import React from "react";
import { KeyRound, X } from "lucide-react";

interface SettingsModalHeaderProps {
  onClose: () => void;
}

export const SettingsModalHeader: React.FC<SettingsModalHeaderProps> = ({ onClose }) => {
  return (
    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600">
          <KeyRound className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            系統設定 &amp; AI / 離線模式
          </h3>
          <p className="text-xs text-slate-500">管理 Gemini API Key、離線模式與本地半自動學習詞庫</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
