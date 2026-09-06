"use client";

import React from "react";
import { ColumnIconPicker } from "../ColumnIconPicker";

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
          className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium focus:outline-none focus:border-orange-500"
        />

        <button
          type="submit"
          disabled={!newTitle.trim()}
          className="px-4 py-2 rounded-xl bg-base44-orange hover:bg-base44-orangeHover text-white text-xs font-bold shadow-xs disabled:opacity-50 transition-all cursor-pointer"
        >
          新增
        </button>
      </div>
    </form>
  );
};
