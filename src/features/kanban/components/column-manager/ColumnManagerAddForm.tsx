"use client";

import React from "react";
import { ColumnIconPicker } from "../ColumnIconPicker";
import { fieldButtonClass, inputClass } from "@/components/ui/input";

interface ColumnManagerAddFormProps {
  newTitle: string;
  setNewTitle: (val: string) => void;
  newIcon: string;
  setNewIcon: (val: string) => void;
  onAddColumn: (e: React.FormEvent) => void;
}

export const ColumnManagerAddForm: React.FC<ColumnManagerAddFormProps> = ({
  newTitle,
  setNewTitle,
  newIcon,
  setNewIcon,
  onAddColumn,
}) => {
  return (
    <form onSubmit={onAddColumn} className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
        + 新增自訂狀態欄位
      </label>

      <div className="flex items-center gap-2">
        <ColumnIconPicker value={newIcon} onChange={setNewIcon} size="md" />

        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="輸入新欄位名稱 (例如：測試驗收、設計審查...)"
          className={inputClass("md", "flex-1 font-medium")}
        />

        <button
          type="submit"
          disabled={!newTitle.trim()}
          className={fieldButtonClass("md", "bg-base44-orange hover:bg-base44-orangeHover text-white shadow-xs")}
        >
          新增
        </button>
      </div>
    </form>
  );
};
