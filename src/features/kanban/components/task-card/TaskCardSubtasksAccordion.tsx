import React from "react";
import { CheckSquare, Square } from "lucide-react";
import { ChecklistItem } from "@/core/types/task";

interface Props {
  isSubtasksExpanded: boolean;
  totalChecklist: number;
  completedChecklist: number;
  isChecklistAllDone: boolean;
  checklist?: ChecklistItem[];
  onSubtaskToggle: (e: React.MouseEvent, itemId: string, currentCompleted: boolean) => void;
}

export const TaskCardSubtasksAccordion: React.FC<Props> = ({
  isSubtasksExpanded, totalChecklist, completedChecklist, isChecklistAllDone, checklist, onSubtaskToggle,
}) => {
  if (!isSubtasksExpanded || totalChecklist === 0) return null;

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-150"
    >
      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-0">
        <span>子任務進度</span>
        <span className={isChecklistAllDone ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}>
          {Math.round((completedChecklist / totalChecklist) * 100)}%
        </span>
      </div>
      <div className="w-full h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${isChecklistAllDone ? "bg-emerald-500" : "bg-blue-500"}`}
          style={{ width: `${(completedChecklist / totalChecklist) * 100}%` }}
        />
      </div>

      <div className="space-y-1 pt-1 max-h-48 overflow-y-auto custom-scrollbar pr-0.5">
        {checklist?.map((item) => (
          <div
            key={item.id}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => onSubtaskToggle(e, item.id, item.completed)}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors cursor-pointer group/item select-none ${
              item.completed ? "bg-slate-50/70 dark:bg-slate-900/40 text-slate-400 dark:text-slate-500" : "hover:bg-slate-100/90 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200"
            }`}
          >
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => onSubtaskToggle(e, item.id, item.completed)}
              className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shrink-0 flex items-center justify-center"
            >
              {item.completed ? <CheckSquare className="w-3.5 h-3.5 fill-emerald-500 text-white dark:fill-emerald-600 shrink-0" /> : <Square className="w-3.5 h-3.5 group-hover/item:text-emerald-500 shrink-0" />}
            </button>
            <span className={`flex-1 break-words leading-normal text-[11px] ${item.completed ? "line-through text-slate-400 dark:text-slate-500" : "font-normal text-slate-700 dark:text-slate-200"}`}>
              {item.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
