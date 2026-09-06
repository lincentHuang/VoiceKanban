import React from "react";
import { DueDateStatus } from "@/core/utils/dateUtils";

interface Props {
  tags?: string[];
  dueDateStatus?: DueDateStatus | null;
  completed?: boolean;
}

export const TaskCardTags: React.FC<Props> = ({ tags, dueDateStatus, completed }) => {
  const hasTags = tags && tags.length > 0;
  if (!hasTags && (!dueDateStatus?.isUrgent || completed)) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-2">
      {dueDateStatus?.urgency === "overdue" && !completed && (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 shadow-2xs whitespace-nowrap shrink-0">
          🔥 逾期
        </span>
      )}
      {dueDateStatus?.urgency === "due-soon" && !completed && (
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 shadow-2xs whitespace-nowrap shrink-0">
          ⏳ 即將到期
        </span>
      )}
      {tags?.map((tag) => (
        <span
          key={tag}
          className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 whitespace-nowrap shrink-0"
        >
          #{tag}
        </span>
      ))}
    </div>
  );
};
