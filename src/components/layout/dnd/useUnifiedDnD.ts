import { useState } from "react";
import {
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
  CollisionDetection,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Column, ColumnId, Task } from "@/core/types/task";
import { useKanbanStore } from "@/core/stores/useKanbanStore";

export function useUnifiedDnD() {
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

  const columns = getActiveBoardColumns();

  const activeColumnTasks = activeColumn
    ? tasks
        .filter((t) => t.boardId === activeBoardId && t.columnId === activeColumn.id && t.columnId !== "inbox")
        .sort((a, b) => (a.orderKey > b.orderKey ? 1 : -1))
    : [];

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  const collisionDetectionStrategy: CollisionDetection = (args) => {
    if (args.active.data.current?.type === "Column") {
      // 只跟「欄位」比對：原本對所有 droppable 做 closestCenter，手機上一欄就佔滿畫面，
      // 拖到邊緣時最近的常是隔壁欄裡的卡片，over.id 變成任務 id，放開後排序直接被略過。
      const columnContainers = args.droppableContainers.filter((c) =>
        columns.some((col) => col.id === c.id)
      );
      // 以手指／游標的水平位置判定落在哪一欄；欄位 droppable 只量到卡片清單區，
      // 拖曳的是標頭，所以只看 x，不看 y。
      const pointerX = args.pointerCoordinates?.x;
      if (pointerX !== undefined) {
        const hit = columnContainers.find((c) => {
          const rect = args.droppableRects.get(c.id);
          return rect && pointerX >= rect.left && pointerX <= rect.left + rect.width;
        });
        if (hit) return [{ id: hit.id, data: { droppableContainer: hit, value: 0 } }];
      }
      return closestCenter({ ...args, droppableContainers: columnContainers });
    }

    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      const taskCollision = pointerCollisions.find(
        (c) => c.data?.droppableContainer?.data?.current?.type === "Task"
      );
      if (taskCollision) return [taskCollision];

      const columnCollision = pointerCollisions.find(
        (c) =>
          c.data?.droppableContainer?.data?.current?.type === "Column" ||
          c.id === "inbox" ||
          columns.some((col) => col.id === c.id)
      );
      if (columnCollision) return [columnCollision];

      return pointerCollisions;
    }

    const centerCollisions = closestCenter(args);
    if (centerCollisions.length > 0) return centerCollisions;

    return closestCorners(args);
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (!canCurrentUserEdit()) return;
    const { active } = event;

    if (active.data.current?.type === "Column") {
      const col =
        columns.find((c) => c.id === active.id) ||
        (active.data.current.column as Column);
      if (col) {
        if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.vibrate) {
          try { navigator.vibrate(30); } catch {}
        }
        setActiveColumn(col);
        setActiveTask(null);
        setActiveDragTaskId(col.id);
        setDragOverLocation(null);
      }
      return;
    }

    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.vibrate) {
        try { navigator.vibrate(30); } catch {}
      }
      setActiveTask(task);
      setActiveDragTaskId(task.id);
      setDragOverLocation(null);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (active.data.current?.type === "Column" || activeColumn) return;

    if (!over) {
      if (dragOverLocation !== null) setDragOverLocation(null);
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

    const isCrossColumn =
      activeTaskItem &&
      (activeTaskItem.columnId !== targetColumnId ||
        (targetColumnId !== "inbox" && activeTaskItem.boardId !== targetBoardId));

    let targetIndex = 0;

    if (isCrossColumn) {
      targetIndex = 0;
    } else {
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
        const activeTop = active.rect.current.translated?.top;
        const activeHeight = active.rect.current.translated?.height ?? 60;
        const overTop = over.rect.top;
        const overHeight = over.rect.height;
        if (activeTop !== undefined && overTop !== undefined && overHeight > 0) {
          const activeCenterY = activeTop + activeHeight / 2;
          const overThirdHeight = overHeight / 3;
          if (activeCenterY < overTop + overThirdHeight) {
            targetIndex = 0;
          } else {
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

    if (activeTaskItem.columnId === targetColumnId && (activeTaskItem.boardId === targetBoardId || targetColumnId === "inbox")) {
      const originalColumnTasks = tasks
        .filter((t) =>
          targetColumnId === "inbox"
            ? t.columnId === "inbox"
            : t.boardId === targetBoardId && t.columnId === targetColumnId
        )
        .sort((a, b) => (a.orderKey > b.orderKey ? 1 : -1));

      const oldIndex = originalColumnTasks.findIndex((t) => t.id === activeId);
      let newIndex = oldIndex;
      if (overTask) {
        const overIdx = originalColumnTasks.findIndex((t) => t.id === overId);
        if (overIdx >= 0) newIndex = overIdx;
      } else {
        newIndex = finalLocation?.index ?? originalColumnTasks.length;
      }

      if (oldIndex !== -1 && newIndex >= 0 && oldIndex !== newIndex) {
        const reordered = arrayMove(originalColumnTasks, oldIndex, newIndex);
        reorderColumnTasks(targetColumnId, targetBoardId, reordered);
        return;
      }
    }

    moveTask(activeId, targetColumnId, 0, false);
  };

  return {
    sensors,
    collisionDetectionStrategy,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    activeTask,
    activeColumn,
    activeColumnTasks,
  };
}
