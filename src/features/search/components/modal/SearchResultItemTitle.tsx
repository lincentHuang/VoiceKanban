"use client";

import React from "react";
import { Task } from "@/core/types/task";

interface SearchResultItemTitleProps {
  task: Task;
  colInfo: { title: string; color?: string };
}

export const SearchResultItemTitle: React.FC<SearchResultItemTitleProps> = ({
  task,
  colInfo,
}) => {
  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <span
          className={`text-sm font-medium truncate ${
            task.completed
              ? "line-through text-slate-400 dark:text-slate-500"
              : "text-slate-800 dark:text-slate-100 font-semibold"
          }`}
        >
          {task.title}
        </span>

        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0"
          style={{
            borderColor: colInfo.color ? `${colInfo.color}40` : "#e2e8f0",
            backgroundColor: colInfo.color ? `${colInfo.color}15` : "#f1f5f9",
            color: colInfo.color || "#475569",
          }}
        >
          {colInfo.title}
        </span>
      </div>

      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
        {task.tags && task.tags.length > 0 && (
          <div className="flex items-center gap-1 shrink-0">
            {task.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {task.description && (
          <span className="truncate text-[11px] text-slate-400">
            {task.description}
          </span>
        )}
      </div>
    </div>
  );
};
