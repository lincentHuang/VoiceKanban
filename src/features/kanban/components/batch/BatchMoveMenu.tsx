"use client";

import React from "react";
import { ChevronUp } from "lucide-react";
import { Column } from "@/core/types/task";
import { useKanbanStore } from "@/core/stores/useKanbanStore";

interface TargetColumnOption {
  id: string;
  title: string;
  icon?: string;
}

interface BatchMoveMenuProps {
  hasSelection: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  targetColumns: TargetColumnOption[];
}

export const BatchMoveMenu: React.FC<BatchMoveMenuProps> = ({
  hasSelection,
  isOpen,
  setIsOpen,
  targetColumns,
}) => {
  const { batchMoveTasks } = useKanbanStore();

  return (
    <div className="relative">
      <button
        disabled={!hasSelection}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl sm:rounded-full bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer disabled:cursor-not-allowed whitespace-nowrap shrink-0"
      >
        <span>移動至</span>
        <ChevronUp className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && hasSelection && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full left-0 mb-2 w-44 backdrop-blur-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase">目標欄位</div>
            {targetColumns.map((col) => (
              <button
                key={col.id}
                onClick={() => {
                  batchMoveTasks(col.id);
                  setIsOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{col.icon}</span>
                <span>{col.title}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
