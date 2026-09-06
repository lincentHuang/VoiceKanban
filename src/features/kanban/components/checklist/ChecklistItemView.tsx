"use client";

import React from "react";
import { ChecklistItem } from "@/core/types/task";
import { cn } from "@/core/utils/cn";
import { CheckSquare, Square, Edit3, Trash2 } from "lucide-react";

interface ChecklistItemViewProps {
  item: ChecklistItem;
  taskId: string;
  attributes: any;
  listeners: any;
  onStartEdit: (itemId: string, currentTitle: string) => void;
  onToggle: (taskId: string, itemId: string) => void;
  onRemove: (taskId: string, itemId: string) => void;
}

export const ChecklistItemView: React.FC<ChecklistItemViewProps> = ({
  item,
  taskId,
  attributes,
  listeners,
  onStartEdit,
  onToggle,
  onRemove,
}) => {
  return (
    <>
      <div
        {...attributes}
        {...listeners}
        className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer touch-manipulation"
      >
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(taskId, item.id);
          }}
          className="shrink-0 p-0.5 rounded hover:scale-110 active:scale-95 transition-transform cursor-pointer"
        >
          {item.completed ? (
            <CheckSquare className="w-4 h-4 text-emerald-500" />
          ) : (
            <Square className="w-4 h-4 text-slate-300 dark:text-slate-600 hover:text-slate-400" />
          )}
        </button>

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

      <div
        className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0 ml-2"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onStartEdit(item.id, item.title);
          }}
          className="p-1 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          title="編輯項目名稱"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(taskId, item.id);
          }}
          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          title="刪除項目"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </>
  );
};
