"use client";

import React, { useState } from "react";
import { Inbox, MoreHorizontal, ChevronLeft, CheckSquare } from "lucide-react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { InboxHeaderMenu } from "./InboxHeaderMenu";

interface InboxHeaderProps {
  taskCount: number;
  selectedCount: number;
  inboxSort: "date" | "priority" | "title";
  setInboxSort: (sort: "date" | "priority" | "title") => void;
}

export const InboxHeader: React.FC<InboxHeaderProps> = ({
  taskCount,
  selectedCount,
  inboxSort,
  setInboxSort,
}) => {
  const {
    isMultiSelectMode,
    setIsMultiSelectMode,
    setIsInboxSidebarOpen,
  } = useKanbanStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60 dark:border-slate-800/60 shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shadow-2xs">
          <Inbox className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-1.5">
          <h2 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-tight">
            收件匣
          </h2>
          <span className="px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-black text-[10px]">
            {taskCount}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setIsMultiSelectMode(!isMultiSelectMode)}
          className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
            isMultiSelectMode
              ? "bg-orange-500 text-white shadow-xs"
              : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700"
          }`}
          title="多選模式"
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span className="text-[11px] hidden sm:inline-block">多選</span>
          {selectedCount > 0 && (
            <span className="w-3.5 h-3.5 rounded-full bg-white text-orange-600 text-[9px] font-black flex items-center justify-center">
              {selectedCount}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title="收件匣選項"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <InboxHeaderMenu
              inboxSort={inboxSort}
              setInboxSort={setInboxSort}
              onClose={() => setIsMenuOpen(false)}
            />
          )}
        </div>

        <button
          onClick={() => setIsInboxSidebarOpen(false)}
          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          title="收合收件匣"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
