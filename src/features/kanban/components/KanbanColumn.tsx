"use client";

import React, { useState, useRef, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Column, Task, getColumnColorConfig } from "@/core/types/task";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { TaskCard } from "./TaskCard";
import { ColumnActionMenu } from "./ColumnActionMenu";
import { Plus, MoreHorizontal, CheckSquare, Mic, X, GripVertical } from "lucide-react";

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  isOverlay?: boolean;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, tasks, isOverlay = false }) => {
  const colorConfig = getColumnColorConfig(column.color);

  // Sortable for Column Reordering
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging: isColumnDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
    disabled: isOverlay,
  });

  // Droppable for Tasks inside this column
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
    disabled: isOverlay,
  });

  const {
    openAddTaskModal,
    openVoiceForColumn,
    isMultiSelectMode,
    toggleTaskSelection,
    selectedTaskIds,
    addTask,
    activeBoardId,
    dragOverLocation,
    activeDragTaskId,
  } = useKanbanStore();

  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const filteredTasks = isOverlay ? tasks : tasks.filter((t) => t.id !== activeDragTaskId);
  const taskIds = filteredTasks.map((t) => t.id);

  const isColumnOver = !isOverlay && dragOverLocation?.columnId === column.id;
  const insertIndex =
    isColumnOver && dragOverLocation
      ? Math.max(0, Math.min(dragOverLocation.index, filteredTasks.length))
      : -1;

  useEffect(() => {
    if (isAddingCard) {
      inputRef.current?.focus();
      // Scroll to bottom of column so the input is immediately visible
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    }
  }, [isAddingCard]);

  const handleVoiceAddClick = () => {
    openVoiceForColumn(column.id);
  };

  const handleManualAddClick = () => {
    openAddTaskModal(column.id);
  };

  const handleSelectAllInColumn = () => {
    tasks.forEach((t) => {
      if (!selectedTaskIds.includes(t.id)) {
        toggleTaskSelection(t.id);
      }
    });
  };

  const handleAddCardSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const title = newCardTitle.trim();
    if (!title || isSubmitting) return;

    setIsSubmitting(true);
    try {
      addTask({
        title,
        columnId: column.id,
        boardId: activeBoardId,
        completed: false,
        tags: [],
        dueDate: null,
      });
      setNewCardTitle("");
      setIsAddingCard(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAdd = () => {
    setIsAddingCard(false);
    setNewCardTitle("");
  };

  const columnStyle: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  // 1. Overlay Style (Matches TaskCard DragOverlay 100%: 3D tilt, shadow, real content)
  if (isOverlay) {
    return (
      <div className={`flex flex-col w-[270px] min-w-[270px] max-w-[270px] shrink-0 max-h-[500px] h-fit backdrop-blur-2xl border-2 border-orange-500 rounded-2xl p-3 shadow-2xl scale-105 rotate-2 relative overflow-hidden select-none cursor-grabbing pointer-events-none transition-transform duration-75 ${colorConfig.containerClass}`}>
        <div className="flex items-center justify-between px-1 py-1 shrink-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <GripVertical className="w-3.5 h-3.5 text-orange-500 shrink-0 -ml-0.5" />
            {column.icon && <span className="text-base shrink-0">{column.icon}</span>}
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-tight truncate">
              {column.title}
            </h3>
            <span className={`ml-0.5 px-2 py-0.5 rounded-full font-bold text-xs shadow-2xs shrink-0 ${colorConfig.badgeClass}`}>
              {tasks.length}
            </span>
          </div>
        </div>
        <div className="space-y-2 pr-1 custom-scrollbar min-h-0">
          {tasks.slice(0, 3).map((t) => (
            <TaskCard key={t.id} task={t} isOverlay={true} />
          ))}
          {tasks.length > 3 && (
            <div className="text-center py-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/70 rounded-xl">
              +{tasks.length - 3} 項卡片
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. Drop Slot Placeholder left on board during Column Drag (Solid luxury glass slot)
  if (isColumnDragging) {
    return (
      <div
        ref={setSortableRef}
        style={columnStyle}
        className="flex flex-col w-[270px] min-w-[270px] max-w-[270px] shrink-0 min-h-[220px] h-64 rounded-2xl border-2 border-dashed border-orange-400 bg-gradient-to-br from-orange-500/10 via-amber-500/10 to-orange-500/15 dark:from-orange-950/40 dark:to-amber-950/30 backdrop-blur-md p-3 flex items-center justify-center text-xs font-semibold text-orange-600 dark:text-orange-300 shadow-inner transition-all duration-150 animate-in fade-in zoom-in-95 pointer-events-none"
      >
        <span className="flex items-center gap-1.5 opacity-90">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
          放置於此
        </span>
      </div>
    );
  }

  return (
    <div
      ref={setSortableRef}
      style={columnStyle}
      className={`flex flex-col w-[270px] min-w-[270px] max-w-[270px] shrink-0 max-h-full h-fit backdrop-blur-xl border rounded-2xl p-3 shadow-md transition-all relative overflow-hidden group/col ${
        isColumnDragging
          ? "opacity-30 border-2 border-orange-500 scale-[0.98] shadow-2xl z-20"
          : isColumnOver
          ? "border-2 border-orange-400 bg-orange-50/70 dark:bg-orange-950/60"
          : colorConfig.containerClass
      }`}
    >
      {/* Column Header (Draggable Handle for Column Sorting) */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-between px-1 py-1 shrink-0 cursor-grab active:cursor-grabbing select-none transition-colors hover:bg-black/5 dark:hover:bg-white/5 rounded-xl"
        title="按住標頭可拖曳重新排列欄位順序"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <GripVertical className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover/col:text-slate-600 dark:group-hover/col:text-slate-300 transition-colors shrink-0 -ml-0.5" />
          {column.icon && <span className="text-base shrink-0">{column.icon}</span>}
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-tight truncate">
            {column.title}
          </h3>
          <span className={`ml-0.5 px-2 py-0.5 rounded-full font-bold text-xs shadow-2xs shrink-0 ${colorConfig.badgeClass}`}>
            {tasks.length}
          </span>
        </div>

        <div
          className="flex items-center gap-1 shrink-0"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* Select all in column */}
          {isMultiSelectMode && tasks.length > 0 && (
            <button
              onClick={handleSelectAllInColumn}
              className="p-1 rounded-lg bg-white/70 dark:bg-slate-800/80 hover:bg-orange-50 text-slate-500 hover:text-orange-600 transition-colors cursor-pointer border border-slate-200/50 dark:border-slate-700/50"
              title="全選此欄位"
            >
              <CheckSquare className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Column Action Hamburger Menu */}
          <ColumnActionMenu
            column={column}
            onAddTask={() => setIsAddingCard(true)}
          />
        </div>
      </div>

      {/* Cards Scrollable Droppable Container */}
      <div
        ref={(el) => {
          scrollContainerRef.current = el;
          setDroppableRef(el);
        }}
        className="flex-1 overflow-y-auto overflow-x-hidden space-y-2 pr-1 custom-scrollbar min-h-0"
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {filteredTasks.map((task, idx) => (
            <React.Fragment key={task.id}>
              {insertIndex === idx && (
                <div
                  key={`drop-slot-${column.id}-${idx}`}
                  className="h-16 w-full rounded-2xl border-2 border-dashed border-orange-400 bg-gradient-to-br from-orange-500/10 via-amber-500/10 to-orange-500/15 dark:from-orange-950/40 dark:to-amber-950/30 backdrop-blur-md my-1 flex items-center justify-center text-xs font-semibold text-orange-600 dark:text-orange-300 shadow-inner transition-all duration-150 animate-in fade-in zoom-in-95 pointer-events-none"
                >
                  <span className="flex items-center gap-1.5 opacity-90">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    放置於此
                  </span>
                </div>
              )}
              <TaskCard task={task} />
            </React.Fragment>
          ))}

          {filteredTasks.length > 0 && insertIndex === filteredTasks.length && (
            <div
              key={`drop-slot-${column.id}-end`}
              className="h-16 w-full rounded-2xl border-2 border-dashed border-orange-400 bg-gradient-to-br from-orange-500/10 via-amber-500/10 to-orange-500/15 dark:from-orange-950/40 dark:to-amber-950/30 backdrop-blur-md my-1 flex items-center justify-center text-xs font-semibold text-orange-600 dark:text-orange-300 shadow-inner transition-all duration-150 animate-in fade-in zoom-in-95 pointer-events-none"
            >
              <span className="flex items-center gap-1.5 opacity-90">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                放置於此
              </span>
            </div>
          )}
        </SortableContext>

        {/* Drop Highlight during Drag & Drop when column has 0 tasks */}
        {filteredTasks.length === 0 && isColumnOver && (
          <div
            key={`drop-slot-${column.id}-empty`}
            className="h-16 w-full rounded-2xl border-2 border-dashed border-orange-400 bg-gradient-to-br from-orange-500/10 via-amber-500/10 to-orange-500/15 dark:from-orange-950/40 dark:to-amber-950/30 backdrop-blur-md my-1 flex items-center justify-center text-xs font-semibold text-orange-600 dark:text-orange-300 shadow-inner transition-all duration-150 animate-in fade-in zoom-in-95 pointer-events-none"
          >
            <span className="flex items-center gap-1.5 opacity-90">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              放置於此
            </span>
          </div>
        )}

        {/* Inline Add Card Active Form (Matches Media 4) */}
        {isAddingCard && (
          <div className="pt-1 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-3 shadow-md border-2 border-blue-500/80">
              <textarea
                ref={inputRef}
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.nativeEvent.isComposing || e.key === "Process") return;
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddCardSubmit();
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    handleCancelAdd();
                  }
                }}
                placeholder="輸入標題或貼上連結"
                rows={2}
                className="w-full bg-transparent text-[16px] sm:text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 placeholder:font-normal focus:outline-none resize-none leading-snug"
                autoFocus
              />
            </div>
            <div className="flex items-center gap-2 mt-2 pb-1">
              <button
                type="button"
                onClick={() => handleAddCardSubmit()}
                disabled={!newCardTitle.trim() || isSubmitting}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-xs disabled:opacity-50 transition-colors flex items-center gap-1"
              >
                {isSubmitting ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : null}
                <span>新增卡片</span>
              </button>
              <button
                type="button"
                onClick={handleCancelAdd}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
                title="取消 (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Column Footer: Bottom Add Card & Voice Button Bar (Matches Media 3 & Media 4) */}
      {!isAddingCard && (
        <div className="pt-1.5 flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsAddingCard(true)}
            className="flex-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors text-left group cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-500 group-hover:text-slate-800 dark:group-hover:text-white" />
            <span>新增卡片</span>
          </button>

          <button
            type="button"
            onClick={handleVoiceAddClick}
            className="p-1.5 rounded-xl bg-orange-50/90 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/60 border border-orange-200/60 dark:border-orange-900/40 transition-colors shadow-2xs cursor-pointer"
            title={`在「${column.title}」使用語音模式新增`}
          >
            <Mic className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

