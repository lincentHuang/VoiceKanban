"use client";

import React from "react";
import { Trash2 } from "lucide-react";

interface Props {
  totalCount: number;
  onClearAll: () => void;
}

export const NotificationPopoverFooter: React.FC<Props> = ({
  totalCount,
  onClearAll,
}) => {
  if (totalCount === 0) return null;

  return (
    <div className="p-2.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between shrink-0">
      <span className="text-[10px] text-slate-600 dark:text-slate-300 pl-1">
        保留最新 {Math.min(totalCount, 50)} 則動態
      </span>
      <button
        type="button"
        onClick={onClearAll}
        className="text-[11px] font-bold text-rose-500 hover:text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
      >
        <Trash2 className="w-3.5 h-3.5" />
        清空所有通知
      </button>
    </div>
  );
};
