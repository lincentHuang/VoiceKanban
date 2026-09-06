"use client";

import React from "react";
import { Star } from "lucide-react";
import { Column, ColumnId } from "@/core/types/task";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectGroup,
  SelectSeparator,
} from "@/components/ui/select";

interface AddTaskColumnStarRowProps {
  columnId: ColumnId;
  setColumnId: (colId: ColumnId) => void;
  columns: Column[];
  isStarred: boolean;
  setIsStarred: (starred: boolean) => void;
}

export const AddTaskColumnStarRow: React.FC<AddTaskColumnStarRowProps> = ({
  columnId,
  setColumnId,
  columns,
  isStarred,
  setIsStarred,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          目標欄位
        </label>
        <Select value={columnId} onValueChange={(val) => setColumnId(val as ColumnId)}>
          <SelectTrigger className="w-full h-10 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium">
            <SelectValue placeholder="選擇目標欄位" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>📋 當前看板欄位</SelectLabel>
              {columns.map((col) => (
                <SelectItem key={col.id} value={col.id}>
                  {col.icon} {col.title}
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>📥 暫存箱</SelectLabel>
              <SelectItem value="inbox">📥 側邊欄收件匣 (Inbox)</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          重要性設定
        </label>
        <button
          type="button"
          onClick={() => setIsStarred(!isStarred)}
          className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
            isStarred
              ? "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300"
              : "bg-slate-50 dark:bg-slate-800 text-slate-600 border-slate-200"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Star
              className={`w-4 h-4 ${
                isStarred ? "fill-amber-500 text-amber-500" : "text-slate-400"
              }`}
            />
            <span>重要卡片</span>
          </span>
          <span>{isStarred ? "⭐ 是" : "否"}</span>
        </button>
      </div>
    </div>
  );
};
