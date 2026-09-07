"use client";

import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { useSidebarInboxGestures } from "./sidebar/useSidebarInboxGestures";
import { InboxHeader } from "./sidebar/InboxHeader";
import { InboxMultiSelectBar } from "./sidebar/InboxMultiSelectBar";
import { InboxQuickAddBar } from "./sidebar/InboxQuickAddBar";
import { InboxTaskList } from "./sidebar/InboxTaskList";

export const SidebarInbox: React.FC = () => {
  const {
    tasks,
    isInboxSidebarOpen,
    dragOverLocation,
    activeDragTaskId,
    selectedTaskIds,
  } = useKanbanStore();

  const [inboxSort, setInboxSort] = useState<"date" | "priority" | "title">("date");
  const { isMobile, handleTouchStart, handleTouchEnd } = useSidebarInboxGestures();

  const { setNodeRef, isOver } = useDroppable({
    id: "inbox",
    data: {
      type: "Column",
      column: { id: "inbox", title: "收件匣" },
    },
  });

  const inboxTasks = tasks
    .filter((t) => t.columnId === "inbox")
    .sort((a, b) => {
      if (inboxSort === "priority") {
        return (b.isStarred ? 1 : 0) - (a.isStarred ? 1 : 0);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const isInboxOver = dragOverLocation?.columnId === "inbox";
  const isCrossColumnDrag =
    isInboxOver &&
    activeDragTaskId !== null &&
    !inboxTasks.some((t) => t.id === activeDragTaskId);

  const visibleInboxTasks = isInboxOver
    ? inboxTasks.filter((t) => t.id !== activeDragTaskId)
    : inboxTasks;
  const inboxTaskIds = visibleInboxTasks.map((t) => t.id);

  const insertIndex =
    isInboxOver && dragOverLocation
      ? Math.max(0, Math.min(dragOverLocation.index, visibleInboxTasks.length))
      : -1;

  const selectedInboxCount = inboxTasks.filter((t) => selectedTaskIds.includes(t.id)).length;

  return (
    <aside
      ref={setNodeRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`shrink-0 flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl overflow-hidden transition-all duration-300 ease-in-out ${
        isMobile
          ? `h-auto absolute inset-x-2.5 top-0 bottom-[calc(0.625rem+env(safe-area-inset-bottom,0px))] z-20 p-3  sm:p-3.5 border border-slate-200/80 dark:border-slate-800 ${
              isInboxSidebarOpen
                ? "translate-x-0 opacity-100 pointer-events-auto shadow-2xl"
                : "-translate-x-[calc(100%+1.5rem)] opacity-0 pointer-events-none shadow-none"
            }`
          : `h-full ${
              isInboxSidebarOpen
                ? "relative w-80 opacity-100 pointer-events-auto p-3 sm:p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-xl"
                : "relative w-0 opacity-0 pointer-events-none p-0 border-0 shadow-none -ml-3"
            }`
      } ${isOver && isInboxSidebarOpen ? "border-2 border-blue-500 bg-blue-50/50 dark:bg-blue-950/40" : ""}`}
    >
      <div className={`h-full flex flex-col ${isMobile ? "w-full min-w-0" : "w-full sm:w-[294px] sm:min-w-[294px]"}`}>
        <InboxHeader
          taskCount={inboxTasks.length}
          selectedCount={selectedInboxCount}
          inboxSort={inboxSort}
          setInboxSort={setInboxSort}
        />
        <InboxMultiSelectBar selectedCount={selectedInboxCount} />
        <InboxQuickAddBar />
        <InboxTaskList
          tasks={visibleInboxTasks}
          taskIds={inboxTaskIds}
          isCrossColumnDrag={isCrossColumnDrag}
          isInboxOver={isInboxOver}
          insertIndex={insertIndex}
        />
        <div className="h-[40px] sm:hidden shrink-0" />
      </div>
    </aside>
  );
};
