"use client";

import React from "react";
import { Check, X } from "lucide-react";

interface ChecklistInlineEditorProps {
  itemId: string;
  editingText: string;
  onEditTextChange: (text: string) => void;
  onSaveEdit: (itemId: string) => void;
  onCancelEdit: () => void;
}

export const ChecklistInlineEditor: React.FC<ChecklistInlineEditorProps> = ({
  itemId,
  editingText,
  onEditTextChange,
  onSaveEdit,
  onCancelEdit,
}) => {
  return (
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
            onSaveEdit(itemId);
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
        onClick={() => onSaveEdit(itemId)}
        className="p-1 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-xs cursor-pointer"
        title="儲存修改"
      >
        <Check className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={onCancelEdit}
        className="p-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 transition-colors cursor-pointer"
        title="取消"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
