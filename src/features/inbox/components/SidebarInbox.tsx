"use client";

import React, { useState, useEffect, useRef } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { TaskCard } from "@/features/kanban";
import {
  Inbox,
  Plus,
  MoreHorizontal,
  ChevronLeft,
  ArrowUpDown,
  Settings,
  Mic,
  CheckSquare,
  X,
  Check,
} from "lucide-react";

export const SidebarInbox: React.FC = () => {
  const {
    tasks,
    addToInbox,
    isInboxSidebarOpen,
    setIsInboxSidebarOpen,
    inboxWidth,
    isDraggingSplitter,
    setIsVoiceOverlayOpen,
    setVoiceState,
    setIsSettingsModalOpen,
    dragOverLocation,
    activeDragTaskId,
    isMultiSelectMode,
    setIsMultiSelectMode,
    selectedTaskIds,
    selectAllTasksInInbox,
    clearSelection,
    setViewMode,
  } = useKanbanStore();

  const [newTitle, setNewTitle] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [inboxSort, setInboxSort] = useState<"date" | "priority" | "title">("date");
  const [isMobile, setIsMobile] = useState(false);

  const touchStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingTask = activeDragTaskId !== null;
  const edgeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Drag near right edge -> magnet switch to Kanban on mobile
  useEffect(() => {
    if (!isDraggingTask || !isMobile) {
      if (edgeTimerRef.current) {
        clearTimeout(edgeTimerRef.current);
        edgeTimerRef.current = null;
      }
      return;
    }

    const handlePointerMove = (e: PointerEvent) => {
      const isNearRightEdge = e.clientX >= window.innerWidth - 50;
      if (isNearRightEdge) {
        if (!edgeTimerRef.current) {
          edgeTimerRef.current = setTimeout(() => {
            setIsInboxSidebarOpen(false);
            setViewMode("kanban");
            if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.vibrate) {
              try {
                navigator.vibrate(25);
              } catch {}
            }
            edgeTimerRef.current = null;
          }, 450); // 450ms edge magnet
        }
      } else {
        if (edgeTimerRef.current) {
          clearTimeout(edgeTimerRef.current);
          edgeTimerRef.current = null;
        }
      }
    };

    const handlePointerUp = () => {
      if (edgeTimerRef.current) {
        clearTimeout(edgeTimerRef.current);
        edgeTimerRef.current = null;
      }
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
  }, [isDraggingTask, isMobile, setIsInboxSidebarOpen, setViewMode]);

  // Mobile Swipe Left gesture -> Switch to Kanban
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || isDraggingTask) return;
    touchStartPosRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isMobile || isDraggingTask) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - touchStartPosRef.current.x;
    const deltaY = endY - touchStartPosRef.current.y;

    // Swipe left (deltaX < -65) with horizontal dominance (|deltaX| > |deltaY| * 1.35)
    if (deltaX < -65 && Math.abs(deltaX) > Math.abs(deltaY) * 1.35) {
      setIsInboxSidebarOpen(false);
      setViewMode("kanban");
      if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate(20);
        } catch {}
      }
    }
  };

  const { setNodeRef, isOver } = useDroppable({
    id: "inbox",
    data: {
      type: "Column",
      column: { id: "inbox", title: "收件匣" },
    },
  });

  // Global Inbox tasks (strictly columnId === "inbox")
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

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addToInbox(newTitle.trim());
    setNewTitle("");
  };

  const handleVoiceAdd = () => {
    setVoiceState("recording");
    setIsVoiceOverlayOpen(true);
  };

  if (!isMobile && !isInboxSidebarOpen) {
    return null;
  }

  const selectedInboxCount = inboxTasks.filter((t) => selectedTaskIds.includes(t.id)).length;

  return (
    <aside
      ref={setNodeRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ width: isMobile ? undefined : `${inboxWidth}px` }}
      className={`h-full sm:w-auto shrink-0 flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xl p-3 sm:p-3.5 overflow-hidden transition-all duration-300 ease-out ${
        isMobile
          ? `absolute inset-2.5 z-20 ${
              isInboxSidebarOpen
                ? "translate-x-0 opacity-100 pointer-events-auto shadow-2xl"
                : "-translate-x-[calc(100%+1rem)] opacity-0 pointer-events-none"
            }`
          : "relative opacity-100 pointer-events-auto w-auto"
      } ${isDraggingSplitter ? "transition-none select-none" : ""} ${
        isOver
          ? "border-2 border-blue-500 bg-blue-50/50 dark:bg-blue-950/40"
          : ""
      }`}
    >
      {/* Inbox Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60 dark:border-slate-800/60 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shadow-2xs">
            <Inbox className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-tight">
                收件匣
              </h2>
              <span className="px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-black text-[10px]">
                {inboxTasks.length}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Multi-Select Toggle Button */}
          <button
            onClick={() => setIsMultiSelectMode(!isMultiSelectMode)}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${isMultiSelectMode
              ? "bg-orange-500 text-white shadow-xs"
              : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700"
              }`}
            title="多選模式"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span className="text-[11px] hidden sm:inline-block">多選</span>
            {selectedInboxCount > 0 && (
              <span className="w-3.5 h-3.5 rounded-full bg-white text-orange-600 text-[9px] font-black flex items-center justify-center">
                {selectedInboxCount}
              </span>
            )}
          </button>

          {/* Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 transition-colors"
              title="收件匣選項"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in">
                <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  排序方式
                </div>
                <button
                  onClick={() => {
                    setInboxSort("date");
                    setIsMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-2 ${inboxSort === "date"
                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 font-bold"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>依建立時間</span>
                </button>
                <button
                  onClick={() => {
                    setInboxSort("priority");
                    setIsMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-2 ${inboxSort === "priority"
                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 font-bold"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>依重要程度</span>
                </button>

                <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1">
                  <button
                    onClick={() => {
                      setIsSettingsModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>語音與 API 設定</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Multi-Select Sub-Bar when active */}
      {isMultiSelectMode && (
        <div className="mt-2 px-2.5 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50 flex items-center justify-between text-xs animate-in fade-in duration-150 shrink-0">
          <span className="font-semibold text-orange-800 dark:text-orange-300 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-orange-600" />
            <span>已選取 {selectedInboxCount} 項</span>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={selectAllTasksInInbox}
              className="px-2 py-0.5 rounded-lg bg-orange-100 dark:bg-orange-900/60 text-orange-700 dark:text-orange-200 font-bold hover:bg-orange-200 text-[11px]"
            >
              全選收件匣
            </button>
            <button
              onClick={() => {
                clearSelection();
                setIsMultiSelectMode(false);
              }}
              className="p-0.5 rounded-lg text-slate-400 hover:text-slate-700"
              title="關閉多選"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Input Bar */}
      <div className="mt-2.5 shrink-0">
        <form onSubmit={handleQuickAdd} className="relative">
          <input
            type="text"
            placeholder="記錄新想法（口述或輸入）..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full pl-3 pr-16 py-2 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 text-xs border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-850 focus:outline-none transition-all placeholder:text-slate-400"
          />

          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="button"
              onClick={handleVoiceAdd}
              className="p-1 rounded-lg text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/40"
              title="語音快速輸入"
            >
              <Mic className="w-3.5 h-3.5" />
            </button>

            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="p-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* Cards List in Inbox (Droppable & Sortable with Adaptive Row Layout & Drop Insertion Slot) */}
      <div className={`flex-1 overflow-y-auto overflow-x-hidden my-2.5 pr-1 pb-13 sm:pb-14 custom-scrollbar min-h-0 ${!isMobile && inboxWidth >= 420 ? "space-y-2" : "space-y-2.5"}`}>
        <SortableContext items={inboxTaskIds} strategy={isCrossColumnDrag ? () => null : verticalListSortingStrategy}>
          {visibleInboxTasks.map((task, idx) => (
            <React.Fragment key={task.id}>
              {insertIndex === idx && (
                <div
                  key={`drop-slot-inbox-${idx}`}
                  className="h-12 w-full rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 border-2 border-dashed border-slate-300 dark:border-slate-600 my-1 animate-in fade-in duration-100 flex items-center justify-center text-xs font-semibold text-slate-500 dark:text-slate-400 select-none shadow-2xs pointer-events-none"
                >
                  <span className="flex items-center gap-1.5 opacity-80">
                    <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 animate-pulse" />
                    放入收件匣
                  </span>
                </div>
              )}
              <TaskCard
                task={task}
                variant={!isMobile && inboxWidth >= 420 ? "row" : "card"}
                inboxWidth={isMobile ? 360 : inboxWidth}
              />
            </React.Fragment>
          ))}

          {visibleInboxTasks.length > 0 && insertIndex >= visibleInboxTasks.length && (
            <div
              key="drop-slot-inbox-end"
              className="h-12 w-full rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 border-2 border-dashed border-slate-300 dark:border-slate-600 my-1 animate-in fade-in duration-100 flex items-center justify-center text-xs font-semibold text-slate-500 dark:text-slate-400 select-none shadow-2xs pointer-events-none"
            >
              <span className="flex items-center gap-1.5 opacity-80">
                <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 animate-pulse" />
                放入收件匣
              </span>
            </div>
          )}
        </SortableContext>

        {visibleInboxTasks.length === 0 && (
          <div
            className={`h-36 border-2 rounded-2xl flex flex-col items-center justify-center text-xs gap-1.5 p-4 text-center transition-all duration-200 ${isInboxOver
              ? "border-2 border-slate-400 bg-slate-100/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 shadow-inner"
              : "border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 text-slate-400"
              }`}
          >
            {isInboxOver ? (
              <>
                <span className="font-bold text-sm">📥 放開以移至收件匣</span>
                <p className="text-[11px] text-blue-500/80">卡片將存入收件匣</p>
              </>
            ) : (
              <>
                <span>收件匣已清空 ✨</span>
                <p className="text-[11px] text-slate-400">可將外部卡片拖曳入此暫存，或直接語音輸入</p>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
