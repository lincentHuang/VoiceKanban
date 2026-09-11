"use client";

import React from "react";
import { LayoutGrid, X, Users } from "lucide-react";
import { Board } from "@/core/types/task";

interface BoardManagerHeaderProps {
  activeBoard: Board | undefined;
  onClose: () => void;
}

export const BoardManagerHeader: React.FC<BoardManagerHeaderProps> = ({ activeBoard, onClose }) => {
  return (
    <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 shrink-0">
          <LayoutGrid className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">看板管理</h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 min-w-0">
            <span className="shrink-0">{activeBoard?.icon || "📌"}</span>
            <span className="truncate">{activeBoard?.name || "看板"}</span>
            {activeBoard?.isShared && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 font-bold shrink-0">
                <Users className="w-2.5 h-2.5" />
                共享中
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer shrink-0"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
