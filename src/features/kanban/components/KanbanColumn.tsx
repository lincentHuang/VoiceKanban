"use client";

import React, { useState, useRef, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Column, Task, getColumnColorConfig } from "@/core/types/task";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { useColumnTitleEdit } from "./column/useColumnTitleEdit";
import { KanbanColumnOverlay } from "./column/KanbanColumnOverlay";
import { KanbanColumnHeader } from "./column/KanbanColumnHeader";
import { KanbanColumnTaskList } from "./column/KanbanColumnTaskList";
import { KanbanColumnInlineAdd } from "./column/KanbanColumnInlineAdd";
import { KanbanColumnFooter } from "./column/KanbanColumnFooter";

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  isOverlay?: boolean;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, tasks, isOverlay = false }) => {
  const store = useKanbanStore();
  const { openVoiceForColumn, addTask, activeBoardId, dragOverLocation, activeDragTaskId, canCurrentUserEdit } = store;
  const canEdit = canCurrentUserEdit();
  const colorConfig = getColumnColorConfig(column.color);

  const { attributes, listeners, setNodeRef: setSortableRef, transform, transition, isDragging } = useSortable({
    id: column.id, data: { type: "Column", column }, disabled: isOverlay || !canEdit,
  });
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: column.id, data: { type: "Column", column }, disabled: isOverlay || !canEdit,
  });

  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const titleEdit = useColumnTitleEdit(column.id, column.title);

  const uncompleted = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);
  const isColumnOver = !isOverlay && dragOverLocation?.columnId === column.id;
  const isCrossDrag = isColumnOver && Boolean(activeDragTaskId && !tasks.some((t) => t.id === activeDragTaskId));
  const visActive = isOverlay ? uncompleted : isCrossDrag ? uncompleted.filter((t) => t.id !== activeDragTaskId) : uncompleted;
  const visComp = isOverlay ? completed : isCrossDrag ? completed.filter((t) => t.id !== activeDragTaskId) : completed;
  const rendered = isCompletedExpanded ? [...visActive, ...visComp] : visActive;
  const taskIds = rendered.map((t) => t.id);
  const insertIndex = isCrossDrag && dragOverLocation ? Math.max(0, Math.min(dragOverLocation.index, visActive.length)) : -1;

  useEffect(() => {
    if (isAddingCard) {
      inputRef.current?.focus();
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isAddingCard]);

  const handleAddSubmit = () => {
    const title = newCardTitle.trim();
    if (!title || isSubmitting) return;
    setIsSubmitting(true);
    try {
      addTask({ title, columnId: column.id, boardId: activeBoardId, completed: false, tags: [], dueDate: null });
      setNewCardTitle(""); setIsAddingCard(false);
    } finally { setIsSubmitting(false); }
  };

  if (isOverlay) return <KanbanColumnOverlay column={column} tasks={tasks} />;
  if (isDragging) {
    return (
      <div ref={setSortableRef} style={{ transform: CSS.Translate.toString(transform), transition }} className="flex flex-col w-[84vw] max-w-[320px] min-w-[270px] sm:w-[270px] snap-center shrink-0 min-h-[220px] h-64 rounded-2xl border-2 border-dashed border-orange-400 bg-orange-500/10 p-3 flex items-center justify-center text-xs font-semibold text-orange-600 pointer-events-none">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />放置於此</span>
      </div>
    );
  }

  return (
    <div ref={setSortableRef} style={{ transform: CSS.Translate.toString(transform), transition }} data-column-id={column.id} className={`flex flex-col w-[84vw] max-w-[320px] min-w-[270px] sm:w-[270px] snap-center shrink-0 max-h-full h-fit backdrop-blur-xl border rounded-2xl p-3 shadow-md transition-all relative overflow-hidden group/col ${colorConfig.containerClass}`}>
      <KanbanColumnHeader column={column} tasks={tasks} isEditingTitle={titleEdit.isEditingTitle} titleInput={titleEdit.titleInput} titleInputRef={titleEdit.titleInputRef} onTitleInputChange={titleEdit.setTitleInput} onTitleKeyDown={titleEdit.handleTitleKeyDown} onSaveTitle={titleEdit.handleSaveTitle} onStartEditTitle={() => titleEdit.setIsEditingTitle(true)} onStartAddCard={() => setIsAddingCard(true)} attributes={attributes} listeners={listeners} />
      <div ref={(el) => { scrollRef.current = el; setDroppableRef(el); }} className="flex-1 overflow-y-auto overflow-x-hidden space-y-2 pr-1 pt-1 pb-1 custom-scrollbar min-h-[60px]">
        <KanbanColumnTaskList columnId={column.id} taskIds={taskIds} visibleActiveTasks={visActive} visibleCompletedTasks={visComp} renderedTasks={rendered} insertIndex={insertIndex} isCrossColumnDrag={isCrossDrag} isColumnOver={isColumnOver} isCompletedExpanded={isCompletedExpanded} onToggleCompletedExpanded={() => setIsCompletedExpanded(!isCompletedExpanded)} />
        <KanbanColumnInlineAdd isAddingCard={isAddingCard} newCardTitle={newCardTitle} isSubmitting={isSubmitting} inputRef={inputRef} onTitleChange={setNewCardTitle} onSubmit={handleAddSubmit} onCancel={() => { setIsAddingCard(false); setNewCardTitle(""); }} />
      </div>
      <KanbanColumnFooter canEdit={canEdit} isAddingCard={isAddingCard} columnTitle={column.title} onStartAddCard={() => setIsAddingCard(true)} onVoiceAdd={() => openVoiceForColumn(column.id)} />
    </div>
  );
};
