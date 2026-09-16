"use client";

import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { getDueDateStatus } from "@/core/utils/dateUtils";
import { KanbanContainer } from "./KanbanContainer";
import { ReadOnlyBanner } from "@/features/collaboration/components/ReadOnlyBanner";
import { BoardCanvasHeader } from "./board-canvas/BoardCanvasHeader";
import { getBoardBackgroundClass } from "../utils/boardBackgrounds";

// 只有切到行事曆模式才會用到，不該進首屏 bundle
const CalendarView = dynamic(
  () => import("@/features/views/components/CalendarView").then((m) => ({ default: m.CalendarView })),
  { ssr: false }
);

export const BoardCanvasContainer: React.FC = () => {
  const store = useKanbanStore();
  const {
    boards, activeBoardId, setActiveBoardId, createBoard, viewMode, setViewMode,
    priorityFilter, setPriorityFilter, tagFilter, setTagFilter, isMultiSelectMode,
    setIsMultiSelectMode, selectedTaskIds, tasks, setIsBoardManagerOpen, setIsJoinBoardModalOpen,
    openCollectionBoard,
  } = store;

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(1000);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const isCompact = containerWidth < 720;
  const activeBoard = boards.find((b) => b.id === activeBoardId) || boards[0];
  const hasCollectionBoard = boards.some((b) => b.kind === "collection");
  const boardTasks = tasks.filter((t) => t.boardId === activeBoardId && t.columnId !== "inbox");
  const rawTags = Array.from(new Set(boardTasks.flatMap((t) => t.tags || []))).filter(Boolean);
  const hasOverdue = boardTasks.some((t) => getDueDateStatus(t.dueDate, t.completed)?.urgency === "overdue" && !t.completed);
  const hasDueSoon = boardTasks.some((t) => getDueDateStatus(t.dueDate, t.completed)?.urgency === "due-soon" && !t.completed);

  const allTags = [
    ...(hasOverdue ? ["逾期"] : []),
    ...(hasDueSoon ? ["即將到期"] : []),
    ...rawTags.filter((t) => t !== "逾期" && t !== "即將到期"),
  ];

  return (
    <div
      ref={containerRef}
      className={`flex-1 h-full min-w-0 rounded-2xl ${getBoardBackgroundClass(activeBoard?.background)} border border-purple-500/20 shadow-2xl flex flex-col overflow-hidden text-slate-100 relative transition-all duration-300 ease-in-out`}
    >
      <BoardCanvasHeader
        boards={boards} activeBoard={activeBoard} isCompact={isCompact} viewMode={viewMode}
        tagFilter={tagFilter} priorityFilter={priorityFilter} isMultiSelectMode={isMultiSelectMode}
        selectedTaskCount={selectedTaskIds.length} allTags={allTags} totalTaskCount={boardTasks.length}
        onSelectBoard={setActiveBoardId} onCreateBoard={(name) => createBoard(name, "📌")}
        onOpenJoinModal={() => setIsJoinBoardModalOpen(true)} onSetViewMode={setViewMode}
        onSetTagFilter={setTagFilter} onTogglePriorityFilter={() => setPriorityFilter(priorityFilter === "high" ? "all" : "high")}
        onToggleMultiSelect={() => setIsMultiSelectMode(!isMultiSelectMode)}
        onOpenBoardManager={() => setIsBoardManagerOpen(true)}
        showPasteLink={activeBoard?.kind === "collection"}
        onOpenCollection={hasCollectionBoard ? undefined : openCollectionBoard}
      />
      <ReadOnlyBanner />
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative pb-[calc(54px+env(safe-area-inset-bottom,0px))] sm:pb-16">
        {viewMode === "kanban" && <KanbanContainer />}
        {viewMode === "calendar" && <CalendarView />}
      </div>
    </div>
  );
};
