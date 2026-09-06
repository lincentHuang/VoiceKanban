"use client";

import React from "react";

interface AddTaskTagsSectionProps {
  tagInput: string;
  setTagInput: (val: string) => void;
  tags: string[];
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
}

export const AddTaskTagsSection: React.FC<AddTaskTagsSectionProps> = ({
  tagInput,
  setTagInput,
  tags,
  onAddTag,
  onRemoveTag,
}) => {
  return (
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
            if (e.nativeEvent.isComposing || e.key === "Process") return;
            if (e.key === "Enter") {
              e.preventDefault();
              onAddTag();
            }
          }}
          placeholder="輸入標籤名稱按 Enter 新增..."
          className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-orange-500"
        />
        <button
          type="button"
          onClick={onAddTag}
          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-200 cursor-pointer"
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
              onClick={() => onRemoveTag(t)}
              className="hover:text-rose-500 text-slate-400 text-xs ml-0.5 cursor-pointer"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};
