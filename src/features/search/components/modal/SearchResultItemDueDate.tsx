"use client";

import React from "react";
import { Clock } from "lucide-react";
import { getDueDateStatus } from "@/core/utils/dateUtils";

interface SearchResultItemDueDateProps {
  dueDate?: string | null;
  completed?: boolean;
}

export const SearchResultItemDueDate: React.FC<SearchResultItemDueDateProps> = ({
  dueDate,
  completed,
}) => {
  if (!dueDate) return null;
  const dateStatus = getDueDateStatus(dueDate, completed);
  if (!dateStatus) return null;

  return (
    <span
      className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 border ${
        dateStatus.urgency === "overdue"
          ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400"
          : dateStatus.urgency === "due-soon"
          ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400"
          : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
      }`}
    >
      <Clock className="w-3 h-3" />
      <span>{dateStatus.formattedDateOnly}</span>
    </span>
  );
};
