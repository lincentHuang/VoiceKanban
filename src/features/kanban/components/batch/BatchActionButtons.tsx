"use client";

import React from "react";
import { RotateCcw, CheckCircle2, Trash2, X } from "lucide-react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import confetti from "canvas-confetti";

interface BatchActionButtonsProps {
  hasSelection: boolean;
  onOpenDeleteConfirm: () => void;
}

export const BatchActionButtons: React.FC<BatchActionButtonsProps> = ({
  hasSelection,
  onOpenDeleteConfirm,
}) => {
  const { batchToggleComplete, clearSelection, setIsMultiSelectMode } = useKanbanStore();

  const handleBatchComplete = (completed: boolean) => {
    if (completed) {
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.85 },
          colors: ["#BEF264", "#F97316", "#10B981"],
        });
      } catch {}
    }
    batchToggleComplete(completed);
  };

  return (
    <>
      <button
        disabled={!hasSelection}
        onClick={() => handleBatchComplete(false)}
        className="flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl sm:rounded-full bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700/80 transition-colors cursor-pointer disabled:cursor-not-allowed whitespace-nowrap shrink-0"
        title="批次標記為未完成"
      >
        <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
        <span className="hidden sm:inline-block">未完成</span>
      </button>

      <button
        disabled={!hasSelection}
        onClick={() => handleBatchComplete(true)}
        className="flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl sm:rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed whitespace-nowrap shrink-0"
        title="批次標記為已完成"
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span className="inline-block">完成</span>
      </button>

      <button
        disabled={!hasSelection}
        onClick={onOpenDeleteConfirm}
        className="p-2 rounded-xl sm:rounded-full bg-slate-800 hover:bg-rose-600 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
        title="批次刪除選取任務"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => {
          clearSelection();
          setIsMultiSelectMode(false);
        }}
        className="hidden sm:flex p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors ml-0.5 cursor-pointer shrink-0"
        title="退出多選模式"
      >
        <X className="w-4 h-4" />
      </button>
    </>
  );
};
