import React from "react";
import { CheckSquare, Square, Star, CheckSquare2, Calendar, CheckCircle2 } from "lucide-react";
import { Task } from "@/core/types/task";
import { getDueDateStatus } from "@/core/utils/dateUtils";

interface Props {
  task: Task;
  isSelected: boolean;
  isMultiSelectMode: boolean;
  inboxWidth: number;
  onSelect: () => void;
  onToggleComplete: (e: React.MouseEvent) => void;
}

export const TaskCardRowVariant: React.FC<Props> = ({
  task, isSelected, isMultiSelectMode, inboxWidth, onSelect, onToggleComplete,
}) => {
  const isSmallRow = inboxWidth < 520;
  const isMediumRow = inboxWidth >= 520 && inboxWidth < 650;
  const isLargeRow = inboxWidth >= 650;

  const totalChecklist = task.checklist ? task.checklist.length : 0;
  const completedChecklist = task.checklist ? task.checklist.filter((i) => i.completed).length : 0;
  const isChecklistAllDone = totalChecklist > 0 && totalChecklist === completedChecklist;
  const dueDateStatus = getDueDateStatus(task.dueDate, task.completed, task.isAllDay, task.startDate);
  const hasTags = task.tags && task.tags.length > 0;

  return (
    <div className="flex items-center gap-2 w-full">
      {task.coverColor && !task.coverColor.startsWith("data:image") && (
        <div style={{ backgroundColor: task.coverColor }} className="w-1.5 self-stretch rounded-full shrink-0 my-0.5" />
      )}

      {isMultiSelectMode && (
        <button type="button" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onSelect(); }} className="text-orange-600 dark:text-orange-400 p-0.5 shrink-0">
          {isSelected ? <CheckSquare className="w-4 h-4 fill-orange-500 text-white" /> : <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />}
        </button>
      )}

      <div className="flex items-center gap-2 min-w-0 flex-1">
        {task.isStarred && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />}
        <h4 style={{ minWidth: "100px" }} className={`text-[16px] sm:text-xs font-semibold text-slate-800 dark:text-slate-100 truncate flex-1 min-w-[100px] ${task.completed ? "line-through text-slate-400 dark:text-slate-500" : ""}`}>
          {task.title}
        </h4>
        {hasTags && (isMediumRow || isLargeRow) && (
          <div className="flex items-center gap-1 shrink-0">
            {(isLargeRow ? task.tags : task.tags.slice(0, 1)).map((tag) => (
              <span key={tag} className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium">#{tag}</span>
            ))}
            {isMediumRow && task.tags.length > 1 && <span className="text-[10px] text-slate-400 font-medium">+{task.tags.length - 1}</span>}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 text-[11px] text-slate-400">
        {totalChecklist > 0 && !isSmallRow && (
          <span className={`inline-flex items-center gap-1 font-medium px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0 ${isChecklistAllDone ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`} title={`子任務: ${completedChecklist}/${totalChecklist}`}>
            <CheckSquare2 className="w-3 h-3 shrink-0" />
            <span className="whitespace-nowrap">{completedChecklist}/{totalChecklist}</span>
          </span>
        )}
        {dueDateStatus && isLargeRow && (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap shrink-0 ${dueDateStatus.badgeClasses.cardBadge}`} title={`到期時間: ${dueDateStatus.formattedFullDateTime}`}>
            <Calendar className={`w-3 h-3 shrink-0 ${dueDateStatus.badgeClasses.iconColor}`} />
            <span className={`whitespace-nowrap ${dueDateStatus.badgeClasses.cardText}`}>{dueDateStatus.formattedDateOnly}</span>
          </span>
        )}
        <button type="button" onPointerDown={(e) => e.stopPropagation()} onClick={onToggleComplete} className={`p-1 rounded-lg transition-colors ${task.completed ? "bg-emerald-100 text-emerald-700" : "hover:bg-emerald-50 text-slate-400 hover:text-emerald-600"}`} title="標記完成">
          <CheckCircle2 className={`w-3.5 h-3.5 ${task.completed ? "fill-emerald-500 text-white" : ""}`} />
        </button>
      </div>
    </div>
  );
};
