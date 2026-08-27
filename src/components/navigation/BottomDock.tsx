"use client";

import React, { useState, useEffect } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { ViewMode } from "@/core/types/task";
import { Inbox, Columns, Calendar, Table2, ListTodo, SlidersHorizontal } from "lucide-react";

export const BottomDock: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    isInboxSidebarOpen,
    setIsInboxSidebarOpen,
    setIsColumnManagerOpen,
  } = useKanbanStore();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleInboxClick = () => {
    if (isMobile) {
      setIsInboxSidebarOpen(true);
    } else {
      setIsInboxSidebarOpen(!isInboxSidebarOpen);
    }
  };

  const handleViewClick = (mode: ViewMode) => {
    if (isMobile) {
      setIsInboxSidebarOpen(false);
    }
    setViewMode(mode);
  };

  const isInboxActive = isMobile ? isInboxSidebarOpen : isInboxSidebarOpen;
  const isKanbanActive = isMobile ? (!isInboxSidebarOpen && viewMode === "kanban") : viewMode === "kanban";
  const isListActive = isMobile ? (!isInboxSidebarOpen && viewMode === "list") : viewMode === "list";
  const isCalendarActive = !isMobile && viewMode === "calendar";
  const isTableActive = !isMobile && viewMode === "table";

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto max-w-[calc(100vw-5rem)] sm:max-w-none">
      <div className="backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 border border-white/80 dark:border-slate-800 rounded-full shadow-glass-elevated px-2.5 sm:px-3 py-1.5 flex items-center gap-1 sm:gap-2 transition-all">
        {/* Inbox View Toggle */}
        <button
          onClick={handleInboxClick}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
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

        {/* View Switchers */}
        <button
          onClick={() => handleViewClick("kanban")}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            isKanbanActive
              ? "bg-orange-500 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
          title="看板模式"
        >
          <Columns className="w-3.5 h-3.5 shrink-0" />
          <span>看板</span>
        </button>

        {/* Calendar - Hidden on mobile */}
        <button
          onClick={() => handleViewClick("calendar")}
          className={`hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            isCalendarActive
              ? "bg-orange-500 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
          title="行事曆模式"
        >
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span>行事曆</span>
        </button>

        {/* Table - Hidden on mobile */}
        <button
          onClick={() => handleViewClick("table")}
          className={`hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            isTableActive
              ? "bg-orange-500 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
          title="表格模式"
        >
          <Table2 className="w-3.5 h-3.5 shrink-0" />
          <span>表格</span>
        </button>

        {/* List View - Always visible */}
        <button
          onClick={() => handleViewClick("list")}
          className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            isListActive
              ? "bg-orange-500 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
          title="清單模式"
        >
          <ListTodo className="w-3.5 h-3.5 shrink-0" />
          <span>清單</span>
        </button>

        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 shrink-0" />

        {/* Workflow settings */}
        <button
          onClick={() => setIsColumnManagerOpen(true)}
          className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 transition-colors shrink-0"
          title="狀態流程管理"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
