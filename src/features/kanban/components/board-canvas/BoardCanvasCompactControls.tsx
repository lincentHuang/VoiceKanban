import React from "react";
import { CheckSquare, Filter, MoreHorizontal, Star, Check, SlidersHorizontal } from "lucide-react";
import { ViewMode } from "@/core/types/task";
import { VIEW_CONFIG } from "./ViewModeMenu";

interface Props {
  isMultiSelectMode: boolean;
  selectedTaskCount: number;
  tagFilter: string;
  priorityFilter: string;
  allTags: string[];
  viewMode: ViewMode;
  isFilterMenuOpen: boolean;
  isMoreMenuOpen: boolean;
  onToggleMultiSelect: () => void;
  onToggleFilterMenu: () => void;
  onToggleMoreMenu: () => void;
  onSetTagFilter: (tag: string) => void;
  onTogglePriorityFilter: () => void;
  onSetViewMode: (mode: ViewMode) => void;
  onOpenColumnManager: () => void;
}

export const BoardCanvasCompactControls: React.FC<Props> = ({
  isMultiSelectMode, selectedTaskCount, tagFilter, priorityFilter, allTags, viewMode,
  isFilterMenuOpen, isMoreMenuOpen, onToggleMultiSelect, onToggleFilterMenu, onToggleMoreMenu,
  onSetTagFilter, onTogglePriorityFilter, onSetViewMode, onOpenColumnManager,
}) => {
  return (
    <div className="flex items-center gap-1">
      <button onClick={onToggleMultiSelect} className={`px-2 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${isMultiSelectMode ? "bg-orange-500 text-white font-bold" : "bg-white/10 hover:bg-white/20 text-white/90"}`} title="多選模式">
        <CheckSquare className="w-3.5 h-3.5" /><span className="text-[11px]">多選</span>
        {selectedTaskCount > 0 && <span className="w-4 h-4 rounded-full bg-white text-orange-600 text-[10px] font-black flex items-center justify-center ml-0.5">{selectedTaskCount}</span>}
      </button>

      <div className="relative">
        <button onClick={onToggleFilterMenu} className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 ${tagFilter !== "all" || priorityFilter === "high" ? "bg-orange-500 text-white font-bold" : "bg-white/10 hover:bg-white/20 text-white/90"}`} title="篩選器">
          <Filter className="w-3.5 h-3.5" />{(tagFilter !== "all" || priorityFilter === "high") && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
        </button>
        {isFilterMenuOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-52 backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-1 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>篩選選項</span>{(tagFilter !== "all" || priorityFilter === "high") && <button onClick={() => { onSetTagFilter("all"); if (priorityFilter === "high") onTogglePriorityFilter(); }} className="text-[10px] text-orange-600 font-medium hover:underline">重設</button>}
            </div>
            <button onClick={onTogglePriorityFilter} className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between mb-1.5 transition-colors ${priorityFilter === "high" ? "bg-amber-100 text-amber-800 font-bold" : "hover:bg-slate-100"}`}>
              <span className="flex items-center gap-2"><Star className={`w-3.5 h-3.5 ${priorityFilter === "high" ? "fill-amber-500 text-amber-500" : ""}`} /><span>僅看重要卡片</span></span>{priorityFilter === "high" && <Check className="w-3.5 h-3.5 text-amber-600" />}
            </button>
            <div className="border-t border-slate-100 pt-1.5 max-h-36 overflow-y-auto custom-scrollbar space-y-0.5">
              <button onClick={() => onSetTagFilter("all")} className={`w-full text-left px-2.5 py-1 rounded-lg text-xs flex items-center justify-between ${tagFilter === "all" ? "text-orange-600 font-bold bg-orange-50" : "hover:bg-slate-100"}`}><span>全部標籤</span>{tagFilter === "all" && <Check className="w-3 h-3 text-orange-600" />}</button>
              {allTags.map((tag) => (
                <button key={tag} onClick={() => onSetTagFilter(tag === tagFilter ? "all" : tag)} className={`w-full text-left px-2.5 py-1 rounded-lg text-xs flex items-center justify-between ${tagFilter === tag ? "text-orange-600 font-bold bg-orange-50" : "hover:bg-slate-100"}`}><span>#{tag}</span>{tagFilter === tag && <Check className="w-3 h-3 text-orange-600" />}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <button onClick={onToggleMoreMenu} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 transition-colors" title="選單"><MoreHorizontal className="w-3.5 h-3.5" /></button>
        {isMoreMenuOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-52 backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-1">
            <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">檢視模式</div>
            {(["kanban", "calendar"] as const).map((m) => (
              <button key={m} onClick={() => onSetViewMode(m)} className={`w-full text-left px-2.5 py-1.5 rounded-xl flex items-center justify-between text-xs hover:bg-slate-100 ${viewMode === m ? "text-orange-600 font-bold bg-orange-50/50" : ""}`}>
                <span className="flex items-center gap-2">{VIEW_CONFIG[m].icon}<span>{VIEW_CONFIG[m].label}模式</span></span>{viewMode === m && <Check className="w-3.5 h-3.5 text-orange-600" />}
              </button>
            ))}
            <div className="border-t border-slate-100 my-1 pt-1">
              <button onClick={onOpenColumnManager} className="w-full text-left px-2.5 py-1.5 rounded-xl flex items-center gap-2 text-xs hover:bg-slate-100"><SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" /><span>自訂流程欄位</span></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
