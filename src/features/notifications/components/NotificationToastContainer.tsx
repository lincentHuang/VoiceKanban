"use client";

import React from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { NotificationToastItem } from "./NotificationToastItem";
import { NotificationItem } from "../types";

export const NotificationToastContainer: React.FC = () => {
  const {
    activeToasts,
    dismissToast,
    markNotificationAsRead,
    setActiveBoardId,
    setEditingTaskId,
    boards,
  } = useKanbanStore();

  if (!activeToasts || activeToasts.length === 0) return null;

  const handleSelectToast = (item: NotificationItem) => {
    markNotificationAsRead(item.id);

    if (item.boardId && boards.some((b) => b.id === item.boardId)) {
      setActiveBoardId(item.boardId);
    }

    if (item.taskId && item.actionType !== "task_deleted") {
      setEditingTaskId(item.taskId);
    }
  };

  return (
    <div
      aria-live="polite"
      className="fixed top-[calc(0.75rem+env(safe-area-inset-top,0px))] right-3 sm:top-[calc(1.25rem+env(safe-area-inset-top,0px))] sm:right-5 z-[99999] flex flex-col gap-2.5 pointer-events-none max-w-[calc(100vw-24px)]"
    >
      {activeToasts.slice(0, 3).map((item) => (
        <div key={item.id} className="pointer-events-auto">
          <NotificationToastItem
            notification={item}
            onDismiss={dismissToast}
            onSelect={handleSelectToast}
          />
        </div>
      ))}
    </div>
  );
};
