"use client";

import React from "react";
import { Search } from "lucide-react";

interface NavbarSearchBarProps {
  searchQuery: string;
  onOpenSearch: () => void;
  onClearSearch: (e: React.MouseEvent) => void;
}

export const NavbarSearchBar: React.FC<NavbarSearchBarProps> = ({
  searchQuery,
  onOpenSearch,
  onClearSearch,
}) => {
  return (
    <button
      type="button"
      onClick={onOpenSearch}
      className="hidden sm:flex items-center flex-1 max-w-xs md:max-w-md mx-auto relative px-3.5 py-1.5 rounded-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/80 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:border-orange-500/50 shadow-xs transition-all cursor-pointer text-left group"
    >
      <Search className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors shrink-0" />
      <span className="ml-2.5 text-xs sm:text-sm text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 truncate">
        {searchQuery ? searchQuery : "搜尋任務、標籤或關鍵字..."}
      </span>
      <div className="ml-auto flex items-center gap-1 shrink-0">
        {searchQuery ? (
          <span
            onClick={onClearSearch}
            className="text-xs text-slate-400 hover:text-rose-500 px-1 py-0.5 rounded-full transition-colors"
            title="清除搜尋條件"
          >
            ✕
          </span>
        ) : (
          <kbd className="inline-block px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-400 font-mono text-[10px] border border-slate-200 dark:border-slate-700 shadow-2xs">
            ⌘K
          </kbd>
        )}
      </div>
    </button>
  );
};
