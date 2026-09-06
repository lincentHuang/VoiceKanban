"use client";

import React from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Board } from "@/core/types/task";

interface ColumnManagerHeaderProps {
  activeBoard: Board | undefined;
  onClose: () => void;
}

export const ColumnManagerHeader: React.FC<ColumnManagerHeaderProps> = ({
  activeBoard,
  onClose,
}) => {
  return (
    <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600">
          <SlidersHorizontal className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            狀態流程管理 (Workflow)
          </h3>
          <p className="text-xs text-slate-500">
            看板「{activeBoard?.name}」的欄位拖曳排序、增減與命名
          </p>
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
