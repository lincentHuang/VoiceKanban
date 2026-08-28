"use client";

import React, { useState } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { DEFAULT_COLUMNS, ColumnId, Priority } from "@/core/types/task";
import { useEscapeKey } from "@/core/hooks/useEscapeKey";
import {
  CheckSquare,
  ArrowRight,
  CheckCircle2,
  Trash2,
  X,
  Flag,
  ChevronUp,
} from "lucide-react";
import confetti from "canvas-confetti";

export const BatchActionBar: React.FC = () => {
  const {
    selectedTaskIds,
    clearSelection,
    batchMoveTasks,
    batchDeleteTasks,
    batchToggleComplete,
    batchSetPriority,
    setIsMultiSelectMode,
    getActiveBoardColumns,
  } = useKanbanStore();

  const [isMoveMenuOpen, setIsMoveMenuOpen] = useState(false);
  const [isPriorityMenuOpen, setIsPriorityMenuOpen] = useState(false);

  useEscapeKey(() => {
    if (isMoveMenuOpen) {
      setIsMoveMenuOpen(false);
    } else if (isPriorityMenuOpen) {
      setIsPriorityMenuOpen(false);
    } else if (selectedTaskIds.length > 0) {
      clearSelection();
    }
  }, selectedTaskIds.length > 0);

  if (selectedTaskIds.length === 0) return null;

  const boardColumns = getActiveBoardColumns();
  const allTargetColumns = [
    { id: "inbox", title: "收件匣", icon: "📥" },
    ...(boardColumns && boardColumns.length > 0 ? boardColumns : DEFAULT_COLUMNS),
  ];

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
    <div className="fixed bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-[calc(100vw-1rem)] sm:max-w-2xl px-1.5 sm:px-4 animate-in slide-in-from-bottom-5 duration-200">
      <div className="backdrop-blur-2xl bg-slate-900/95 dark:bg-slate-900/98 text-white border border-slate-700/80 shadow-2xl rounded-full px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-3">
        {/* Left Count */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-orange-500 text-white font-bold text-[10px] sm:text-xs flex items-center justify-center">
            {selectedTaskIds.length}
          </div>
          <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">
            已選 {selectedTaskIds.length} 項
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Move to Column */}
          <div className="relative">
            <button
              onClick={() => {
                setIsMoveMenuOpen(!isMoveMenuOpen);
                setIsPriorityMenuOpen(false);
              }}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              <span>移動至</span>
              <ChevronUp className="w-3 h-3 text-slate-400" />
            </button>

            {isMoveMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMoveMenuOpen(false)}
                />
                <div className="absolute bottom-full left-0 mb-2 w-44 backdrop-blur-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase">目標欄位</div>
                  {allTargetColumns.map((col) => (
                    <button
                      key={col.id}
                      onClick={() => {
                        batchMoveTasks(col.id);
                        setIsMoveMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <span>{col.icon}</span>
                      <span>{col.title}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Priority */}
          <div className="relative">
            <button
              onClick={() => {
                setIsPriorityMenuOpen(!isPriorityMenuOpen);
                setIsMoveMenuOpen(false);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              <Flag className="w-3 h-3 text-slate-400" />
              <span className="hidden sm:inline-block">優先級</span>
              <ChevronUp className="w-3 h-3 text-slate-400" />
            </button>

            {isPriorityMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsPriorityMenuOpen(false)}
                />
                <div className="absolute bottom-full left-0 mb-2 w-36 backdrop-blur-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  {(["high", "medium", "low"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        batchSetPriority(p);
                        setIsPriorityMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      {p === "high" ? "🔴 高優先" : p === "medium" ? "🟡 中優先" : "🟢 低優先"}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Mark Done */}
          <button
            onClick={() => handleBatchComplete(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
            title="批次標記為已完成"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline-block">完成</span>
          </button>

          {/* Batch Delete */}
          <button
            onClick={() => {
              if (window.confirm(`確定要刪除選取的 ${selectedTaskIds.length} 項任務嗎？`)) {
                batchDeleteTasks();
              }
            }}
            className="p-2 rounded-full bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors"
            title="批次刪除選取任務"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Cancel Selection */}
          <button
            onClick={() => {
              clearSelection();
              setIsMultiSelectMode(false);
            }}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors ml-1"
            title="取消多選"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
