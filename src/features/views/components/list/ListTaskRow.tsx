"use client";

import React from "react";
import { Task } from "@/core/types/task";
import { isoToDateTimeLocal, getDueDateStatus } from "@/core/utils/dateUtils";
import { Check, Calendar } from "lucide-react";

interface ListTaskRowProps {
  task: Task;
  onSelectTask: (id: string) => void;
  onToggleComplete: (e: React.MouseEvent, task: Task) => void;
}

export const ListTaskRow: React.FC<ListTaskRowProps> = ({
  task,
  onSelectTask,
  onToggleComplete,
}) => {
  const dueDateStatus = getDueDateStatus(task.dueDate, task.completed, task.isAllDay, task.startDate);
  const formattedDate = dueDateStatus?.formattedFullDateTime ||
    (task.dueDate ? isoToDateTimeLocal(task.dueDate).slice(5).replace("T", " ") : "");

  return (
    <div
      onClick={() => onSelectTask(task.id)}
      className={`group flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700/60 hover:shadow-card-hover transition-all cursor-pointer ${
        task.completed ? "opacity-60 bg-slate-50 dark:bg-slate-900/40" : ""
      }`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={(e) => onToggleComplete(e, task)}
          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
            task.completed
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-slate-300 dark:border-slate-600 hover:border-orange-500 bg-white dark:bg-slate-700"
          }`}
        >
          {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        <div className="min-w-0">
          <span
            className={`text-sm font-semibold text-slate-800 dark:text-slate-100 truncate block ${
              task.completed ? "line-through text-slate-400" : ""
            }`}
          >
            {task.title}
          </span>
          {task.description && (
            <p className="text-xs text-slate-400 truncate max-w-lg">
              {task.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden sm:flex items-center gap-1">
          {task.tags.map((t, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-medium"
            >
              #{t}
            </span>
          ))}
        </div>

        {(task.dueDate || task.startDate) && (
          <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 dark:bg-slate-700 px-2 py-0.5 rounded-md">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>{formattedDate}</span>
          </div>
        )}

        <span
          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
            task.priority === "high"
              ? "bg-rose-50 text-rose-600"
              : task.priority === "medium"
              ? "bg-amber-50 text-amber-600"
              : "bg-emerald-50 text-emerald-600"
          }`}
        >
          {task.priority === "high" ? "高" : task.priority === "medium" ? "中" : "低"}
        </span>
      </div>
    </div>
  );
};
