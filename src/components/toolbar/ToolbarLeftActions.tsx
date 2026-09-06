"use client";

import React from "react";
import { ViewMode } from "@/core/types/task";
import { Columns, CalendarDays, SlidersHorizontal, Plus, Inbox } from "lucide-react";

interface ToolbarLeftActionsProps {
  isInboxSidebarOpen: boolean;
  onToggleInbox: () => void;
  viewMode: ViewMode;
  onSelectViewMode: (mode: ViewMode) => void;
  canEdit: boolean;
  onOpenColumnManager: () => void;
  onOpenAddTask: () => void;
}

export const ToolbarLeftActions: React.FC<ToolbarLeftActionsProps> = ({
  isInboxSidebarOpen,
  onToggleInbox,
  viewMode,
  onSelectViewMode,
  canEdit,
  onOpenColumnManager,
  onOpenAddTask,
}) => {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <button
        onClick={onToggleInbox}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border font-bold transition-all cursor-pointer ${
          isInboxSidebarOpen
            ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800"
            : "bg-white dark:bg-slate-800 text-slate-600 border-slate-200 hover:bg-slate-50"
        }`}
        title="開啟/收合獨立收件匣"
      >
        <Inbox className="w-3.5 h-3.5 text-blue-500" />
        <span>收件匣</span>
      </button>

      <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 font-semibold text-slate-600 dark:text-slate-300">
        <button
          onClick={() => onSelectViewMode("kanban")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
            viewMode === "kanban"
              ? "bg-white dark:bg-slate-900 text-orange-600 font-bold shadow-xs"
              : "hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Columns className="w-3.5 h-3.5" />
          <span>看板</span>
        </button>

        <button
          onClick={() => onSelectViewMode("calendar")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
            viewMode === "calendar"
              ? "bg-white dark:bg-slate-900 text-orange-600 font-bold shadow-xs"
              : "hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>日期</span>
        </button>
      </div>

      {canEdit && (
        <>
          <button
            onClick={onOpenColumnManager}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-white text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 font-semibold shadow-xs transition-colors cursor-pointer"
            title="自訂與增減看板狀態欄位"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>自訂流程</span>
          </button>

          <button
            onClick={onOpenAddTask}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新增卡片</span>
          </button>
        </>
      )}
    </div>
  );
};
