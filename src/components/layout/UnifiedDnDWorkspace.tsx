"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection,
  closestCorners,
  DragOverlay,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { ColumnId, Task } from "@/core/types/task";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { SidebarInbox } from "../inbox/SidebarInbox";
import { WorkspaceSplitter } from "./WorkspaceSplitter";
import { BoardCanvasContainer } from "../kanban/BoardCanvasContainer";
import { TaskCard } from "../kanban/TaskCard";

export const UnifiedDnDWorkspace: React.FC = () => {
  const {
    tasks,
    activeBoardId,
    moveTask,
    reorderColumnTasks,
    getActiveBoardColumns,
    inboxWidth,
    setActiveDragTaskId,
    dragOverLocation,
    setDragOverLocation,
  } = useKanbanStore();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeDragVariant, setActiveDragVariant] = useState<"card" | "row">("card");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const columns = getActiveBoardColumns();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // 3px threshold for fast responsive dragging
      },
    })
  );

  // Custom collision detection: prioritize items under pointer, fallback to container, then rectIntersection, then closestCorners
  const collisionDetectionStrategy = (args: Parameters<typeof closestCorners>[0]) => {
    // 1. First check if pointer is directly within any droppable
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      // Prioritize Sortable Task over Column container if pointer is directly on a task
      const taskCollision = pointerCollisions.find(
        (c) => c.data?.droppableContainer?.data?.current?.type === "Task"
      );
      if (taskCollision) {
        return [taskCollision];
      }
      return pointerCollisions;
    }

    // 2. Check bounding rect intersection (useful when pointer moves fast or over margins)
    const rectCollisions = rectIntersection(args);
    if (rectCollisions.length > 0) {
      const taskCollision = rectCollisions.find(
        (c) => c.data?.droppableContainer?.data?.current?.type === "Task"
      );
      if (taskCollision) {
        return [taskCollision];
      }
      return rectCollisions;
    }

    // 3. Fallback to closestCorners
    return closestCorners(args);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
      setActiveDragTaskId(task.id);
      setActiveDragVariant(task.columnId === "inbox" && inboxWidth >= 420 ? "row" : "card");
      setDragOverLocation(null);
    }
  };

  // Real-time slot gap / placeholder when dragging across columns or inside column
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) {
      if (dragOverLocation !== null) {
        setDragOverLocation(null);
      }
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const isOverColumn = columns.some((col) => col.id === overId) || overId === "inbox";
    const overTask = tasks.find((t) => t.id === overId);

    const targetColumnId = isOverColumn ? (overId as ColumnId) : overTask?.columnId;
    if (!targetColumnId) {
      if (dragOverLocation !== null) setDragOverLocation(null);
      return;
    }

    const targetBoardId = targetColumnId === "inbox" ? "global" : activeBoardId;
    const targetColumnTasks = tasks
      .filter((t) =>
        targetColumnId === "inbox"
          ? t.columnId === "inbox" && t.id !== activeId
          : t.boardId === targetBoardId && t.columnId === targetColumnId && t.id !== activeId
      )
      .sort((a, b) => (a.orderKey > b.orderKey ? 1 : -1));

    let targetIndex = targetColumnTasks.length;
    if (overTask && overId !== activeId) {
      const overIndex = targetColumnTasks.findIndex((t) => t.id === overId);
      targetIndex = overIndex >= 0 ? overIndex : targetColumnTasks.length;
    }

    if (
      dragOverLocation?.columnId !== targetColumnId ||
      dragOverLocation?.index !== targetIndex
    ) {
      setDragOverLocation({ columnId: targetColumnId, index: targetIndex });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const finalLocation = dragOverLocation;
    setActiveTask(null);
    setActiveDragTaskId(null);
    setDragOverLocation(null);

    const { active, over } = event;
    if (!over && !finalLocation) return;

    const activeId = active.id as string;
    const overId = over?.id as string | undefined;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    const isOverColumn = overId ? columns.some((col) => col.id === overId) || overId === "inbox" : false;
    const overTask = overId ? tasks.find((t) => t.id === overId) : undefined;

    const targetColumnId =
      finalLocation?.columnId || (isOverColumn ? (overId as ColumnId) : overTask?.columnId);
    if (!targetColumnId) return;

    const targetBoardId = targetColumnId === "inbox" ? "global" : activeBoardId;

    // Case 1: Same Column Reordering (Downwards and Upwards via arrayMove)
    if (overTask && activeId !== overId && activeTask.columnId === targetColumnId) {
      const columnTasks = tasks
        .filter((t) =>
          targetColumnId === "inbox"
            ? t.columnId === "inbox"
            : t.boardId === targetBoardId && t.columnId === targetColumnId
        )
        .sort((a, b) => (a.orderKey > b.orderKey ? 1 : -1));

      const activeIndex = columnTasks.findIndex((t) => t.id === activeId);
      const overIndex = columnTasks.findIndex((t) => t.id === overId);

      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        const reordered = arrayMove(columnTasks, activeIndex, overIndex);
        reorderColumnTasks(targetColumnId, targetBoardId, reordered);
        return;
      }
    }

    // Case 2: Cross Column Move or drop on column with live slot index
    const targetColumnTasks = tasks
      .filter((t) =>
        targetColumnId === "inbox"
          ? t.columnId === "inbox" && t.id !== activeId
          : t.boardId === targetBoardId && t.columnId === targetColumnId && t.id !== activeId
      )
      .sort((a, b) => (a.orderKey > b.orderKey ? 1 : -1));

    let finalIndex = finalLocation?.index ?? targetColumnTasks.length;
    if (overTask && !finalLocation) {
      const overIndex = targetColumnTasks.findIndex((t) => t.id === overId);
      finalIndex = overIndex >= 0 ? overIndex : targetColumnTasks.length;
    }

    moveTask(activeId, targetColumnId, finalIndex, false);
  };

  if (!isMounted) {
    return (
      <div className="flex-1 min-h-0 w-full flex p-2.5 sm:p-3 items-start overflow-hidden gap-0">
        <SidebarInbox />
        <WorkspaceSplitter />
        <BoardCanvasContainer />
      </div>
    );
  }

  return (
    <DndContext
      id="voice-kanban-unified-dnd"
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 min-h-0 w-full flex p-2.5 sm:p-3 items-start overflow-hidden gap-0">
        {/* Left Container: Global Inbox Panel */}
        <SidebarInbox />

        {/* Middle Draggable Splitter Divider */}
        <WorkspaceSplitter />

        {/* Right Container: Trello Board Canvas Container */}
        <BoardCanvasContainer />
      </div>

      {/* Drag Overlay for smooth 60fps ghost card under cursor with pure GPU scale */}
      <DragOverlay
        dropAnimation={{
          duration: 180,
          easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
        }}
      >
        {activeTask ? (
          <div
            style={{
              width:
                activeDragVariant === "row"
                  ? `${Math.min(inboxWidth - 28, 480)}px`
                  : "246px",
              transformOrigin: "center center",
            }}
            className="scale-105 rotate-1.5 shadow-2xl opacity-95 pointer-events-none transition-transform duration-75 select-none cursor-grabbing"
          >
            <TaskCard
              task={activeTask}
              variant={activeDragVariant}
              inboxWidth={inboxWidth}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
