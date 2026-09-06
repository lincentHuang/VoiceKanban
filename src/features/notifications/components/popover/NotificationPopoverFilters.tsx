"use client";

import React from "react";

interface Props {
  filterTab: "all" | "unread";
  totalCount: number;
  unreadCount: number;
  onSelectTab: (tab: "all" | "unread") => void;
}

export const NotificationPopoverFilters: React.FC<Props> = ({
  filterTab,
  totalCount,
  unreadCount,
  onSelectTab,
}) => {
  return (
    <div className="px-3 pt-2 pb-1 border-b border-slate-100 dark:border-slate-800/60 flex items-center gap-2 shrink-0">
      <button
        type="button"
        onClick={() => onSelectTab("all")}
        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          filterTab === "all"
            ? "bg-orange-500 text-white shadow-xs"
            : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
        }`}
      >
        全部 ({totalCount})
      </button>
      <button
        type="button"
        onClick={() => onSelectTab("unread")}
        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
          filterTab === "unread"
            ? "bg-orange-500 text-white shadow-xs"
            : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
        }`}
      >
        未讀
        {unreadCount > 0 && (
          <span
            className={`px-1.5 py-0.2 rounded-full text-[9px] ${
              filterTab === "unread"
                ? "bg-white/30 text-white"
                : "bg-orange-100 dark:bg-orange-950 text-orange-600"
            }`}
          >
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};
