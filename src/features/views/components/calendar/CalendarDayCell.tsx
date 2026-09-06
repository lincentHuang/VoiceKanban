"use client";

import React from "react";
import { Task } from "@/core/types/task";
import { CalendarDay } from "@/core/utils/calendar";

interface CalendarDayCellProps {
  dayCell: CalendarDay;
  cellTasks: Task[];
  onSelectTask: (id: string) => void;
  onQuickAdd: (dateStr: string) => void;
}

export const CalendarDayCell: React.FC<CalendarDayCellProps> = ({
  dayCell,
  cellTasks,
  onSelectTask,
  onQuickAdd,
}) => {
  return (
    <div
      className={`min-h-[110px] p-2 flex flex-col justify-between group transition-colors relative ${
        !dayCell.isCurrentMonth
          ? "bg-slate-50/40 dark:bg-slate-900/30 opacity-45"
          : "bg-white/40 dark:bg-slate-900/40 hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
      } ${dayCell.isToday ? "border-2 border-orange-500/80 bg-orange-50/20" : ""}`}
    >
      <div className="flex items-center justify-between mb-1">
        <span
          className={`text-xs font-bold px-1.5 py-0.5 rounded-lg ${
            dayCell.isToday
              ? "bg-orange-500 text-white shadow-xs"
              : dayCell.isCurrentMonth
              ? "text-slate-700 dark:text-slate-200"
              : "text-slate-400"
          }`}
        >
          {dayCell.dayNumber}日
        </span>

        {cellTasks.length > 0 && (
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {cellTasks.length}
          </span>
        )}
      </div>

      <div className="space-y-1 my-1 overflow-y-auto max-h-[85px] custom-scrollbar">
        {cellTasks.map((task) => (
          <div
            key={task.id}
            onClick={(e) => {
              e.stopPropagation();
              onSelectTask(task.id);
            }}
            className={`p-1.5 rounded-xl border text-xs shadow-2xs hover:shadow-xs transition-all cursor-pointer truncate ${
              task.completed
                ? "bg-slate-100 border-slate-200 text-slate-400 line-through"
                : "bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-orange-400"
            }`}
            title={task.title}
          >
            <div className="flex items-center gap-1">
              {task.coverColor ? (
                <span
                  style={{ backgroundColor: task.coverColor }}
                  className="w-2 h-2 rounded-full shrink-0"
                />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
              )}
              <span className="truncate font-medium text-[11px]">{task.title}</span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => onQuickAdd(dayCell.dateStr)}
        className="opacity-0 group-hover:opacity-100 mt-auto w-full py-0.5 text-center text-[10px] font-semibold text-slate-500 hover:text-orange-600 hover:bg-white dark:hover:bg-slate-700 rounded transition-all border border-slate-200/80 dark:border-slate-700 cursor-pointer"
      >
        + 新增
      </button>
    </div>
  );
};
