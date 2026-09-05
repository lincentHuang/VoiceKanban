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
import { Column, ColumnId, Task } from "@/core/types/task";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { SidebarInbox } from "@/features/inbox";
import { BoardCanvasContainer, KanbanColumn, TaskCard } from "@/features/kanban";

export const UnifiedDnDWorkspace: React.FC = () => {
  const {
    tasks,
    activeBoardId,
    moveTask,
    reorderColumnTasks,
    reorderBoardColumns,
    getActiveBoardColumns,
    setActiveDragTaskId,
    dragOverLocation,
    setDragOverLocation,
    canCurrentUserEdit,
  } = useKanbanStore();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const columns = getActiveBoardColumns();

  const activeColumnTasks = activeColumn
    ? tasks
        .filter((t) => t.boardId === activeBoardId && t.columnId === activeColumn.id && t.columnId !== "inbox")
        .sort((a, b) => (a.orderKey > b.orderKey ? 1 : -1))
    : [];

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
  // 1. If dragging Column: use closestCenter directly across columns
  // 2. If dragging Task: prioritize task pointer hits, then column containers, then monotonic closestCenter
  const collisionDetectionStrategy: CollisionDetection = (args) => {
    if (args.active.data.current?.type === "Column") {
      return closestCenter(args);
    }

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
    if (!canCurrentUserEdit()) {
      return;
    }
    const { active } = event;

    // 1. Column Drag Start
    if (active.data.current?.type === "Column") {
      const col =
        columns.find((c) => c.id === active.id) ||
        (active.data.current.column as Column);
      if (col) {
        if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.vibrate) {
          try {
            navigator.vibrate(30);
          } catch {}
        }
        setActiveColumn(col);
        setActiveTask(null);
        setActiveDragTaskId(col.id);
        setDragOverLocation(null);
      }
      return;
    }

    // 2. Task Drag Start
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate(30);
        } catch {}
      }

      setActiveTask(task);
      setActiveDragTaskId(task.id);
      setDragOverLocation(null);
    }
  };

  // Real-time slot gap / placeholder when dragging across columns or inside column
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (active.data.current?.type === "Column" || activeColumn) {
      return;
    }

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

    const activeTaskItem = tasks.find((t) => t.id === activeId);
    const targetBoardId = targetColumnId === "inbox" ? "global" : activeBoardId;

    // Check if dragging across columns
    const isCrossColumn =
      activeTaskItem &&
      (activeTaskItem.columnId !== targetColumnId ||
        (targetColumnId !== "inbox" && activeTaskItem.boardId !== targetBoardId));

    let targetIndex = 0;

    if (isCrossColumn) {
      // 跨欄拖曳時：預覽位置固定在第一個 (index 0)
      targetIndex = 0;
    } else {
      // 同欄拖曳：原有精確計算邏輯
      const targetColumnTasks = tasks
        .filter((t) =>
          targetColumnId === "inbox"
            ? t.columnId === "inbox" && t.id !== activeId
            : t.boardId === targetBoardId && t.columnId === targetColumnId && t.id !== activeId
        )
        .sort((a, b) => (a.orderKey > b.orderKey ? 1 : -1));

      targetIndex = targetColumnTasks.length;

      if (overTask && overId !== activeId) {
        const overIndex = targetColumnTasks.findIndex((t) => t.id === overId);
        if (overIndex >= 0) {
          const activeTop = active.rect.current.translated?.top;
          const activeHeight = active.rect.current.translated?.height ?? 60;
          const overTop = over.rect.top;
          const overHeight = over.rect.height;

          let isBelow = false;
          if (activeTop !== undefined && overTop !== undefined && overHeight > 0) {
            const activeCenterY = activeTop + activeHeight / 2;
            const overCenterY = overTop + overHeight / 2;
            isBelow = activeCenterY > overCenterY;
          }

          targetIndex = isBelow ? overIndex + 1 : overIndex;
        }
      } else if (isOverColumn && targetColumnTasks.length > 0) {
        // If hovering directly over column container area (e.g. header padding or bottom empty zone)
        const activeTop = active.rect.current.translated?.top;
        const activeHeight = active.rect.current.translated?.height ?? 60;
        const overTop = over.rect.top;
        const overHeight = over.rect.height;
        if (activeTop !== undefined && overTop !== undefined && overHeight > 0) {
          const activeCenterY = activeTop + activeHeight / 2;
          const overThirdHeight = overHeight / 3;
          if (activeCenterY < overTop + overThirdHeight) {
            // Near top of column -> index 0
            targetIndex = 0;
          } else if (activeCenterY > overTop + overHeight - overThirdHeight) {
            // Near bottom of column -> column end
            targetIndex = targetColumnTasks.length;
          } else {
            // Middle of column -> use closest task
            targetIndex = targetColumnTasks.length;
          }
        }
      }

      targetIndex = Math.max(0, Math.min(targetIndex, targetColumnTasks.length));
    }

    if (
      dragOverLocation?.columnId !== targetColumnId ||
      dragOverLocation?.index !== targetIndex
    ) {
      setDragOverLocation({ columnId: targetColumnId, index: targetIndex });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // 1. Column Drag End
    if (active.data.current?.type === "Column" || activeColumn) {
      const activeColId = active.id as string;
      setActiveColumn(null);
      if (over && over.id !== activeColId) {
        const oldIndex = columns.findIndex((c) => c.id === activeColId);
        const newIndex = columns.findIndex((c) => c.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const newColumns = arrayMove(columns, oldIndex, newIndex);
          reorderBoardColumns(activeBoardId, newColumns);
        }
      }
      return;
    }

    // 2. Task Drag End
    const finalLocation = dragOverLocation;
    setActiveTask(null);
    setActiveDragTaskId(null);
    setDragOverLocation(null);

    if (!over && !finalLocation) return;

    const activeId = active.id as string;
    const overId = over?.id as string | undefined;

    const activeTaskItem = tasks.find((t) => t.id === activeId);
    if (!activeTaskItem) return;

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
    if (activeTaskItem.columnId === targetColumnId && (activeTaskItem.boardId === targetBoardId || targetColumnId === "inbox")) {
      const originalColumnTasks = tasks
        .filter((t) =>
          targetColumnId === "inbox"
            ? t.columnId === "inbox"
            : t.boardId === targetBoardId && t.columnId === targetColumnId
        )
        .sort((a, b) => (a.orderKey > b.orderKey ? 1 : -1));

      const oldIndex = originalColumnTasks.findIndex((t) => t.id === activeId);

      // Use the over item's direct index in the original array (standard dnd-kit pattern).
      // This matches SortableContext's visual displacement exactly and avoids
      // the off-by-one from dragOverLocation (which uses a filtered N-1 array).
      let newIndex = oldIndex;
      if (overTask) {
        const overIdx = originalColumnTasks.findIndex((t) => t.id === overId);
        if (overIdx >= 0) {
          newIndex = overIdx;
        }
      } else {
        // Dropped over column container empty area (top/bottom) — use dragOverLocation
        newIndex = finalIndex;
      }

      if (oldIndex !== -1 && newIndex >= 0 && oldIndex !== newIndex) {
        const reordered = arrayMove(originalColumnTasks, oldIndex, newIndex);
        reorderColumnTasks(targetColumnId, targetBoardId, reordered);
        return;
      }
    }

    // Cross Column Moving: Always move to top (first position)
    moveTask(activeId, targetColumnId, 0, false);
  };

  if (!isMounted) {
    return (
      <div className="flex-1 min-h-0 w-full flex p-2.5 sm:p-3 items-start overflow-hidden gap-3">
        <SidebarInbox />
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
          x: 0, // Disable continuous horizontal auto-scroll so drag is rock solid without jitter
          y: 0.15, // Keep vertical auto-scroll for cards within column
        },
        acceleration: 15,
        interval: 10,
      }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 min-h-0 w-full flex p-2.5 sm:p-3 items-start overflow-hidden gap-3 relative">
        {/* Left Container: Global Inbox Fixed Sidebar */}
        <SidebarInbox />

        {/* Right Container: Trello Board Canvas Container */}
        <BoardCanvasContainer />
      </div>

      {/* Drag Overlay for smooth 60fps ghost card/column under cursor with pure GPU scale */}
      <DragOverlay
        dropAnimation={{
          duration: 180,
          easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
        }}
      >
        {activeColumn ? (
          <KanbanColumn
            column={activeColumn}
            tasks={activeColumnTasks}
            isOverlay={true}
          />
        ) : activeTask ? (
          <div
            style={{
              width: activeTask.columnId === "inbox" ? "294px" : "246px",
              transformOrigin: "center center",
            }}
            className="scale-105 rotate-2 shadow-2xl rounded-2xl border-2 border-orange-500 pointer-events-none transition-transform duration-75 select-none cursor-grabbing opacity-100"
          >
            <TaskCard
              task={activeTask}
              variant="card"
              inboxWidth={320}
              isOverlay={true}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

