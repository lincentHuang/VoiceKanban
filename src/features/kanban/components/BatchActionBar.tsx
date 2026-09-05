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
  RotateCcw,
} from "lucide-react";
import confetti from "canvas-confetti";

export const BatchActionBar: React.FC = () => {
  const {
    isMultiSelectMode,
    selectedTaskIds,
    clearSelection,
    batchMoveTasks,
    batchDeleteTasks,
    batchToggleComplete,
    batchSetPriority,
    setIsMultiSelectMode,
    getActiveBoardColumns,
    selectAllTasksInBoard,
  } = useKanbanStore();

  const [isMoveMenuOpen, setIsMoveMenuOpen] = useState(false);
  const [isPriorityMenuOpen, setIsPriorityMenuOpen] = useState(false);
  const [isBatchDeleteConfirm, setIsBatchDeleteConfirm] = useState(false);

  const hasSelection = selectedTaskIds.length > 0;
  const isVisible = isMultiSelectMode || hasSelection;

  useEscapeKey(() => {
    if (isBatchDeleteConfirm) {
      setIsBatchDeleteConfirm(false);
    } else if (isMoveMenuOpen) {
      setIsMoveMenuOpen(false);
    } else if (isPriorityMenuOpen) {
      setIsPriorityMenuOpen(false);
    } else if (hasSelection) {
      clearSelection();
    } else if (isMultiSelectMode) {
      setIsMultiSelectMode(false);
    }
  }, isVisible);

  if (!isVisible) return null;

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
    <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-40 w-full max-w-[calc(100vw-1.25rem)] sm:max-w-2xl px-1 sm:px-4 animate-in slide-in-from-bottom-3 duration-200 pointer-events-auto">
      <div className="backdrop-blur-2xl bg-slate-900/95 dark:bg-slate-900/98 text-white border border-slate-700/80 shadow-2xl rounded-2xl sm:rounded-full p-2.5 sm:px-5 sm:py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
        {/* Row 1 on mobile: Selection Count & Quick Exit */}
        <div className="flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full font-bold text-[10px] sm:text-xs flex items-center justify-center transition-colors shrink-0 ${
                hasSelection ? "bg-orange-500 text-white shadow-xs" : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}
            >
              {selectedTaskIds.length}
            </div>
            <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">
              已選 {selectedTaskIds.length} 項
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

          {/* Mobile-only Exit Button (Row 1 Right) */}
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

        {/* Row 2 on mobile: Action Buttons */}
        <div className="flex items-center justify-between sm:justify-end gap-1 sm:gap-1.5 w-full sm:w-auto pt-1.5 sm:pt-0 border-t border-slate-800/80 sm:border-t-0">
          {/* Move to Column */}
          <div className="relative">
            <button
              disabled={!hasSelection}
              onClick={() => {
                setIsMoveMenuOpen(!isMoveMenuOpen);
                setIsPriorityMenuOpen(false);
              }}
              className="flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl sm:rounded-full bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer disabled:cursor-not-allowed whitespace-nowrap shrink-0"
            >
              <span>移動至</span>
              <ChevronUp className="w-3 h-3 text-slate-400" />
            </button>

            {isMoveMenuOpen && hasSelection && (
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

          {/* Priority */}
          <div className="relative">
            <button
              disabled={!hasSelection}
              onClick={() => {
                setIsPriorityMenuOpen(!isPriorityMenuOpen);
                setIsMoveMenuOpen(false);
              }}
              className="flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl sm:rounded-full bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer disabled:cursor-not-allowed whitespace-nowrap shrink-0"
            >
              <Flag className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="inline-block">優先級</span>
              <ChevronUp className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {isPriorityMenuOpen && hasSelection && (
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
                      className="w-full text-left px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      {p === "high" ? "🔴 高優先" : p === "medium" ? "🟡 中優先" : "🟢 低優先"}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Mark Uncompleted */}
          <button
            disabled={!hasSelection}
            onClick={() => handleBatchComplete(false)}
            className="flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl sm:rounded-full bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700/80 transition-colors cursor-pointer disabled:cursor-not-allowed whitespace-nowrap shrink-0"
            title="批次標記為未完成"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline-block">未完成</span>
          </button>

          {/* Mark Done */}
          <button
            disabled={!hasSelection}
            onClick={() => handleBatchComplete(true)}
            className="flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl sm:rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed whitespace-nowrap shrink-0"
            title="批次標記為已完成"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="inline-block">完成</span>
          </button>

          {/* Batch Delete */}
          <button
            disabled={!hasSelection}
            onClick={() => setIsBatchDeleteConfirm(true)}
            className="p-2 rounded-xl sm:rounded-full bg-slate-800 hover:bg-rose-600 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
            title="批次刪除選取任務"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Desktop-only Cancel Selection / Exit Multi-Select Mode */}
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
        </div>
      </div>

      {/* Batch Delete Confirmation Modal */}
      {isBatchDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 pointer-events-auto"
          onClick={() => setIsBatchDeleteConfirm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-2xl shadow-2xl p-5 space-y-3 animate-in zoom-in-95 duration-150 text-slate-800 dark:text-slate-100"
          >
            <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 font-bold text-base">
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <span>確定批次刪除任務？</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              確定要刪除選取的 <span className="font-bold text-rose-600 dark:text-rose-400">{selectedTaskIds.length}</span> 項任務嗎？刪除後將無法復原所有待辦紀錄。
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  batchDeleteTasks();
                  setIsBatchDeleteConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
              >
                確認刪除 ({selectedTaskIds.length})
              </button>
              <button
                type="button"
                onClick={() => setIsBatchDeleteConfirm(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-98 transition-all cursor-pointer"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
