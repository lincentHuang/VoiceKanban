"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Column } from "@/core/types/task";
import { GripVertical } from "lucide-react";
import { cn } from "@/core/utils/cn";
import { ColumnRowEditing } from "./ColumnRowEditing";
import { ColumnRowStatic } from "./ColumnRowStatic";

interface SortableColumnRowProps {
  col: Column;
  isEditing: boolean;
  editTitle: string;
  editIcon: string;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditTitleChange: (val: string) => void;
  onEditIconChange: (val: string) => void;
  onDelete: () => void;
  canDelete: boolean;
}

export const SortableColumnRow: React.FC<SortableColumnRowProps> = ({
  col,
  isEditing,
  editTitle,
  editIcon,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditTitleChange,
  onEditIconChange,
  onDelete,
  canDelete,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: col.id,
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
        "flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border select-none transition-all duration-75",
        isDragging
          ? "scale-105 rotate-1 shadow-2xl rounded-2xl border-2 border-orange-500 bg-white/98 dark:bg-slate-800/98 cursor-grabbing z-50 opacity-100"
          : "bg-slate-50/80 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/70 dark:hover:bg-slate-800/80"
      )}
    >
      {!isEditing && (
        <div
          {...attributes}
          {...listeners}
          className="p-1 -ml-1 mr-1 text-slate-400 hover:text-orange-500 cursor-grab active:cursor-grabbing rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors shrink-0 touch-none"
          title="按住拖曳調整欄位順序"
        >
          <GripVertical className="w-4 h-4" />
        </div>
      )}

      {isEditing ? (
        <ColumnRowEditing
          editTitle={editTitle}
          editIcon={editIcon}
          onEditTitleChange={onEditTitleChange}
          onEditIconChange={onEditIconChange}
          onSaveEdit={onSaveEdit}
          onCancelEdit={onCancelEdit}
        />
      ) : (
        <ColumnRowStatic
          col={col}
          onStartEdit={onStartEdit}
          onDelete={onDelete}
          canDelete={canDelete}
        />
      )}
    </div>
  );
};
