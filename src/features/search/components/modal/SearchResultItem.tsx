"use client";

import React from "react";
import { CheckCircle2, Star, ArrowRight } from "lucide-react";
import { Task } from "@/core/types/task";
import { SearchResultItemTitle } from "./SearchResultItemTitle";
import { SearchResultItemDueDate } from "./SearchResultItemDueDate";

interface SearchResultItemProps {
  task: Task;
  isSelected: boolean;
  colInfo: { title: string; color?: string };
  onSelect: () => void;
  onMouseEnter: () => void;
}

export const SearchResultItem: React.FC<SearchResultItemProps> = ({
  task,
  isSelected,
  colInfo,
  onSelect,
  onMouseEnter,
}) => {
  return (
    <div
      role="option"
      aria-selected={isSelected}
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      className={`group px-3 py-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
        isSelected
          ? "bg-orange-50/90 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800/80 shadow-xs"
          : "bg-white/60 dark:bg-slate-800/40 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/70"
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {task.completed ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
        ) : task.isStarred ? (
          <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
        ) : (
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: colInfo.color || "#f97316" }}
          />
        )}

        <SearchResultItemTitle task={task} colInfo={colInfo} />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <SearchResultItemDueDate dueDate={task.dueDate} completed={task.completed} />

        <ArrowRight
          className={`w-4 h-4 transition-transform ${
            isSelected
              ? "text-orange-500 translate-x-0.5"
              : "text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100"
          }`}
        />
      </div>
    </div>
  );
};
