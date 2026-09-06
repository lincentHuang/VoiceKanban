"use client";

import React from "react";
import { Task } from "@/core/types/task";
import { isoToDateTimeLocal, getDueDateStatus } from "@/core/utils/dateUtils";
import { Calendar } from "lucide-react";

interface TableRowDueDateProps {
  task: Task;
}

export const TableRowDueDate: React.FC<TableRowDueDateProps> = ({ task }) => {
  if (!task.dueDate && !task.startDate) {
    return <span className="text-slate-400 italic">無</span>;
  }

  const dueDateStatus = getDueDateStatus(task.dueDate, task.completed, task.isAllDay, task.startDate);
  const formatted = dueDateStatus?.formattedFullDateTime ||
    (task.dueDate ? isoToDateTimeLocal(task.dueDate).slice(5).replace("T", " ") : "");

  return (
    <div className="flex items-center gap-1">
      <Calendar className="w-3 h-3 text-slate-400" />
      <span className="text-xs">{formatted}</span>
    </div>
  );
};
