"use client";

import React from "react";
import { Check, Pencil, Trash2 } from "lucide-react";
import { Board } from "@/core/types/task";

interface Props {
  board: Board;
  isActive: boolean;
  canDelete: boolean;
  onSelect: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const BoardSwitcherItem: React.FC<Props> = ({
  board,
  isActive,
  canDelete,
  onSelect,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      className={`group relative px-2.5 py-1.5 flex items-center justify-between text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors ${
        isActive
          ? "text-orange-600 dark:text-orange-400 font-bold bg-orange-50/60 dark:bg-orange-950/30"
          : ""
      }`}
      onClick={onSelect}
    >
      <span className="flex items-center gap-2 min-w-0 pr-2">
        <span className="shrink-0">{board.icon || "📌"}</span>
        <span className="truncate max-w-[120px]">{board.name}</span>
        {board.isShared && (
          <span className="px-1.5 py-0.2 rounded text-[10px] bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 font-bold shrink-0">
            👥 協作
          </span>
        )}
      </span>

      <div className="flex items-center gap-1 shrink-0">
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
          <button
            type="button"
            onClick={onEdit}
            title="編輯看板"
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <Pencil className="w-3 h-3" />
          </button>

          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              title="刪除看板"
              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-950 text-slate-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>

        {isActive && (
          <Check className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0 ml-1" />
        )}
      </div>
    </div>
  );
};
