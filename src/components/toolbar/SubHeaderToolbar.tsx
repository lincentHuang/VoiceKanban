"use client";

import React from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { ViewMode } from "@/core/types/task";
import {
  Columns,
  Table2,
  ListTodo,
  CalendarDays,
  SlidersHorizontal,
  Tag,
  Plus,
  Inbox,
} from "lucide-react";

export const SubHeaderToolbar: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    tasks,
    activeBoardId,
    tagFilter,
    setTagFilter,
    setIsColumnManagerOpen,
    openAddTaskModal,
    isInboxSidebarOpen,
    setIsInboxSidebarOpen,
  } = useKanbanStore();

  const boardTasks = tasks.filter((t) => t.boardId === activeBoardId);

  // Extract all unique tags in this board
  const allTags = Array.from(
    new Set(boardTasks.flatMap((t) => t.tags || []))
  ).filter(Boolean);

  const inProgressCount = boardTasks.filter((t) => t.columnId === "in_progress").length;
  const doneCount = boardTasks.filter((t) => t.completed || t.columnId === "done").length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-2">
      <div className="backdrop-blur-xl bg-white/75 dark:bg-slate-900/75 border border-white/70 dark:border-slate-800/70 shadow-xs rounded-2xl px-3.5 py-1.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5 transition-all text-xs">
        {/* Left: Inbox Toggle, View Modes, Workflow Manager */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Inbox Sidebar Button */}
          <button
            onClick={() => setIsInboxSidebarOpen(!isInboxSidebarOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border font-bold transition-all ${
              isInboxSidebarOpen
                ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800"
                : "bg-white dark:bg-slate-800 text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
            title="開啟/收合獨立收件匣"
          >
            <Inbox className="w-3.5 h-3.5 text-blue-500" />
            <span>收件匣</span>
          </button>

          {/* View Modes Segmented Control */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 font-semibold text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                viewMode === "kanban"
                  ? "bg-white dark:bg-slate-900 text-orange-600 font-bold shadow-xs"
                  : "hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>看板</span>
            </button>

            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                viewMode === "table"
                  ? "bg-white dark:bg-slate-900 text-orange-600 font-bold shadow-xs"
                  : "hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Table2 className="w-3.5 h-3.5" />
              <span>表格</span>
            </button>

            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-900 text-orange-600 font-bold shadow-xs"
                  : "hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>清單</span>
            </button>

            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                viewMode === "calendar"
                  ? "bg-white dark:bg-slate-900 text-orange-600 font-bold shadow-xs"
                  : "hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>日期</span>
            </button>
          </div>

          {/* Workflow Status Management */}
          <button
            onClick={() => setIsColumnManagerOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-white text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 font-semibold shadow-xs transition-colors"
            title="自訂與增減看板狀態欄位"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>自訂流程</span>
          </button>

          {/* Quick Add Task */}
          <button
            onClick={() => openAddTaskModal()}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新增卡片</span>
          </button>
        </div>

        {/* Right: Tag Quick Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-0.5">
          <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
            <Tag className="w-3 h-3 text-slate-400" />
            標籤:
          </span>

          <button
            onClick={() => setTagFilter("all")}
            className={`px-2 py-0.5 rounded-full font-semibold transition-all shrink-0 ${
              tagFilter === "all"
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs"
                : "bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
            }`}
          >
            全部
          </button>

          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setTagFilter(tag === tagFilter ? "all" : tag)}
              className={`px-2 py-0.5 rounded-full font-semibold transition-all shrink-0 ${
                tagFilter === tag
                  ? "bg-orange-500 text-white shadow-2xs"
                  : "bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-orange-50 hover:text-orange-600"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
