"use client";

import React from "react";
import { Task, Column } from "@/core/types/task";
import { ListTaskRow } from "./ListTaskRow";

interface ListColumnCardProps {
  column: Column;
  columnTasks: Task[];
  onSelectTask: (id: string) => void;
  onToggleComplete: (e: React.MouseEvent, task: Task) => void;
}

export const ListColumnCard: React.FC<ListColumnCardProps> = ({
  column,
  columnTasks,
  onSelectTask,
  onToggleComplete,
}) => {
  return (
    <div className="backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border border-white/70 dark:border-slate-800/70 rounded-3xl p-5 shadow-glass">
      <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-200/60 dark:border-slate-800/60">
        <span className="text-lg">{column.icon}</span>
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
          {column.title}
        </h3>
        <span className="ml-1 px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-500 font-bold text-xs shadow-2xs">
          {columnTasks.length}
        </span>
      </div>

      <div className="space-y-2">
        {columnTasks.map((task) => (
          <ListTaskRow
            key={task.id}
            task={task}
            onSelectTask={onSelectTask}
            onToggleComplete={onToggleComplete}
          />
        ))}

        {columnTasks.length === 0 && (
          <div className="py-4 text-center text-xs text-slate-400 italic">
            目前欄位尚無任務
          </div>
        )}
      </div>
    </div>
  );
};
