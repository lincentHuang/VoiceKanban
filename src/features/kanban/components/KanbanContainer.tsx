"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { KanbanColumn } from "./KanbanColumn";
import { useBoardDragScroll } from "../hooks/useBoardDragScroll";
import { useEdgeDragScroll } from "./kanban-container/useEdgeDragScroll";
import { KanbanEdgeOverlays } from "./kanban-container/KanbanEdgeOverlays";
import { AddColumnCard } from "./kanban-container/AddColumnCard";
import { useFilteredBoardTasks } from "./kanban-container/useFilteredBoardTasks";

export const KanbanContainer: React.FC = () => {
  // 逐項訂閱，不要整包 useKanbanStore()：否則任何一個旗標改變（例如打開收件匣）
  // 都會讓整個看板連同每一張卡同步重畫，擋住動畫的第一幀。
  const tasks = useKanbanStore((s) => s.tasks);
  const activeBoardId = useKanbanStore((s) => s.activeBoardId);
  const searchQuery = useKanbanStore((s) => s.searchQuery);
  const priorityFilter = useKanbanStore((s) => s.priorityFilter);
  const tagFilter = useKanbanStore((s) => s.tagFilter);
  const activeDragTaskId = useKanbanStore((s) => s.activeDragTaskId);
  const addColumnToActiveBoard = useKanbanStore((s) => s.addColumnToActiveBoard);
  const setIsInboxSidebarOpen = useKanbanStore((s) => s.setIsInboxSidebarOpen);
  const getActiveBoardColumns = useKanbanStore((s) => s.getActiveBoardColumns);

  // 只訂閱「目前看板的 columns 陣列參考」，它不變就不重新推導欄位，
  // 推導邏輯仍然留在 store 裡，避免兩份實作走鐘。
  const rawColumns = useKanbanStore((s) => s.boards.find((b) => b.id === s.activeBoardId)?.columns);
  const columns = useMemo(() => getActiveBoardColumns(), [getActiveBoardColumns, rawColumns]);

  const [isMobile, setIsMobile] = useState(false);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const isDragging = activeDragTaskId !== null;

  const { containerRef: scrollRef, isPanning, handleMouseDown } = useBoardDragScroll({ disabled: isDragging });
  const { edgeHoverSide } = useEdgeDragScroll(isDragging, isMobile, scrollRef, () => setIsInboxSidebarOpen(true));

  const columnIds = useMemo(() => columns.map((col) => col.id), [columns]);
  const boardTasks = useFilteredBoardTasks(tasks, activeBoardId, searchQuery, priorityFilter, tagFilter);

  // 一次分組，取代每欄各掃一次 boardTasks 的 O(欄位數 × 任務數)
  const tasksByColumn = useMemo(() => {
    const grouped = new Map<string, typeof boardTasks>();
    for (const t of boardTasks) {
      const bucket = grouped.get(t.columnId);
      if (bucket) bucket.push(t);
      else grouped.set(t.columnId, [t]);
    }
    for (const bucket of grouped.values()) {
      bucket.sort((a, b) => (a.orderKey > b.orderKey ? 1 : -1));
    }
    return grouped;
  }, [boardTasks]);

  const EMPTY_TASKS = useMemo(() => [], []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || isDragging) return;
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isMobile || isDragging || !scrollRef.current) return;
    if (scrollRef.current.scrollLeft <= 15) {
      const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
      const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
      if (dx > 65 && Math.abs(dx) > Math.abs(dy) * 1.35) {
        setIsInboxSidebarOpen(true);
        if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.vibrate) {
          try { navigator.vibrate(20); } catch {}
        }
      }
    }
  };

  return (
    <div className="relative w-full flex-1 min-h-0 overflow-hidden flex flex-col">
      <KanbanEdgeOverlays isDragging={isDragging} edgeHoverSide={edgeHoverSide} />
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ scrollPadding: "0 1rem" }}
        // 這裡刻意不加 scroll-smooth：scroll-behavior: smooth 會讓 snap 回彈與
        // useBoardDragScroll 的慣性 scrollLeft 指派再被瀏覽器動畫一次，手感會變黏。
        className={`w-full flex-1 min-h-0 overflow-x-auto overflow-y-hidden px-4 sm:px-3 pt-2 pb-2 sm:pb-2.5 custom-scrollbar ${
          isPanning ? "cursor-grabbing select-none" : isDragging ? "cursor-default snap-none" : "cursor-grab snap-x snap-mandatory sm:snap-none"
        }`}
      >
        <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
          <div className="flex gap-3 sm:gap-3.5 h-full min-w-max items-start">
            {columns.map((column) => (
              <KanbanColumn key={column.id} column={column} tasks={tasksByColumn.get(column.id) ?? EMPTY_TASKS} />
            ))}
            <AddColumnCard onAddColumn={addColumnToActiveBoard} />
          </div>
        </SortableContext>
      </div>
    </div>
  );
};
