"use client";

import React from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { ToolbarLeftActions } from "./ToolbarLeftActions";
import { ToolbarTagFilters } from "./ToolbarTagFilters";

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
    canCurrentUserEdit,
  } = useKanbanStore();

  const canEdit = canCurrentUserEdit();
  const boardTasks = tasks.filter((t) => t.boardId === activeBoardId);

  const allTags = Array.from(
    new Set(boardTasks.flatMap((t) => t.tags || []))
  ).filter(Boolean);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-2">
      <div className="backdrop-blur-xl bg-white/75 dark:bg-slate-900/75 border border-white/70 dark:border-slate-800/70 shadow-xs rounded-2xl px-3.5 py-1.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5 transition-all text-xs">
        <ToolbarLeftActions
          isInboxSidebarOpen={isInboxSidebarOpen}
          onToggleInbox={() => setIsInboxSidebarOpen(!isInboxSidebarOpen)}
          viewMode={viewMode}
          onSelectViewMode={setViewMode}
          canEdit={canEdit}
          onOpenColumnManager={() => setIsColumnManagerOpen(true)}
          onOpenAddTask={openAddTaskModal}
        />

        <ToolbarTagFilters
          allTags={allTags}
          tagFilter={tagFilter}
          onSelectTag={setTagFilter}
        />
      </div>
    </div>
  );
};
