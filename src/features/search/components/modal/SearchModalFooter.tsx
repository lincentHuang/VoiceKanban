"use client";

import React from "react";
import { Filter } from "lucide-react";

interface SearchModalFooterProps {
  searchQuery: string;
  isSearching: boolean;
  onClearFilter: () => void;
  onApplyFilter: () => void;
}

export const SearchModalFooter: React.FC<SearchModalFooterProps> = ({
  searchQuery,
  isSearching,
  onClearFilter,
  onApplyFilter,
}) => {
  return (
    <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
      <div className="flex items-center gap-3 text-[11px]">
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-mono text-[10px] shadow-2xs">
            ↑↓
          </kbd>
          選擇
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-mono text-[10px] shadow-2xs">
            ↵
          </kbd>
          開啟卡片
        </span>
        <span className="hidden sm:inline-flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-mono text-[10px] shadow-2xs">
            ESC
          </kbd>
          關閉
        </span>
      </div>

      <div className="flex items-center gap-2">
        {searchQuery && (
          <button
            type="button"
            onClick={onClearFilter}
            className="text-[11px] text-rose-500 hover:text-rose-600 hover:underline cursor-pointer"
          >
            清除看板篩選
          </button>
        )}

        {isSearching && (
          <button
            type="button"
            onClick={onApplyFilter}
            className="px-2.5 py-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-[11px] shadow-2xs transition-all flex items-center gap-1 cursor-pointer active:scale-95"
          >
            <Filter className="w-3 h-3" />
            <span>在看板套用</span>
          </button>
        )}
      </div>
    </div>
  );
};
