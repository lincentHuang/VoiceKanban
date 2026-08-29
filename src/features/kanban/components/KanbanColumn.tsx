"use client";

import React, { useState, useRef, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Column, Task } from "@/core/types/task";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { TaskCard } from "./TaskCard";
import { ColumnActionMenu } from "./ColumnActionMenu";
import { Plus, MoreHorizontal, CheckSquare, Mic, X } from "lucide-react";

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, tasks }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
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

  const filteredTasks = tasks.filter((t) => t.id !== activeDragTaskId);
  const taskIds = filteredTasks.map((t) => t.id);

  const isColumnOver = dragOverLocation?.columnId === column.id;
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
      // Keep focus for continuous adding
      setTimeout(() => {
        inputRef.current?.focus();
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
      }, 50);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAdd = () => {
    setIsAddingCard(false);
    setNewCardTitle("");
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-[270px] min-w-[270px] max-w-[270px] shrink-0 max-h-full h-fit backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border rounded-2xl p-3 shadow-md transition-all relative overflow-hidden ${
        isColumnOver
          ? "border-orange-400 bg-orange-50/70 dark:bg-orange-950/60 ring-2 ring-orange-400/30"
          : "border-slate-200/80 dark:border-slate-800"
      }`}
    >
      {/* Optional Top Color Accent Line */}
      {column.color && (
        <div
          style={{ backgroundColor: column.color }}
          className="absolute top-0 left-4 right-4 h-1 rounded-b-full shadow-xs"
        />
      )}

      {/* Column Header (Fixed shrink-0, top "+" removed as requested) */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60 dark:border-slate-800/60 px-1 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-base">{column.icon}</span>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-tight truncate">
            {column.title}
          </h3>
          <span className="ml-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs shadow-2xs">
            {tasks.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Select all in column */}
          {isMultiSelectMode && tasks.length > 0 && (
            <button
              onClick={handleSelectAllInColumn}
              className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 text-slate-500 hover:text-orange-600 transition-colors"
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

      {/* Cards Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden space-y-2 pr-1 custom-scrollbar min-h-0"
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {filteredTasks.map((task, idx) => (
            <React.Fragment key={task.id}>
              {insertIndex === idx && (
                <div
                  key={`drop-slot-${column.id}-${idx}`}
                  className="h-16 w-full rounded-2xl border-2 border-dashed border-orange-400 bg-orange-50/80 dark:bg-orange-950/50 dark:border-orange-500/70 my-1 flex items-center justify-center text-xs font-semibold text-orange-600 dark:text-orange-300 shadow-inner transition-all duration-150 animate-in fade-in zoom-in-95 pointer-events-none"
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
              className="h-16 w-full rounded-2xl border-2 border-dashed border-orange-400 bg-orange-50/80 dark:bg-orange-950/50 dark:border-orange-500/70 my-1 flex items-center justify-center text-xs font-semibold text-orange-600 dark:text-orange-300 shadow-inner transition-all duration-150 animate-in fade-in zoom-in-95 pointer-events-none"
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
            className="h-16 w-full rounded-2xl border-2 border-dashed border-orange-400 bg-orange-50/80 dark:bg-orange-950/50 dark:border-orange-500/70 my-1 flex items-center justify-center text-xs font-semibold text-orange-600 dark:text-orange-300 shadow-inner transition-all duration-150 animate-in fade-in zoom-in-95 pointer-events-none"
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
            <div className="bg-white dark:bg-slate-800/90 rounded-xl p-2.5 shadow-sm border border-blue-400/80 dark:border-blue-500/60 ring-2 ring-blue-500/20">
              <textarea
                ref={inputRef}
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                onKeyDown={(e) => {
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
                className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed"
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
        <div className="pt-2 mt-1 border-t border-slate-100/60 dark:border-slate-800/80 flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsAddingCard(true)}
            className="flex-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white transition-colors text-left group"
          >
            <Plus className="w-4 h-4 text-slate-500 group-hover:text-slate-800 dark:group-hover:text-white" />
            <span>新增卡片</span>
          </button>

          <button
            type="button"
            onClick={handleVoiceAddClick}
            className="p-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/60 border border-orange-200/60 dark:border-orange-900/40 transition-colors shadow-2xs"
            title={`在「${column.title}」使用語音模式新增`}
          >
            <Mic className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

