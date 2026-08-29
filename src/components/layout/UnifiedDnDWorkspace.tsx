"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  pointerWithin,
  closestCenter,
  closestCorners,
  DragOverlay,
  CollisionDetection,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { ColumnId, Task } from "@/core/types/task";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { SidebarInbox } from "@/features/inbox";
import { WorkspaceSplitter } from "./WorkspaceSplitter";
import { BoardCanvasContainer, TaskCard } from "@/features/kanban";

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

  // Multi-sensor configuration:
  // 1. MouseSensor: 4px movement for instant snappy drag on desktop
  // 2. TouchSensor: 200ms long press delay with 8px tolerance on mobile
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  // Anti-jitter Collision Detection:
  // 1. Prioritize direct pointer hits on tasks or column containers
  // 2. Fallback to monotonic closestCenter (eliminates jumping caused by rect overlap)
  // 3. Fallback to closestCorners
  const collisionDetectionStrategy: CollisionDetection = (args) => {
    // 1. Check if pointer is directly within any droppable
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      // Prioritize Sortable Task directly under pointer
      const taskCollision = pointerCollisions.find(
        (c) => c.data?.droppableContainer?.data?.current?.type === "Task"
      );
      if (taskCollision) {
        return [taskCollision];
      }

      // Check if pointer is over a Column container or inbox
      const columnCollision = pointerCollisions.find(
        (c) =>
          c.data?.droppableContainer?.data?.current?.type === "Column" ||
          c.id === "inbox" ||
          columns.some((col) => col.id === c.id)
      );
      if (columnCollision) {
        return [columnCollision];
      }

      return pointerCollisions;
    }

    // 2. Center-distance collision detection for smooth tracking without multi-column jitter
    const centerCollisions = closestCenter(args);
    if (centerCollisions.length > 0) {
      return centerCollisions;
    }

    // 3. Final fallback
    return closestCorners(args);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      // Haptic feedback on mobile touch long-press drag start
      if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate(30);
        } catch {}
      }

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
      if (overIndex >= 0) {
        // Midpoint Y-axis thresholding: compare center of active item with center of hovered item
        const activeTop = active.rect.current.translated?.top;
        const activeHeight = active.rect.current.translated?.height ?? 0;
        const overTop = over.rect.top;
        const overHeight = over.rect.height;

        let isBelow = false;
        if (activeTop !== undefined && overTop !== undefined) {
          const activeCenterY = activeTop + activeHeight / 2;
          const overCenterY = overTop + overHeight / 2;
          isBelow = activeCenterY > overCenterY;
        }

        targetIndex = isBelow ? overIndex + 1 : overIndex;
      }
    } else if (isOverColumn && targetColumnTasks.length > 0) {
      // If hovering directly over column container area (e.g. padding/top/bottom)
      const activeTop = active.rect.current.translated?.top;
      const overTop = over.rect.top;
      if (activeTop !== undefined && overTop !== undefined) {
        if (activeTop < overTop + 60) {
          targetIndex = 0;
        } else {
          targetIndex = targetColumnTasks.length;
        }
      }
    }

    targetIndex = Math.max(0, Math.min(targetIndex, targetColumnTasks.length));

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

    const targetColumnTasks = tasks
      .filter((t) =>
        targetColumnId === "inbox"
          ? t.columnId === "inbox" && t.id !== activeId
          : t.boardId === targetBoardId && t.columnId === targetColumnId && t.id !== activeId
      )
      .sort((a, b) => (a.orderKey > b.orderKey ? 1 : -1));

    let finalIndex = finalLocation?.index ?? targetColumnTasks.length;
    if (finalLocation === null && overTask) {
      const overIndex = targetColumnTasks.findIndex((t) => t.id === overId);
      finalIndex = overIndex >= 0 ? overIndex : targetColumnTasks.length;
    }

    finalIndex = Math.max(0, Math.min(finalIndex, targetColumnTasks.length));

    // Same Column Reordering
    if (activeTask.columnId === targetColumnId && (activeTask.boardId === targetBoardId || targetColumnId === "inbox")) {
      const originalColumnTasks = tasks
        .filter((t) =>
          targetColumnId === "inbox"
            ? t.columnId === "inbox"
            : t.boardId === targetBoardId && t.columnId === targetColumnId
        )
        .sort((a, b) => (a.orderKey > b.orderKey ? 1 : -1));

      const oldIndex = originalColumnTasks.findIndex((t) => t.id === activeId);
      if (oldIndex !== -1 && oldIndex !== finalIndex) {
        const reordered = arrayMove(originalColumnTasks, oldIndex, finalIndex);
        reorderColumnTasks(targetColumnId, targetBoardId, reordered);
        return;
      }
    }

    // Cross Column Moving
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
      autoScroll={{
        threshold: {
          x: 0.2, // 20% width from left/right edges triggers horizontal scrolling
          y: 0.15,
        },
        acceleration: 15,
        interval: 10,
      }}
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
            className="scale-105 rotate-2 shadow-2xl rounded-2xl ring-2 ring-orange-500/30 pointer-events-none transition-transform duration-75 select-none cursor-grabbing opacity-100"
          >
            <TaskCard
              task={activeTask}
              variant={activeDragVariant}
              inboxWidth={inboxWidth}
              isOverlay={true}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
