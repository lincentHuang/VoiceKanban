"use client";

import React from "react";
import { Check, X } from "lucide-react";
import { ColumnIconPicker } from "../ColumnIconPicker";

interface ColumnRowEditingProps {
  editTitle: string;
  editIcon: string;
  onEditTitleChange: (val: string) => void;
  onEditIconChange: (val: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}

export const ColumnRowEditing: React.FC<ColumnRowEditingProps> = ({
  editTitle,
  editIcon,
  onEditTitleChange,
  onEditIconChange,
  onSaveEdit,
  onCancelEdit,
}) => {
  return (
    <div className="flex items-center gap-2 flex-1 mr-1 min-w-0">
      <ColumnIconPicker value={editIcon} onChange={onEditIconChange} size="sm" />
      <input
        type="text"
        value={editTitle}
        onChange={(e) => onEditTitleChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing || e.key === "Process") return;
          if (e.key === "Enter") onSaveEdit();
          if (e.key === "Escape") onCancelEdit();
        }}
        placeholder="欄位名稱"
        className="flex-1 min-w-0 text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-semibold focus:outline-none focus:border-orange-500"
        autoFocus
      />
      <button
        onClick={onSaveEdit}
        className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-2xs shrink-0 cursor-pointer"
        title="儲存"
      >
        <Check className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onCancelEdit}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0 cursor-pointer"
        title="取消"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
