"use client";

import React, { useState, useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { useSidebarInboxGestures } from "./sidebar/useSidebarInboxGestures";
import { InboxHeader } from "./sidebar/InboxHeader";
import { InboxMultiSelectBar } from "./sidebar/InboxMultiSelectBar";
import { InboxQuickAddBar } from "./sidebar/InboxQuickAddBar";
import { InboxTaskList } from "./sidebar/InboxTaskList";

const INBOX_DROPPABLE_DATA = {
  type: "Column",
  column: { id: "inbox", title: "收件匣" },
};

export const SidebarInbox: React.FC = () => {
  const tasks = useKanbanStore((s) => s.tasks);
  const isInboxSidebarOpen = useKanbanStore((s) => s.isInboxSidebarOpen);
  const selectedTaskIds = useKanbanStore((s) => s.selectedTaskIds);
  const activeDragTaskId = useKanbanStore((s) => s.activeDragTaskId);
  const isInboxOver = useKanbanStore((s) => s.dragOverLocation?.columnId === "inbox");
  const dragOverIndex = useKanbanStore((s) =>
    s.dragOverLocation?.columnId === "inbox" ? s.dragOverLocation.index : -1
  );

  const [inboxSort, setInboxSort] = useState<"date" | "priority" | "title">("date");
  const { isMobile, handleTouchStart, handleTouchEnd } = useSidebarInboxGestures();

  const { setNodeRef, isOver } = useDroppable({ id: "inbox", data: INBOX_DROPPABLE_DATA });

  const inboxTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.columnId === "inbox")
        .sort((a, b) => {
          if (inboxSort === "priority") {
            return (b.isStarred ? 1 : 0) - (a.isStarred ? 1 : 0);
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }),
    [tasks, inboxSort]
  );

  const isCrossColumnDrag =
    isInboxOver &&
    activeDragTaskId !== null &&
    !inboxTasks.some((t) => t.id === activeDragTaskId);

  const visibleInboxTasks = isInboxOver
    ? inboxTasks.filter((t) => t.id !== activeDragTaskId)
    : inboxTasks;
  const inboxTaskIds = visibleInboxTasks.map((t) => t.id);

  const insertIndex =
    isInboxOver && dragOverIndex >= 0
      ? Math.max(0, Math.min(dragOverIndex, visibleInboxTasks.length))
      : -1;

  const selectedInboxCount = inboxTasks.filter((t) => selectedTaskIds.includes(t.id)).length;

  return (
    <aside
      ref={setNodeRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      // 原本是 transition-all duration-300：那會連 width / padding / border / shadow
      // 一起動畫，每一幀都要重算 layout（而且是連旁邊整個看板一起算），開啟時就會頓一下。
      // 手機只動 transform + opacity（純合成，不碰 layout）；桌機只動 width + opacity。
      // backdrop-blur-xl 也拿掉：底色已是 /95，模糊看不出來，卻讓整個面板在滑出過程中
      // 每一幀重新取樣一次背景。
      className={`shrink-0 flex flex-col bg-white dark:bg-slate-900 rounded-2xl overflow-hidden ease-out ${
        isMobile
          ? `transition-[transform,opacity] duration-300 h-auto absolute inset-x-2.5 top-0 bottom-[calc(0.625rem+env(safe-area-inset-bottom,0px))] z-20 p-3 sm:p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-2xl will-change-transform ${
              isInboxSidebarOpen
                ? "translate-x-0 opacity-100 pointer-events-auto"
                : "-translate-x-[calc(100%+1.5rem)] opacity-0 pointer-events-none"
            }`
          : `transition-[width,opacity] duration-300 h-full ${
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
