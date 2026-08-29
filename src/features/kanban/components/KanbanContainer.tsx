"use client";

import React from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { getDueDateStatus } from "@/core/utils/dateUtils";
import { KanbanColumn } from "./KanbanColumn";

export const KanbanContainer: React.FC = () => {
  const {
    tasks,
    activeBoardId,
    searchQuery,
    priorityFilter,
    tagFilter,
    getActiveBoardColumns,
  } = useKanbanStore();

  const columns = getActiveBoardColumns();

  // Filter tasks for the active board (Excluding global inbox which lives in sidebar)
  const boardTasks = tasks.filter((task) => {
    if (task.columnId === "inbox") return false; // Global inbox items live in dedicated sidebar
    if (task.boardId !== activeBoardId) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchTag = task.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTag) return false;
    }

    // Priority / Star filter
    if (priorityFilter === "high" && !task.isStarred) {
      return false;
    }

    // Tag filter (handles explicit tags AND dynamic urgency / overdue tags)
    if (tagFilter !== "all") {
      const dateStatus = getDueDateStatus(task.dueDate, task.completed);
      const isOverdueTag =
        (tagFilter === "逾期" || tagFilter === "緊急") &&
        dateStatus?.urgency === "overdue" &&
        !task.completed;
      const isDueSoonTag =
        (tagFilter === "即將到期" || tagFilter === "緊急") &&
        dateStatus?.urgency === "due-soon" &&
        !task.completed;
      const hasExplicitTag = task.tags?.includes(tagFilter);

      if (!hasExplicitTag && !isOverdueTag && !isDueSoonTag) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="w-full h-full max-h-full overflow-x-auto overflow-y-hidden px-2 sm:px-3 pt-2 pb-2 sm:pb-2.5 custom-scrollbar">
      {/* Kanban Horizontal Flex Area */}
      <div className="flex gap-3 sm:gap-3.5 h-full min-w-max items-start">
        {columns.map((column) => {
          const columnTasks = boardTasks
            .filter((t) => t.columnId === column.id)
            .sort((a, b) => (a.orderKey > b.orderKey ? 1 : -1));

          return (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={columnTasks}
            />
          );
        })}
      </div>
    </div>
  );
};
