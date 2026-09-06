"use client";

import React from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { Task } from "@/core/types/task";
import confetti from "canvas-confetti";

export function useListViewModel() {
  const {
    tasks,
    activeBoardId,
    getActiveBoardColumns,
    toggleTaskComplete,
    setEditingTaskId,
    searchQuery,
    priorityFilter,
    tagFilter,
  } = useKanbanStore();

  const columns = getActiveBoardColumns();

  const boardTasks = tasks.filter((task) => {
    if (task.boardId !== activeBoardId) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchTag = task.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTag) return false;
    }

    if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
    if (tagFilter !== "all" && !task.tags.includes(tagFilter)) return false;

    return true;
  });

  const handleToggleComplete = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    if (!task.completed) {
      try {
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.8 },
          colors: ["#BEF264", "#F97316", "#10B981"],
        });
      } catch {}
    }
    toggleTaskComplete(task.id);
  };

  return {
    columns,
    boardTasks,
    setEditingTaskId,
    handleToggleComplete,
  };
}
