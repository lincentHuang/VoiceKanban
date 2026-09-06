"use client";

import React from "react";
import { ChecklistItem } from "@/core/types/task";
import { CheckSquare2 } from "lucide-react";

interface TableRowChecklistProps {
  checklist?: ChecklistItem[];
}

export const TableRowChecklist: React.FC<TableRowChecklistProps> = ({ checklist }) => {
  const total = checklist ? checklist.length : 0;
  const completed = checklist ? checklist.filter((i) => i.completed).length : 0;

  if (total === 0) {
    return <span className="text-slate-400 italic text-[11px]">-</span>;
  }

  const percentage = (completed / total) * 100;

  return (
    <div className="flex items-center gap-1.5">
      <CheckSquare2 className="w-3.5 h-3.5 text-slate-400" />
      <span className="font-semibold text-slate-700 dark:text-slate-300">
        {completed}/{total}
      </span>
      <div className="w-12 bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-emerald-500 h-full rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
