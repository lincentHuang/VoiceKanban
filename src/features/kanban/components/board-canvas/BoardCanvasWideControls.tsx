import React, { useRef } from "react";
import { Tag, Star, CheckSquare, LayoutGrid, Check } from "lucide-react";
import { useClickOutside } from "@/core/hooks/useClickOutside";

interface Props {
  tagFilter: string;
  priorityFilter: string;
  isMultiSelectMode: boolean;
  selectedTaskCount: number;
  allTags: string[];
  totalTaskCount: number;
  isTagMenuOpen: boolean;
  onToggleTagMenu: () => void;
  onCloseTagMenu: () => void;
  onSetTagFilter: (tag: string) => void;
  onTogglePriorityFilter: () => void;
  onToggleMultiSelect: () => void;
  onOpenBoardManager: () => void;
}

export const BoardCanvasWideControls: React.FC<Props> = ({
  tagFilter, priorityFilter, isMultiSelectMode, selectedTaskCount, allTags, totalTaskCount,
  isTagMenuOpen, onToggleTagMenu, onCloseTagMenu, onSetTagFilter, onTogglePriorityFilter, onToggleMultiSelect, onOpenBoardManager,
}) => {
  const tagMenuRef = useRef<HTMLDivElement>(null);
  useClickOutside(tagMenuRef, onCloseTagMenu, isTagMenuOpen);

  return (
    <div className="flex items-center gap-1.5">
      <div ref={tagMenuRef} className="relative">
        <button
          onClick={onToggleTagMenu}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
            tagFilter !== "all" ? "bg-orange-500 text-white font-bold" : "bg-white/10 hover:bg-white/20 text-white/90"
          }`}
        >
          <Tag className="w-3 h-3" />
          <span>{tagFilter === "all" ? "標籤" : `#${tagFilter}`}</span>
        </button>

        {isTagMenuOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-48 backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50">
            <button onClick={() => onSetTagFilter("all")} className="w-full text-left px-2 py-1 rounded-lg text-xs font-semibold hover:bg-slate-100">
              全部標籤 ({totalTaskCount})
            </button>
            <div className="mt-1 pt-1 border-t border-slate-100 space-y-0.5 max-h-40 overflow-y-auto custom-scrollbar">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onSetTagFilter(tag === tagFilter ? "all" : tag)}
                  className={`w-full text-left px-2.5 py-1 rounded-lg text-xs flex items-center justify-between ${
                    tagFilter === tag ? "text-orange-600 font-bold bg-orange-50" : "hover:bg-slate-100"
                  }`}
                >
                  <span>#{tag}</span>
                  {tagFilter === tag && <Check className="w-3 h-3 text-orange-600" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onTogglePriorityFilter}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
          priorityFilter === "high" ? "bg-amber-400 text-slate-950 font-bold" : "bg-white/10 hover:bg-white/20 text-white/90"
        }`}
        title="僅看重要星號卡片"
      >
        <Star className={`w-3 h-3 ${priorityFilter === "high" ? "fill-slate-950" : ""}`} />
        <span>重要</span>
      </button>

      <button
        onClick={onToggleMultiSelect}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
          isMultiSelectMode ? "bg-orange-500 text-white font-bold" : "bg-white/10 hover:bg-white/20 text-white/90"
        }`}
        title="多選模式"
      >
        <CheckSquare className="w-3 h-3" />
        <span>多選</span>
        {selectedTaskCount > 0 && (
          <span className="w-3.5 h-3.5 rounded-full bg-white text-orange-600 text-[9px] font-black flex items-center justify-center">
            {selectedTaskCount}
          </span>
        )}
      </button>

      <button onClick={onOpenBoardManager} className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 transition-colors" title="看板管理">
        <LayoutGrid className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
