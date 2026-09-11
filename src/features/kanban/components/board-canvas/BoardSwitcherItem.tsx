"use client";

import React from "react";
import { Check } from "lucide-react";
import { Board } from "@/core/types/task";

interface Props {
  board: Board;
  isActive: boolean;
  onSelect: () => void;
}

export const BoardSwitcherItem: React.FC<Props> = ({ board, isActive, onSelect }) => {
  return (
    <div
      className={`relative px-2.5 py-1.5 flex items-center justify-between text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors ${
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

      {isActive && <Check className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0 ml-1" />}
    </div>
  );
};
