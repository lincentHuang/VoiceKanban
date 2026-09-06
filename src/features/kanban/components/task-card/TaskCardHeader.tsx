import React from "react";
import { CheckSquare, Square, CheckCircle2 } from "lucide-react";

interface Props {
  title: string;
  completed?: boolean;
  isSelected: boolean;
  isMultiSelectMode: boolean;
  onSelect: () => void;
  onToggleComplete: (e: React.MouseEvent) => void;
}

export const TaskCardHeader: React.FC<Props> = ({
  title, completed, isSelected, isMultiSelectMode, onSelect, onToggleComplete,
}) => {
  return (
    <div className="flex items-start justify-between gap-2 min-h-[25px]">
      {isMultiSelectMode && (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className="text-orange-600 h-[25px] dark:text-orange-400 p-0.5 shrink-0 flex items-center justify-center self-start"
        >
          {isSelected ? <CheckSquare className="w-4 h-4 fill-orange-500 text-white" /> : <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />}
        </button>
      )}

      <div className="flex-1 min-w-0 flex items-center min-h-[25px]">
        <h4 style={{ minWidth: "100px" }} className={`text-[16px] sm:text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug break-words flex items-center min-h-[25px] ${completed ? "line-through text-slate-400 dark:text-slate-500" : ""}`}>
          {title}
        </h4>
      </div>

      <div className="flex items-start gap-1 shrink-0 self-start">
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onToggleComplete}
          className={`p-1 rounded-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
            completed
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-500/20"
              : "text-slate-300 dark:text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
          }`}
          title={completed ? "標記為未完成" : "快速標記完成"}
        >
          <CheckCircle2 className={`w-4 h-4 transition-transform ${completed ? "fill-emerald-500 text-white" : ""}`} />
        </button>
      </div>
    </div>
  );
};
