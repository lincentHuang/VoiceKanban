"use client";

import React from "react";
import { Check, X } from "lucide-react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";

interface InboxMultiSelectBarProps {
  selectedCount: number;
}

export const InboxMultiSelectBar: React.FC<InboxMultiSelectBarProps> = ({
  selectedCount,
}) => {
  const {
    isMultiSelectMode,
    setIsMultiSelectMode,
    selectAllTasksInInbox,
    clearSelection,
  } = useKanbanStore();

  if (!isMultiSelectMode) return null;

  return (
    <div className="mt-2 px-2.5 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50 flex items-center justify-between text-xs animate-in fade-in duration-150 shrink-0">
      <span className="font-semibold text-orange-800 dark:text-orange-300 flex items-center gap-1.5">
        <Check className="w-3.5 h-3.5 text-orange-600" />
        <span>已選取 {selectedCount} 項</span>
      </span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={selectAllTasksInInbox}
          className="px-2 py-0.5 rounded-lg bg-orange-100 dark:bg-orange-900/60 text-orange-700 dark:text-orange-200 font-bold hover:bg-orange-200 text-[11px] cursor-pointer"
        >
          全選收件匣
        </button>
        <button
          onClick={() => {
            clearSelection();
            setIsMultiSelectMode(false);
          }}
          className="p-0.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
          title="關閉多選"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
