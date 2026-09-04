"use client";

import React from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { Task, Priority } from "@/core/types/task";
import { isoToDateTimeLocal, getDueDateStatus } from "@/core/utils/dateUtils";
import { Check, Calendar, Edit3, Flag, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";

export const ListView: React.FC = () => {
  const {
    tasks,
    activeBoardId,
    getActiveBoardColumns,
    toggleTaskComplete,
    setEditingTaskId,
    searchQuery,
    priorityFilter,
    tagFilter,
  } = useKanbanStore();

  const columns = getActiveBoardColumns();

  const boardTasks = tasks.filter((task) => {
    if (task.boardId !== activeBoardId) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchTag = task.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTag) return false;
    }

    if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
    if (tagFilter !== "all" && !task.tags.includes(tagFilter)) return false;

    return true;
  });

  const handleToggleComplete = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    if (!task.completed) {
      try {
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.8 },
          colors: ["#BEF264", "#F97316", "#10B981"],
        });
      } catch {}
    }
    toggleTaskComplete(task.id);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-4 space-y-6">
      {columns.map((column) => {
        const columnTasks = boardTasks.filter((t) => t.columnId === column.id);

        return (
          <div
            key={column.id}
            className="backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border border-white/70 dark:border-slate-800/70 rounded-3xl p-5 shadow-glass"
          >
            {/* Header */}
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-200/60 dark:border-slate-800/60">
              <span className="text-lg">{column.icon}</span>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                {column.title}
              </h3>
              <span className="ml-1 px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-500 font-bold text-xs shadow-2xs">
                {columnTasks.length}
              </span>
            </div>

            {/* List Table/Rows */}
            <div className="space-y-2">
              {columnTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setEditingTaskId(task.id)}
                  className={`group flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-100 dark:border-slate-700/60 hover:shadow-card-hover transition-all cursor-pointer ${
                    task.completed ? "opacity-60 bg-slate-50 dark:bg-slate-900/40" : ""
                  }`}
                >
                  {/* Left: Checkbox & Title */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      onClick={(e) => handleToggleComplete(e, task)}
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
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

                  {/* Right: Metadata Pills & Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Tags */}
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

                    {/* Due Date / Range */}
                    {(task.dueDate || task.startDate) && (
                      <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>
                          {getDueDateStatus(task.dueDate, task.completed, task.isAllDay, task.startDate)?.formattedFullDateTime ||
                            (task.dueDate ? isoToDateTimeLocal(task.dueDate).slice(5).replace("T", " ") : "")}
                        </span>
                      </div>
                    )}

                    {/* Priority */}
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
              ))}

              {columnTasks.length === 0 && (
                <div className="py-4 text-center text-xs text-slate-400 italic">
                  目前欄位尚無任務
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
