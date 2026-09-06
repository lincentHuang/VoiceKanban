"use client";

import React from "react";
import { Board } from "@/core/types/task";

interface Props {
  board: Board;
  taskCount: number;
  isOnlyBoard: boolean;
}

export const DeleteBoardWarningCard: React.FC<Props> = ({
  board,
  taskCount,
  isOnlyBoard,
}) => {
  return (
    <div className="mt-4 p-3.5 rounded-2xl bg-red-50/70 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50">
      <div className="text-xs text-slate-700 dark:text-slate-300 space-y-2">
        {isOnlyBoard ? (
          <p>
            「<span className="font-bold text-slate-900 dark:text-slate-100">{board.icon} {board.name}</span>」是目前系統中唯一的看板。系統必須保留至少一個看板才能正常運作，因此無法刪除。
          </p>
        ) : (
          <>
            <p>
              您即將刪除「<span className="font-bold text-slate-900 dark:text-slate-100">{board.icon} {board.name}</span>」。
            </p>
            {taskCount > 0 ? (
              <p className="text-red-600 dark:text-red-400 font-medium">
                ⚠️ 此看板內共有 <span className="font-bold">{taskCount}</span> 個任務，刪除看板將一併永久移除所屬的所有任務卡片！
              </p>
            ) : (
              <p className="text-slate-500 dark:text-slate-400">
                此看板目前沒有待辦任務。
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};
