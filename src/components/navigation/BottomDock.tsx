"use client";

import React from "react";
import { Inbox, Columns, Calendar } from "lucide-react";
import { useBottomDock } from "./useBottomDock";

export const BottomDock: React.FC = () => {
  const {
    isVisible,
    isInboxActive,
    isKanbanActive,
    isCalendarActive,
    handleInboxClick,
    handleViewClick,
  } = useBottomDock();

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-30 pointer-events-auto max-w-[calc(100vw-5rem)] sm:max-w-none">
      <div className="backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 border border-white/80 dark:border-slate-800 rounded-full shadow-glass-elevated px-2.5 sm:px-3 py-1.5 flex items-center gap-1 sm:gap-2 transition-all">
        <button
          onClick={handleInboxClick}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            isInboxActive
              ? "bg-blue-500 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
          title="收件匣"
        >
          <Inbox className="w-3.5 h-3.5 shrink-0" />
          <span>收件匣</span>
        </button>

        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 shrink-0" />

        <button
          onClick={() => handleViewClick("kanban")}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            isKanbanActive
              ? "bg-orange-500 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
          title="看板模式"
        >
          <Columns className="w-3.5 h-3.5 shrink-0" />
          <span>看板</span>
        </button>

        <button
          onClick={() => handleViewClick("calendar")}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            isCalendarActive
              ? "bg-orange-500 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
          title="行事曆模式"
        >
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span>行事曆</span>
        </button>
      </div>
    </div>
  );
};
