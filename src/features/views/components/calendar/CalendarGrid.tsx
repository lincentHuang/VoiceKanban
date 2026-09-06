"use client";

import React from "react";
import { Task } from "@/core/types/task";
import { CalendarDay } from "@/core/utils/calendar";
import { isoToDateTimeLocal } from "@/core/utils/dateUtils";
import { CalendarDayCell } from "./CalendarDayCell";

interface CalendarGridProps {
  monthDays: CalendarDay[];
  boardTasks: Task[];
  onSelectTask: (id: string) => void;
  onQuickAdd: (dateStr: string) => void;
}

const WEEKDAY_NAMES = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  monthDays,
  boardTasks,
  onSelectTask,
  onQuickAdd,
}) => {
  return (
    <div className="overflow-auto flex-1 min-h-0 custom-scrollbar">
      <div className="grid grid-cols-7 border-b border-slate-200/80 dark:border-slate-800 min-w-[700px] text-center bg-slate-50/50 dark:bg-slate-800/30">
        {WEEKDAY_NAMES.map((dayName, idx) => (
          <div
            key={idx}
            className="py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 border-r border-slate-200/60 dark:border-slate-800 last:border-r-0"
          >
            {dayName}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 min-w-[700px] auto-rows-fr divide-x divide-y divide-slate-200/60 dark:divide-slate-800">
        {monthDays.map((dayCell, i) => {
          const dateKey = dayCell.dateStr;
          const cellTasks = boardTasks.filter((t) => {
            if (!t.dueDate && !t.startDate) return false;
            const startKey = t.startDate ? isoToDateTimeLocal(t.startDate).slice(0, 10) : null;
            const endKey = t.dueDate ? isoToDateTimeLocal(t.dueDate).slice(0, 10) : null;
            if (startKey && endKey) {
              return dateKey >= startKey && dateKey <= endKey;
            }
            return endKey === dateKey || startKey === dateKey;
          });

          return (
            <CalendarDayCell
              key={i}
              dayCell={dayCell}
              cellTasks={cellTasks}
              onSelectTask={onSelectTask}
              onQuickAdd={onQuickAdd}
            />
          );
        })}
      </div>
    </div>
  );
};
