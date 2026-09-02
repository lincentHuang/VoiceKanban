"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { useEscapeKey } from "@/core/hooks/useEscapeKey";
import {
  Search,
  X,
  Star,
  Tag,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { getDueDateStatus } from "@/core/utils/dateUtils";

export const SearchModal: React.FC = () => {
  const {
    isSearchModalOpen,
    setIsSearchModalOpen,
    searchQuery,
    setSearchQuery,
    tasks,
    activeBoardId,
    getActiveBoardColumns,
    setEditingTaskId,
  } = useKanbanStore();

  const [inputVal, setInputVal] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Sync initial input value from global searchQuery or clear when opened
  useEffect(() => {
    if (isSearchModalOpen) {
      setInputVal(searchQuery || "");
      setSelectedIndex(0);
      // Auto focus input
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isSearchModalOpen, searchQuery]);

  useEscapeKey(() => {
    if (isSearchModalOpen) {
      setIsSearchModalOpen(false);
    }
  }, isSearchModalOpen);

  const columns = getActiveBoardColumns();
  const columnMap = useMemo(() => {
    const map = new Map<string, { title: string; color?: string }>();
    columns.forEach((c) => {
      map.set(c.id, { title: c.title, color: c.color });
    });
    map.set("inbox", { title: "收件匣", color: "#64748b" });
    return map;
  }, [columns]);

  // Collect all unique tags from all tasks
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    tasks.forEach((t) => {
      t.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).slice(0, 8);
  }, [tasks]);

  // Filter tasks based on inputVal
  const searchResults = useMemo(() => {
    const q = inputVal.trim().toLowerCase();
    if (!q) {
      // If empty query, show starred tasks or recent tasks on active board
      return tasks
        .filter((t) => t.isStarred || t.boardId === activeBoardId)
        .slice(0, 10);
    }

    return tasks.filter((task) => {
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchTag = task.tags?.some((tag) => tag.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchTag;
    });
  }, [inputVal, tasks, activeBoardId]);

  // Ensure selectedIndex is within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [inputVal]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }
  }, [selectedIndex]);

  // Keyboard navigation inside modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        searchResults.length > 0 ? (prev + 1) % searchResults.length : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        searchResults.length > 0
          ? (prev - 1 + searchResults.length) % searchResults.length
          : 0
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        handleSelectTask(searchResults[selectedIndex].id);
      } else if (inputVal.trim()) {
        handleApplyFilter();
      }
    }
  };

  const handleSelectTask = (taskId: string) => {
    setEditingTaskId(taskId);
    setIsSearchModalOpen(false);
  };

  const handleApplyFilter = () => {
    setSearchQuery(inputVal.trim());
    setIsSearchModalOpen(false);
  };

  const handleClearFilter = () => {
    setInputVal("");
    setSearchQuery("");
  };

  if (!isSearchModalOpen) return null;

  const isSearching = inputVal.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-start justify-center pt-14 sm:pt-24 px-3 sm:px-4 animate-in fade-in duration-150">
      {/* Click outside to close */}
      <div
        className="fixed inset-0 -z-10"
        onClick={() => setIsSearchModalOpen(false)}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="搜尋任務"
        className="w-full max-w-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh] transition-all animate-in zoom-in-95 duration-200"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
          <Search className="w-5 h-5 text-orange-500 shrink-0 animate-in fade-in" />
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜尋任務名稱、備註、或 #標籤..."
            className="flex-1 bg-transparent text-sm sm:text-base text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />

          {inputVal && (
            <button
              onClick={() => {
                setInputVal("");
                inputRef.current?.focus();
              }}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="清除輸入"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setIsSearchModalOpen(false)}
            className="px-2 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Quick Tag Recommendations (when query is empty) */}
        {!isSearching && allTags.length > 0 && (
          <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/60 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
            <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
              <Tag className="w-3 h-3 text-slate-400" />
              標籤篩選:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setInputVal(tag);
                    inputRef.current?.focus();
                  }}
                  className="px-2 py-0.5 rounded-full text-[11px] bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-orange-400 hover:text-orange-500 transition-all cursor-pointer shadow-2xs"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results List / 5 UI States */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1.5 focus:outline-none min-h-[160px]"
        >
          {/* State 1: No Results Found (Empty state) */}
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

          {/* State 2: Initial Guide Hint (when not searching and no recent tasks) */}
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

          {/* State 3: Active / Success Results List */}
          {searchResults.map((task, idx) => {
            const isSelected = idx === selectedIndex;
            const colInfo = columnMap.get(task.columnId) || {
              title: "任務欄",
              color: "#f97316",
            };
            const dateStatus = getDueDateStatus(task.dueDate, task.completed);

            return (
              <div
                key={task.id}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelectTask(task.id)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`group px-3 py-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-orange-50/90 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800/80 shadow-xs"
                    : "bg-white/60 dark:bg-slate-800/40 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/70"
                }`}
              >
                {/* Left: Check / Star / Title / Tags */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {/* Status Indicator */}
                  {task.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : task.isStarred ? (
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                  ) : (
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: colInfo.color || "#f97316" }}
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium truncate ${
                          task.completed
                            ? "line-through text-slate-400 dark:text-slate-500"
                            : "text-slate-800 dark:text-slate-100 font-semibold"
                        }`}
                      >
                        {task.title}
                      </span>

                      {/* Column Tag Badge */}
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0"
                        style={{
                          borderColor: colInfo.color ? `${colInfo.color}40` : "#e2e8f0",
                          backgroundColor: colInfo.color ? `${colInfo.color}15` : "#f1f5f9",
                          color: colInfo.color || "#475569",
                        }}
                      >
                        {colInfo.title}
                      </span>
                    </div>

                    {/* Subtitle: Description snippet or tags */}
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex items-center gap-1 shrink-0">
                          {task.tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}

                      {task.description && (
                        <span className="truncate text-[11px] text-slate-400">
                          {task.description}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Due Date & Action */}
                <div className="flex items-center gap-2 shrink-0">
                  {task.dueDate && dateStatus && (
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                        dateStatus.urgency === "overdue"
                          ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400"
                          : dateStatus.urgency === "due-soon"
                          ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400"
                          : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>{dateStatus.formattedDateOnly}</span>
                    </span>
                  )}

                  <ArrowRight
                    className={`w-4 h-4 transition-transform ${
                      isSelected
                        ? "text-orange-500 translate-x-0.5"
                        : "text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions & Shortcut Hints */}
        <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-mono text-[10px] shadow-2xs">
                ↑↓
              </kbd>
              選擇
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-mono text-[10px] shadow-2xs">
                ↵
              </kbd>
              開啟卡片
            </span>
            <span className="hidden sm:inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-mono text-[10px] shadow-2xs">
                ESC
              </kbd>
              關閉
            </span>
          </div>

          {/* Quick Apply / Clear Filter button */}
          <div className="flex items-center gap-2">
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearFilter}
                className="text-[11px] text-rose-500 hover:text-rose-600 hover:underline cursor-pointer"
              >
                清除看板篩選
              </button>
            )}

            {isSearching && (
              <button
                type="button"
                onClick={handleApplyFilter}
                className="px-2.5 py-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-[11px] shadow-2xs transition-all flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <Filter className="w-3 h-3" />
                <span>在看板套用</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
