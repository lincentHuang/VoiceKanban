"use client";

import React from "react";
import { X } from "lucide-react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";

interface BatchSelectionCountProps {
  selectedCount: number;
}

export const BatchSelectionCount: React.FC<BatchSelectionCountProps> = ({ selectedCount }) => {
  const { selectAllTasksInBoard, clearSelection, setIsMultiSelectMode } = useKanbanStore();
  const hasSelection = selectedCount > 0;

  return (
    <div className="flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 w-full sm:w-auto">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div
          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full font-bold text-[10px] sm:text-xs flex items-center justify-center transition-colors shrink-0 ${
            hasSelection ? "bg-orange-500 text-white shadow-xs" : "bg-slate-800 text-slate-400 border border-slate-700"
          }`}
        >
          {selectedCount}
        </div>
        <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">
          已選 {selectedCount} 項
        </span>

        {!hasSelection && (
          <button
            onClick={selectAllTasksInBoard}
            className="ml-1 px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap"
          >
            全選看板
          </button>
        )}
      </div>

      <button
        onClick={() => {
          clearSelection();
          setIsMultiSelectMode(false);
        }}
        className="sm:hidden flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white text-xs transition-colors cursor-pointer"
        title="退出多選模式"
      >
        <span className="text-[11px] font-medium">退出多選</span>
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
