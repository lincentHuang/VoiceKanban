"use client";

import React, { useState, useRef, useEffect } from "react";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { KanbanColumn } from "./KanbanColumn";
import { useBoardDragScroll } from "../hooks/useBoardDragScroll";
import { useEdgeDragScroll } from "./kanban-container/useEdgeDragScroll";
import { KanbanEdgeOverlays } from "./kanban-container/KanbanEdgeOverlays";
import { AddColumnCard } from "./kanban-container/AddColumnCard";
import { useFilteredBoardTasks } from "./kanban-container/useFilteredBoardTasks";

export const KanbanContainer: React.FC = () => {
  const store = useKanbanStore();
  const {
    tasks, activeBoardId, searchQuery, priorityFilter, tagFilter,
    getActiveBoardColumns, addColumnToActiveBoard, activeDragTaskId, setIsInboxSidebarOpen,
  } = store;

  const [isMobile, setIsMobile] = useState(false);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const isDragging = activeDragTaskId !== null;

  const { containerRef: scrollRef, isPanning, handleMouseDown } = useBoardDragScroll({ disabled: isDragging });
  const { edgeHoverSide } = useEdgeDragScroll(isDragging, isMobile, scrollRef, () => setIsInboxSidebarOpen(true));

  const columns = getActiveBoardColumns();
  const columnIds = columns.map((col) => col.id);
  const boardTasks = useFilteredBoardTasks(tasks, activeBoardId, searchQuery, priorityFilter, tagFilter);

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
        className={`w-full flex-1 min-h-0 overflow-x-auto overflow-y-hidden px-4 sm:px-3 pt-2 pb-2 sm:pb-2.5 custom-scrollbar ${
          isPanning ? "cursor-grabbing select-none scroll-auto" : isDragging ? "cursor-default snap-none scroll-auto" : "cursor-grab snap-x snap-mandatory sm:snap-none scroll-smooth"
        }`}
      >
        <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
          <div className="flex gap-3 sm:gap-3.5 h-full min-w-max items-start">
            {columns.map((column) => {
              const colTasks = boardTasks.filter((t) => t.columnId === column.id).sort((a, b) => (a.orderKey > b.orderKey ? 1 : -1));
              return <KanbanColumn key={column.id} column={column} tasks={colTasks} />;
            })}
            <AddColumnCard onAddColumn={addColumnToActiveBoard} />
          </div>
        </SortableContext>
      </div>
    </div>
  );
};
