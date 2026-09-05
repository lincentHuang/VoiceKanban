"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { getDueDateStatus } from "@/core/utils/dateUtils";
import { TRELLO_COLUMN_COLORS } from "@/core/types/task";
import { KanbanColumn } from "./KanbanColumn";
import { useBoardDragScroll } from "../hooks/useBoardDragScroll";
import { Plus, X, Check, Sparkles, ChevronRight, ChevronLeft } from "lucide-react";

const QUICK_ICONS = ["📋", "⚡", "⏳", "✅", "🚀", "💡", "🎯", "🔥", "📌", "⭐"];

export const KanbanContainer: React.FC = () => {
  const {
    tasks,
    activeBoardId,
    searchQuery,
    priorityFilter,
    tagFilter,
    getActiveBoardColumns,
    addColumnToActiveBoard,
    activeDragTaskId,
    setIsInboxSidebarOpen,
  } = useKanbanStore();

  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("✨");
  const [selectedColor, setSelectedColor] = useState("#3b82f6");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [edgeHoverSide, setEdgeHoverSide] = useState<"left" | "right" | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const addCardContainerRef = useRef<HTMLDivElement>(null);
  const touchStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const edgeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isDragging = activeDragTaskId !== null;

  // Desktop Mouse Drag Panning (Drag-to-Scroll)
  const {
    containerRef: scrollContainerRef,
    isPanning,
    handleMouseDown: handleCanvasMouseDown,
  } = useBoardDragScroll({ disabled: isDragging });

  const columns = getActiveBoardColumns();
  const columnIds = columns.map((col) => col.id);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isAddingColumn) {
      inputRef.current?.focus();
      // Scroll right to ensure add column input is visible
      if (addCardContainerRef.current) {
        addCardContainerRef.current.scrollIntoView({ behavior: "smooth", inline: "nearest" });
      }
    }
  }, [isAddingColumn]);

  // Smooth scroll to next or previous column centered
  const scrollMagnetToColumn = useCallback((direction: "next" | "prev") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const columnElements = Array.from(
      container.querySelectorAll<HTMLElement>("[data-column-id], [data-add-column-card]")
    );
    if (columnElements.length === 0) return;

    const containerWidth = container.clientWidth;
    const currentCenter = container.scrollLeft + containerWidth / 2;

    if (direction === "next") {
      // Find the first column whose center is to the right of current center
      const target = columnElements.find((el) => {
        const elCenter = el.offsetLeft + el.offsetWidth / 2;
        return elCenter > currentCenter + 30;
      });

      if (target) {
        const targetScrollLeft = Math.max(
          0,
          target.offsetLeft - (containerWidth - target.offsetWidth) / 2
        );
        container.scrollTo({ left: targetScrollLeft, behavior: "smooth" });
        if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.vibrate) {
          try {
            navigator.vibrate(25);
          } catch {}
        }
      }
    } else {
      // Find the first column to the left of current center
      const prevElements = [...columnElements].reverse();
      const target = prevElements.find((el) => {
        const elCenter = el.offsetLeft + el.offsetWidth / 2;
        return elCenter < currentCenter - 30;
      });

      if (target) {
        const targetScrollLeft = Math.max(
          0,
          target.offsetLeft - (containerWidth - target.offsetWidth) / 2
        );
        container.scrollTo({ left: targetScrollLeft, behavior: "smooth" });
        if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.vibrate) {
          try {
            navigator.vibrate(25);
          } catch {}
        }
      }
    }
  }, []);

  // Edge hover detector during drag (triggers magnet scroll after 450ms hover at edge)
  useEffect(() => {
    if (!isDragging) {
      if (edgeTimerRef.current) {
        clearTimeout(edgeTimerRef.current);
        edgeTimerRef.current = null;
      }
      setEdgeHoverSide(null);
      return;
    }

    const handlePointerMove = (e: PointerEvent) => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      // Check if pointer is within container Y bounds
      if (e.clientY < rect.top - 50 || e.clientY > rect.bottom + 50) {
        if (edgeTimerRef.current) {
          clearTimeout(edgeTimerRef.current);
          edgeTimerRef.current = null;
        }
        setEdgeHoverSide(null);
        return;
      }

      const edgeZoneWidth = Math.min(65, rect.width * 0.18);
      const isNearRight = e.clientX >= rect.right - edgeZoneWidth && e.clientX <= rect.right + 30;
      const isNearLeft = e.clientX <= rect.left + edgeZoneWidth && e.clientX >= rect.left - 30;

      if (isNearRight) {
        setEdgeHoverSide("right");
        if (!edgeTimerRef.current) {
          edgeTimerRef.current = setTimeout(() => {
            scrollMagnetToColumn("next");
            edgeTimerRef.current = null;
          }, 450); // 450ms responsive edge magnet
        }
      } else if (isNearLeft) {
        setEdgeHoverSide("left");
        if (!edgeTimerRef.current) {
          edgeTimerRef.current = setTimeout(() => {
            // If already at the far left edge on mobile, magnet switch to Inbox!
            if (isMobile && container.scrollLeft <= 15) {
              setIsInboxSidebarOpen(true);
              if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.vibrate) {
                try {
                  navigator.vibrate(25);
                } catch {}
              }
            } else {
              scrollMagnetToColumn("prev");
            }
            edgeTimerRef.current = null;
          }, 450);
        }
      } else {
        if (edgeTimerRef.current) {
          clearTimeout(edgeTimerRef.current);
          edgeTimerRef.current = null;
        }
        setEdgeHoverSide(null);
      }
    };

    const handlePointerUp = () => {
      if (edgeTimerRef.current) {
        clearTimeout(edgeTimerRef.current);
        edgeTimerRef.current = null;
      }
      setEdgeHoverSide(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      if (edgeTimerRef.current) {
        clearTimeout(edgeTimerRef.current);
        edgeTimerRef.current = null;
      }
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [isDragging, isMobile, scrollMagnetToColumn, setIsInboxSidebarOpen]);

  // Mobile Swipe Right from leftmost edge -> Switch to Inbox
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || isDragging) return;
    touchStartPosRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isMobile || isDragging) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    // Only switch to inbox if user is at the leftmost edge of the Kanban board
    if (container.scrollLeft <= 15) {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = endX - touchStartPosRef.current.x;
      const deltaY = endY - touchStartPosRef.current.y;

      // Swipe right (deltaX > 65) with horizontal dominance
      if (deltaX > 65 && Math.abs(deltaX) > Math.abs(deltaY) * 1.35) {
        setIsInboxSidebarOpen(true);
        if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.vibrate) {
          try {
            navigator.vibrate(20);
          } catch {}
        }
      }
    }
  };

  const handleAddColumnSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const title = newColumnTitle.trim();
    if (!title || isSubmitting) return;

    setIsSubmitting(true);
    try {
      addColumnToActiveBoard(title, selectedIcon, selectedColor);
      setNewColumnTitle("");
      setIsAddingColumn(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAdd = () => {
    setIsAddingColumn(false);
    setNewColumnTitle("");
  };

  // Filter tasks for the active board (Excluding global inbox which lives in sidebar)
  const boardTasks = tasks.filter((task) => {
    if (task.columnId === "inbox") return false; // Global inbox items live in dedicated sidebar
    if (task.boardId !== activeBoardId) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchTag = task.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTag) return false;
    }

    // Priority / Star filter
    if (priorityFilter === "high" && !task.isStarred) {
      return false;
    }

    // Tag filter (handles explicit tags AND dynamic urgency / overdue tags)
    if (tagFilter !== "all") {
      const dateStatus = getDueDateStatus(task.dueDate, task.completed);
      const isOverdueTag =
        (tagFilter === "逾期" || tagFilter === "緊急") &&
        dateStatus?.urgency === "overdue" &&
        !task.completed;
      const isDueSoonTag =
        (tagFilter === "即將到期" || tagFilter === "緊急") &&
        dateStatus?.urgency === "due-soon" &&
        !task.completed;
      const hasExplicitTag = task.tags?.includes(tagFilter);

      if (!hasExplicitTag && !isOverdueTag && !isDueSoonTag) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="relative w-full flex-1 min-h-0 overflow-hidden flex flex-col">
      {/* Visual Edge Hover Magnet Guide Overlays during Drag */}
      {isDragging && edgeHoverSide === "right" && (
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-orange-500/30 via-orange-500/10 to-transparent pointer-events-none flex items-center justify-end pr-2.5 z-40 animate-pulse">
          <div className="flex items-center gap-0.5 px-2 py-1 rounded-full bg-orange-600/90 text-white text-[11px] font-bold shadow-lg backdrop-blur-md">
            <span>下一個</span>
            <ChevronRight className="w-3.5 h-3.5 animate-ping" />
          </div>
        </div>
      )}

      {isDragging && edgeHoverSide === "left" && (
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-orange-500/30 via-orange-500/10 to-transparent pointer-events-none flex items-center justify-start pl-2.5 z-40 animate-pulse">
          <div className="flex items-center gap-0.5 px-2 py-1 rounded-full bg-orange-600/90 text-white text-[11px] font-bold shadow-lg backdrop-blur-md">
            <ChevronLeft className="w-3.5 h-3.5 animate-ping" />
            <span>上一個</span>
          </div>
        </div>
      )}

      {/* Main Kanban Horizontal Scroll Container with Mobile Scroll Snap & Desktop Drag Panning */}
      <div
        ref={scrollContainerRef}
        onMouseDown={handleCanvasMouseDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ scrollPadding: "0 1rem" }}
        className={`w-full flex-1 min-h-0 overflow-x-auto overflow-y-hidden px-4 sm:px-3 pt-2 pb-2 sm:pb-2.5 custom-scrollbar ${
          isPanning
            ? "cursor-grabbing select-none scroll-auto"
            : isDragging
            ? "cursor-default snap-none scroll-auto"
            : "cursor-grab snap-x snap-mandatory sm:snap-none scroll-smooth"
        }`}
      >
        {/* Kanban Horizontal Sortable Area */}
        <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
          <div className="flex gap-3 sm:gap-3.5 h-full min-w-max items-start">
            {columns.map((column) => {
              const columnTasks = boardTasks
                .filter((t) => t.columnId === column.id)
                .sort((a, b) => (a.orderKey > b.orderKey ? 1 : -1));

              return (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  tasks={columnTasks}
                />
              );
            })}

            {/* Rightmost: Add Column Card */}
            <div
              ref={addCardContainerRef}
              data-add-column-card="true"
              className="w-[84vw] max-w-[320px] min-w-[270px] sm:w-[270px] sm:min-w-[270px] sm:max-w-[270px] snap-center shrink-0"
            >
              {isAddingColumn ? (
                <form
                  onSubmit={handleAddColumnSubmit}
                  className="backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border-2 border-orange-400/90 dark:border-orange-500/80 rounded-2xl p-3.5 shadow-xl animate-in fade-in zoom-in-95 duration-150 relative overflow-hidden"
                >
                  <div
                    style={{ backgroundColor: selectedColor }}
                    className="absolute top-0 left-4 right-4 h-1 rounded-b-full shadow-xs"
                  />

                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                      新增狀態欄位
                    </span>
                    <button
                      type="button"
                      onClick={handleCancelAdd}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Column Name Input */}
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 mb-2.5">
                    <span className="text-sm">{selectedIcon}</span>
                    <input
                      ref={inputRef}
                      type="text"
                      value={newColumnTitle}
                      onChange={(e) => setNewColumnTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          handleCancelAdd();
                        }
                      }}
                      placeholder="輸入欄位名稱 (例如：待審核)..."
                      className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none font-semibold"
                    />
                  </div>

                  {/* Quick Icon Selector */}
                  <div className="mb-2.5">
                    <div className="text-[10px] font-bold text-slate-400 mb-1">選擇圖示</div>
                    <div className="flex items-center gap-1 flex-wrap py-0.5">
                      {QUICK_ICONS.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setSelectedIcon(icon)}
                          className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center transition-all cursor-pointer ${
                            selectedIcon === icon
                              ? "bg-orange-100 dark:bg-orange-950/60 border-2 border-orange-500 scale-110 font-bold"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Color Selector */}
                  <div className="mb-3">
                    <div className="text-[10px] font-bold text-slate-400 mb-1">欄位顏色</div>
                    <div className="flex items-center gap-1.5 flex-wrap py-1 px-0.5">
                      {TRELLO_COLUMN_COLORS.map((color) => (
                        <button
                          key={color.hex}
                          type="button"
                          onClick={() => setSelectedColor(color.hex)}
                          style={{ backgroundColor: color.hex }}
                          className={`w-5 h-5 rounded-full transition-transform shrink-0 cursor-pointer flex items-center justify-center border border-slate-300/80 dark:border-slate-600 ${
                            selectedColor?.toLowerCase() === color.hex.toLowerCase()
                              ? "scale-110 border-2 border-slate-900 dark:border-white shadow-xs"
                              : "opacity-85 hover:opacity-100 hover:scale-105"
                          }`}
                          title={color.name}
                        >
                          {selectedColor?.toLowerCase() === color.hex.toLowerCase() && (
                            <Check className="w-3 h-3 text-slate-800 stroke-[3]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={!newColumnTitle.trim() || isSubmitting}
                      className="flex-1 px-3 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold text-xs shadow-xs disabled:opacity-50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                      <span>建立欄位</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelAdd}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      取消
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingColumn(true)}
                  className="w-full py-4 px-3 rounded-2xl border border-white/25 hover:border-white/45 bg-white/30 hover:bg-white/22 text-slate-100 hover:text-white flex items-center justify-start gap-2 font-bold text-xs cursor-pointer transition-all duration-200 group shadow-md hover:shadow-lg backdrop-blur-xl"
                >
                  <div className="w-6 h-6 rounded-lg text-white flex items-center justify-center transition-colors">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span>新增欄位</span>
                </button>
              )}
            </div>
          </div>
        </SortableContext>
      </div>
    </div>
  );
};


