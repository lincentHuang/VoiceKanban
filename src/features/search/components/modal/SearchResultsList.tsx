"use client";

import React from "react";
import { Search, Sparkles } from "lucide-react";
import { Task } from "@/core/types/task";
import { SearchResultItem } from "./SearchResultItem";

interface SearchResultsListProps {
  listRef: React.RefObject<HTMLDivElement | null>;
  isSearching: boolean;
  searchResults: Task[];
  inputVal: string;
  selectedIndex: number;
  columnMap: Map<string, { title: string; color?: string }>;
  onSelectTask: (taskId: string) => void;
  setSelectedIndex: (idx: number) => void;
}

export const SearchResultsList: React.FC<SearchResultsListProps> = ({
  listRef,
  isSearching,
  searchResults,
  inputVal,
  selectedIndex,
  columnMap,
  onSelectTask,
  setSelectedIndex,
}) => {
  return (
    <div
      ref={listRef}
      className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1.5 focus:outline-none min-h-[160px]"
    >
      {isSearching && searchResults.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/60 dark:border-orange-900/60 flex items-center justify-center text-orange-500 mb-3">
            <Search className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            找不到符合「{inputVal}」的任務
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            請嘗試輸入其他關鍵字、簡化搜尋詞，或檢查標籤拼寫。
          </p>
        </div>
      )}

      {!isSearching && searchResults.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 mb-3">
            <Sparkles className="w-6 h-6 text-orange-400" />
          </div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
            快速全域搜尋
          </p>
          <p className="text-xs text-slate-400 mt-1">
            輸入關鍵字或點擊上方標籤，立即過濾所有任務與收件匣。
          </p>
        </div>
      )}

      {searchResults.map((task, idx) => (
        <SearchResultItem
          key={task.id}
          task={task}
          isSelected={idx === selectedIndex}
          colInfo={columnMap.get(task.columnId) || { title: "任務欄", color: "#f97316" }}
          onSelect={() => onSelectTask(task.id)}
          onMouseEnter={() => setSelectedIndex(idx)}
        />
      ))}
    </div>
  );
};
