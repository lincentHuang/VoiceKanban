"use client";

import React, { useState, useRef, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Column, Task, getColumnColorConfig } from "@/core/types/task";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { TaskCard } from "./TaskCard";
import { ColumnActionMenu } from "./ColumnActionMenu";
import { ColumnIconPicker } from "./ColumnIconPicker";
import { Plus, MoreHorizontal, CheckSquare, Mic, X, GripVertical, CheckCircle2, ChevronDown, ChevronUp, Pencil, SmilePlus } from "lucide-react";

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  isOverlay?: boolean;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, tasks, isOverlay = false }) => {
  const colorConfig = getColumnColorConfig(column.color);

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
    updateColumnInActiveBoard,
    canCurrentUserEdit,
  } = useKanbanStore();

  const canEdit = canCurrentUserEdit();

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
    disabled: isOverlay || !canEdit,
  });

  // Droppable for Tasks inside this column
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
    disabled: isOverlay || !canEdit,
  });

  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(false);

  // Column Title Inline Editing State
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(column.title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditingTitle) {
      setTitleInput(column.title);
    }
  }, [column.title, isEditingTitle]);

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditingTitle]);

  const handleSaveTitle = () => {
    const trimmed = titleInput.trim();
    if (trimmed && trimmed !== column.title) {
      updateColumnInActiveBoard(column.id, trimmed);
    } else {
      setTitleInput(column.title);
    }
    setIsEditingTitle(false);
  };

  const handleCancelTitle = () => {
    setTitleInput(column.title);
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleSaveTitle();
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      handleCancelTitle();
    }
  };

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Partition tasks into uncompleted and completed
  const uncompletedTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const isColumnOver = !isOverlay && dragOverLocation?.columnId === column.id;

  // Determine if the drag is cross-column (item from another column hovering here)
  const isCrossColumnDrag = isColumnOver && activeDragTaskId && !uncompletedTasks.some(t => t.id === activeDragTaskId) && !completedTasks.some(t => t.id === activeDragTaskId);

  const visibleActiveTasks = isOverlay
    ? uncompletedTasks
    : isCrossColumnDrag
      ? uncompletedTasks.filter((t) => t.id !== activeDragTaskId)
      : uncompletedTasks;
  const visibleCompletedTasks = isOverlay
    ? completedTasks
    : isCrossColumnDrag
      ? completedTasks.filter((t) => t.id !== activeDragTaskId)
      : completedTasks;

  // Rendered tasks in DOM
  const renderedTasks = isCompletedExpanded
    ? [...visibleActiveTasks, ...visibleCompletedTasks]
    : visibleActiveTasks;
  const taskIds = renderedTasks.map((t) => t.id);

  const insertIndex =
    isCrossColumnDrag && dragOverLocation
      ? Math.max(0, Math.min(dragOverLocation.index, visibleActiveTasks.length))
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
              {uncompletedTasks.length}
            </span>
          </div>
        </div>
        <div className="space-y-2 pr-1 custom-scrollbar min-h-0">
          {uncompletedTasks.slice(0, 3).map((t) => (
            <TaskCard key={t.id} task={t} isOverlay={true} />
          ))}
          {uncompletedTasks.length > 3 && (
            <div className="text-center py-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/70 rounded-xl">
              +{uncompletedTasks.length - 3} 項卡片
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
        className="flex flex-col w-[84vw] max-w-[320px] min-w-[270px] sm:w-[270px] sm:min-w-[270px] sm:max-w-[270px] snap-center shrink-0 min-h-[220px] h-64 rounded-2xl border-2 border-dashed border-orange-400 bg-gradient-to-br from-orange-500/10 via-amber-500/10 to-orange-500/15 dark:from-orange-950/40 dark:to-amber-950/30 backdrop-blur-md p-3 flex items-center justify-center text-xs font-semibold text-orange-600 dark:text-orange-300 shadow-inner transition-all duration-150 animate-in fade-in zoom-in-95 pointer-events-none"
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
      data-column-id={column.id}
      className={`flex flex-col w-[84vw] max-w-[320px] min-w-[270px] sm:w-[270px] sm:min-w-[270px] sm:max-w-[270px] snap-center shrink-0 max-h-full h-fit backdrop-blur-xl border rounded-2xl p-3 shadow-md transition-all relative overflow-hidden group/col ${isColumnDragging
          ? "opacity-30 border-2 border-orange-500 scale-[0.98] shadow-2xl z-20"
          : colorConfig.containerClass
        }`}
    >
      {/* Column Header (Draggable Handle for Column Sorting) */}
      <div
        {...attributes}
        {...listeners}
        data-column-header="true"
        className="flex items-center justify-between px-1 py-1 shrink-0 cursor-grab active:cursor-grabbing select-none transition-colors hover:bg-black/5 dark:hover:bg-white/5 rounded-xl"
        title="按住標頭可拖曳重新排列欄位順序"
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <GripVertical className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover/col:text-slate-600 dark:group-hover/col:text-slate-300 transition-colors shrink-0 -ml-0.5" />
          
          {/* Column Icon Picker */}
          <ColumnIconPicker
            value={column.icon || ""}
            onChange={(newIcon) => updateColumnInActiveBoard(column.id, undefined, newIcon)}
            variant="ghost"
          >
            <span
              className="text-base shrink-0 cursor-pointer hover:scale-115 active:scale-95 transition-transform p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center"
              title="點擊更換欄位圖示"
            >
              {column.icon ? column.icon : <SmilePlus className="w-3.5 h-3.5 text-slate-400" />}
            </span>
          </ColumnIconPicker>

          {/* Title or Inline Edit Input */}
          {isEditingTitle ? (
            <div
              className="flex-1 min-w-0 pr-1"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                ref={titleInputRef}
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onKeyDown={handleTitleKeyDown}
                onBlur={handleSaveTitle}
                className="w-full font-bold text-slate-800 dark:text-slate-100 text-sm tracking-tight px-1.5 py-0.5 rounded-lg border-2 border-orange-500 bg-white/95 dark:bg-slate-800/95 shadow-sm focus:outline-none min-w-0"
                maxLength={40}
                placeholder="欄位名稱"
              />
            </div>
          ) : (
            <div
              className="flex items-center gap-1 min-w-0 group/title cursor-pointer overflow-hidden"
              onDoubleClick={(e) => {
                e.stopPropagation();
                setIsEditingTitle(true);
              }}
              title="雙擊直接編輯名稱"
            >
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-tight truncate hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                {column.title}
              </h3>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditingTitle(true);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className="opacity-0 group-hover/col:opacity-70 hover:!opacity-100 p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all rounded shrink-0 cursor-pointer"
                title="修改名稱"
              >
                <Pencil className="w-3 h-3" />
              </button>
            </div>
          )}

          <span
            className={`ml-0.5 px-2 py-0.5 rounded-full font-bold text-xs shadow-2xs shrink-0 ${colorConfig.badgeClass}`}
            title={completedTasks.length > 0 ? `待處理: ${uncompletedTasks.length} / 已完成: ${completedTasks.length}` : `共 ${uncompletedTasks.length} 項`}
          >
            {uncompletedTasks.length}
          </span>
        </div>

        <div
          className="flex items-center gap-1 shrink-0 ml-1"
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
            onStartRename={() => setIsEditingTitle(true)}
          />
        </div>
      </div>

      {/* Cards Scrollable Droppable Container */}
      <div
        ref={(el) => {
          scrollContainerRef.current = el;
          setDroppableRef(el);
        }}
        className="flex-1 overflow-y-auto overflow-x-hidden space-y-2 pr-1 pt-1 pb-1 custom-scrollbar min-h-[60px]"
      >
        <SortableContext items={taskIds} strategy={isCrossColumnDrag ? () => null : verticalListSortingStrategy}>
          {/* 1. Active / Uncompleted Tasks List */}
          {visibleActiveTasks.map((task, idx) => (
            <React.Fragment key={task.id}>
              {insertIndex === idx && (
                <div
                  key={`drop-slot-${column.id}-${idx}`}
                  className="h-12 w-full rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 border-2 border-dashed border-slate-300 dark:border-slate-600 my-1 animate-in fade-in duration-100 flex items-center justify-center text-xs font-semibold text-slate-500 dark:text-slate-400 select-none shadow-2xs pointer-events-none"
                >
                  <span className="flex items-center gap-1.5 opacity-80">
                    <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 animate-pulse" />
                    插入此處
                  </span>
                </div>
              )}
              <TaskCard task={task} />
            </React.Fragment>
          ))}

          {/* Drop Slot when hovering at end of active tasks (and completed tasks are collapsed or absent) */}
          {visibleActiveTasks.length > 0 && !isCompletedExpanded && insertIndex >= visibleActiveTasks.length && (
            <div
              key={`drop-slot-${column.id}-end`}
              className="h-12 w-full rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 border-2 border-dashed border-slate-300 dark:border-slate-600 my-1 animate-in fade-in duration-100 flex items-center justify-center text-xs font-semibold text-slate-500 dark:text-slate-400 select-none shadow-2xs pointer-events-none"
            >
              <span className="flex items-center gap-1.5 opacity-80">
                <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 animate-pulse" />
                插入此處
              </span>
            </div>
          )}

          {/* Empty hint when all active tasks are completed */}
          {visibleActiveTasks.length === 0 && completedTasks.length > 0 && (
            <div className="py-3 px-2 text-center text-xs font-medium text-slate-400 dark:text-slate-500 bg-black/5 dark:bg-white/5 rounded-xl border border-dashed border-slate-200/80 dark:border-slate-700/60 select-none">
              待辦事項已全部完成 ✨
            </div>
          )}

          {/* 2. Collapsible Completed Tasks Section at Column Bottom */}
          {visibleCompletedTasks.length > 0 && (
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/40 mt-2">
              {/* Collapsible Accordion Header Toggle */}
              <button
                type="button"
                onClick={() => setIsCompletedExpanded((prev) => !prev)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-black/5 dark:bg-white/5 hover:bg-black/8 dark:hover:bg-white/10 transition-all cursor-pointer group/comp select-none"
                aria-expanded={isCompletedExpanded}
                title={isCompletedExpanded ? "收合已完成任務" : "展開查看已完成任務"}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">已完成</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 shrink-0">
                    {visibleCompletedTasks.length}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-400 group-hover/comp:text-slate-600 dark:group-hover/comp:text-slate-200 transition-colors">
                  <span className="text-[11px] font-normal">
                    {isCompletedExpanded ? "隱藏" : "查看"}
                  </span>
                  {isCompletedExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </div>
              </button>

              {/* Expanded Completed Tasks List */}
              {isCompletedExpanded && (
                <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-1 duration-150">
                  {visibleCompletedTasks.map((task, idx) => {
                    const overallIdx = visibleActiveTasks.length + idx;
                    return (
                      <React.Fragment key={task.id}>
                        {insertIndex === overallIdx && (
                          <div
                            key={`drop-slot-comp-${column.id}-${idx}`}
                            className="h-12 w-full rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 border-2 border-dashed border-slate-300 dark:border-slate-600 my-1 animate-in fade-in duration-100 flex items-center justify-center text-xs font-semibold text-slate-500 dark:text-slate-400 select-none shadow-2xs pointer-events-none"
                          >
                            <span className="flex items-center gap-1.5 opacity-80">
                              <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 animate-pulse" />
                              插入此處
                            </span>
                          </div>
                        )}
                        <TaskCard task={task} />
                      </React.Fragment>
                    );
                  })}
                  {insertIndex >= renderedTasks.length && (
                    <div
                      key={`drop-slot-${column.id}-comp-end`}
                      className="h-12 w-full rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 border-2 border-dashed border-slate-300 dark:border-slate-600 my-1 animate-in fade-in duration-100 flex items-center justify-center text-xs font-semibold text-slate-500 dark:text-slate-400 select-none shadow-2xs pointer-events-none"
                    >
                      <span className="flex items-center gap-1.5 opacity-80">
                        <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 animate-pulse" />
                        插入此處
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </SortableContext>

        {/* Drop Highlight during Drag & Drop when column has 0 tasks */}
        {visibleActiveTasks.length === 0 && visibleCompletedTasks.length === 0 && isColumnOver && (
          <div
            key={`drop-slot-${column.id}-empty`}
            className="h-14 w-full rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 border-2 border-dashed border-slate-300 dark:border-slate-600 my-1 flex items-center justify-center text-xs font-semibold text-slate-500 dark:text-slate-400 pointer-events-none shadow-2xs"
          >
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 animate-pulse" />
              放置於此欄位
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
      {canEdit && !isAddingCard && (
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

