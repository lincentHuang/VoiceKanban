import React from "react";
import { ChevronDown, Check, Columns, Calendar } from "lucide-react";
import { ViewMode } from "@/core/types/task";

export const VIEW_CONFIG: Record<ViewMode, { label: string; icon: React.ReactNode }> = {
  kanban: { label: "看板", icon: <Columns className="w-3.5 h-3.5" /> },
  calendar: { label: "行事曆", icon: <Calendar className="w-3.5 h-3.5" /> },
};

interface Props {
  viewMode: ViewMode;
  isOpen: boolean;
  onToggle: () => void;
  onSelectViewMode: (mode: ViewMode) => void;
}

export const ViewModeMenu: React.FC<Props> = ({
  viewMode, isOpen, onToggle, onSelectViewMode,
}) => {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 text-xs font-semibold transition-colors cursor-pointer"
      >
        {VIEW_CONFIG[viewMode].icon}
        <span>{VIEW_CONFIG[viewMode].label}</span>
        <ChevronDown className="w-3 h-3 text-white/60" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-40 backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          {(["kanban", "calendar"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onSelectViewMode(mode)}
              className={`w-full text-left px-3 py-1.5 flex items-center justify-between text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${
                viewMode === mode ? "text-orange-600 font-bold bg-orange-50/50" : ""
              }`}
            >
              <span className="flex items-center gap-2">
                {VIEW_CONFIG[mode].icon}
                <span>{VIEW_CONFIG[mode].label}模式</span>
              </span>
              {viewMode === mode && <Check className="w-3.5 h-3.5 text-orange-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
