"use client";

import React, { useState } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { ColumnId } from "@/core/types/task";
import { DateTimePicker } from "../common/DateTimePicker";
import { useEscapeKey } from "@/core/hooks/useEscapeKey";
import { X, Calendar, Tag, Star, Plus } from "lucide-react";

export const AddTaskModal: React.FC = () => {
  const {
    isAddTaskModalOpen,
    setIsAddTaskModalOpen,
    addTaskDefaultColumn,
    activeBoardId,
    getActiveBoardColumns,
    addTask,
  } = useKanbanStore();

  useEscapeKey(() => {
    if (isAddTaskModalOpen) {
      setIsAddTaskModalOpen(false);
    }
  }, isAddTaskModalOpen);

  const columns = getActiveBoardColumns();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [columnId, setColumnId] = useState<ColumnId>(() => {
    const validCols = columns.map((c) => c.id);
    if (addTaskDefaultColumn === "inbox" || validCols.includes(addTaskDefaultColumn)) {
      return addTaskDefaultColumn;
    }
    return validCols[0] || "todo";
  });
  const [isStarred, setIsStarred] = useState(false);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [isAllDay, setIsAllDay] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize columnId with addTaskDefaultColumn whenever modal opens or column changes
  React.useEffect(() => {
    if (isAddTaskModalOpen) {
      const validCols = columns.map((c) => c.id);
      if (addTaskDefaultColumn === "inbox" || validCols.includes(addTaskDefaultColumn)) {
        setColumnId(addTaskDefaultColumn);
      } else {
        setColumnId(validCols[0] || "todo");
      }
    }
  }, [isAddTaskModalOpen, addTaskDefaultColumn, columns]);

  if (!isAddTaskModalOpen) return null;

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      addTask({
        title: title.trim(),
        description: description.trim(),
        boardId: columnId === "inbox" ? "global" : activeBoardId,
        columnId,
        isStarred,
        tags,
        startDate: startDate || null,
        dueDate: dueDate || null, // Default null if empty
        isAllDay,
        completed: columnId === "done",
      });

      // Reset and close
      setTitle("");
      setDescription("");
      setIsStarred(false);
      setDueDate(null);
      setStartDate(null);
      setIsAllDay(false);
      setTags([]);
      setIsAddTaskModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={() => setIsAddTaskModalOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 border border-white/80 dark:border-slate-800 rounded-3xl shadow-2xl p-6 relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">新增任務卡片</h3>
            <p className="text-xs text-slate-500">手動建立卡片或自訂詳細參數</p>
          </div>
          <button
            onClick={() => setIsAddTaskModalOpen(false)}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              任務標題 *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：重構登入授權模組..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              任務詳細說明 (選填，支援 Markdown)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="補充細節或備忘..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Column & Star Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                目標欄位
              </label>
              <select
                value={columnId}
                onChange={(e) => setColumnId(e.target.value as ColumnId)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200"
              >
                <optgroup label="📋 當前看板欄位">
                  {columns.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.icon} {col.title}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="📥 暫存箱">
                  <option value="inbox">📥 側邊欄收件匣 (Inbox)</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                重要性設定
              </label>
              <button
                type="button"
                onClick={() => setIsStarred(!isStarred)}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
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

          {/* Due Date (Optional, default empty) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              到期日 / 活動時段 (選填)
            </label>
            <DateTimePicker
              value={dueDate}
              startDate={startDate}
              isAllDay={isAllDay}
              onChange={(dates) => {
                setStartDate(dates.startDate || null);
                setDueDate(dates.dueDate);
                setIsAllDay(dates.isAllDay);
              }}
              placeholder="點擊選擇日期或活動時段..."
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              分類標籤
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="輸入標籤名稱按 Enter 新增..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-200"
              >
                新增
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-500 text-slate-400 text-xs ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddTaskModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className={`px-5 py-2 rounded-xl bg-base44-orange hover:bg-base44-orangeHover text-white text-xs sm:text-sm font-bold shadow-md transition-all ${
                isSubmitting || !title.trim() ? "opacity-60 cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              {isSubmitting ? "建立中..." : "建立卡片"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
