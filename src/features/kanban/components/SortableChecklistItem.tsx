"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChecklistItem } from "@/core/types/task";
import { cn } from "@/core/utils/cn";
import {
  CheckSquare,
  Square,
  Edit3,
  Trash2,
  Check,
  X,
} from "lucide-react";

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
        /* Inline Edit Mode */
        <div
          className="flex items-center gap-2 flex-1 min-w-0"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="text"
            autoFocus
            value={editingText}
            onChange={(e) => onEditTextChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing || e.key === "Process") return;
              if (e.key === "Enter") {
                e.preventDefault();
                onSaveEdit(item.id);
              }
              if (e.key === "Escape") {
                e.preventDefault();
                onCancelEdit();
              }
            }}
            className="flex-1 px-2.5 py-1 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-orange-500 rounded-lg focus:outline-none shadow-xs text-slate-800 dark:text-slate-100"
          />
          <button
            type="button"
            onClick={() => onSaveEdit(item.id)}
            className="p-1 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-xs"
            title="儲存修改"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onCancelEdit}
            className="p-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 transition-colors"
            title="取消"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* Normal Display Mode with 500ms Long-Press Drag */
        <>
          <div
            {...attributes}
            {...listeners}
            className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer touch-manipulation"
          >
            {/* Checkbox */}
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onToggle(taskId, item.id);
              }}
              className="shrink-0 p-0.5 rounded hover:scale-110 active:scale-95 transition-transform"
            >
              {item.completed ? (
                <CheckSquare className="w-4 h-4 text-emerald-500" />
              ) : (
                <Square className="w-4 h-4 text-slate-300 dark:text-slate-600 hover:text-slate-400" />
              )}
            </button>

            {/* Title */}
            <span
              onDoubleClick={(e) => {
                e.stopPropagation();
                onStartEdit(item.id, item.title);
              }}
              className={cn(
                "text-xs sm:text-sm break-words flex-1 select-none",
                item.completed
                  ? "line-through text-slate-400 dark:text-slate-500"
                  : "text-slate-700 dark:text-slate-200"
              )}
            >
              {item.title}
            </span>
          </div>

          {/* Action Buttons: Edit Pencil & Delete Trash */}
          <div
            className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0 ml-2"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Edit Pencil */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onStartEdit(item.id, item.title);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors"
              title="編輯項目名稱"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            {/* Delete Trash */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(taskId, item.id);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors"
              title="刪除項目"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
