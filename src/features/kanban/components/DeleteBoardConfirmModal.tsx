"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { useEscapeKey } from "@/core/hooks/useEscapeKey";
import { DeleteBoardWarningCard } from "./delete-board/DeleteBoardWarningCard";
import { DeleteBoardActions } from "./delete-board/DeleteBoardActions";

export const DeleteBoardConfirmModal: React.FC = () => {
  const {
    boards,
    tasks,
    deletingBoardId,
    setDeletingBoardId,
    deleteBoard,
  } = useKanbanStore();

  const boardToDelete = boards.find((b) => b.id === deletingBoardId);
  const isOpen = !!deletingBoardId && !!boardToDelete;

  useEscapeKey(() => {
    if (isOpen) setDeletingBoardId(null);
  }, isOpen);

  if (!isOpen || !boardToDelete) return null;

  const boardTaskCount = tasks.filter((t) => t.boardId === boardToDelete.id && t.columnId !== "inbox").length;
  const isOnlyBoard = boards.length <= 1;

  const handleConfirm = () => {
    if (isOnlyBoard) {
      setDeletingBoardId(null);
      return;
    }
    deleteBoard(boardToDelete.id);
    setDeletingBoardId(null);
  };

  return (
    <div
      onClick={() => setDeletingBoardId(null)}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-200 overflow-hidden"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 border border-red-200 dark:border-red-950/60 rounded-3xl shadow-2xl p-5 sm:p-6 relative overflow-hidden"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {isOnlyBoard ? "無法刪除看板" : "確認刪除看板？"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isOnlyBoard ? "系統保護機制" : "此操作將無法復原"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDeletingBoardId(null)}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <DeleteBoardWarningCard
          board={boardToDelete}
          taskCount={boardTaskCount}
          isOnlyBoard={isOnlyBoard}
        />

        <DeleteBoardActions
          isOnlyBoard={isOnlyBoard}
          onCancel={() => setDeletingBoardId(null)}
          onConfirm={handleConfirm}
        />
      </div>
    </div>
  );
};

export default DeleteBoardConfirmModal;
