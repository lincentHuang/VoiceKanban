"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChecklistItem } from "@/core/types/task";
import { cn } from "@/core/utils/cn";
import { ChecklistInlineEditor } from "./checklist/ChecklistInlineEditor";
import { ChecklistItemView } from "./checklist/ChecklistItemView";

interface SortableChecklistItemProps {
  item: ChecklistItem;
  taskId: string;
  isEditing: boolean;
  editingText: string;
  onStartEdit: (itemId: string, currentTitle: string) => void;
  onSaveEdit: (itemId: string) => void;
  onCancelEdit: () => void;
  onEditTextChange: (text: string) => void;
  onToggle: (taskId: string, itemId: string) => void;
  onRemove: (taskId: string, itemId: string) => void;
}

export const SortableChecklistItem: React.FC<SortableChecklistItemProps> = ({
  item,
  taskId,
  isEditing,
  editingText,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditTextChange,
  onToggle,
  onRemove,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    disabled: isEditing,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    position: "relative",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center justify-between p-2 rounded-xl transition-all select-none",
        isDragging
          ? "bg-white dark:bg-slate-800 shadow-lg border-2 border-orange-500 scale-[1.02] opacity-95 z-50 ring-2 ring-orange-500/20 cursor-grabbing"
          : "hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-200/60"
      )}
    >
      {isEditing ? (
        <ChecklistInlineEditor
          itemId={item.id}
          editingText={editingText}
          onEditTextChange={onEditTextChange}
          onSaveEdit={onSaveEdit}
          onCancelEdit={onCancelEdit}
        />
      ) : (
        <ChecklistItemView
          item={item}
          taskId={taskId}
          attributes={attributes}
          listeners={listeners}
          onStartEdit={onStartEdit}
          onToggle={onToggle}
          onRemove={onRemove}
        />
      )}
    </div>
  );
};
