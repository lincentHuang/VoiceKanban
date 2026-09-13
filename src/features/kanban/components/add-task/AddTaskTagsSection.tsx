"use client";

import React from "react";
import { TagPicker, TagPickerTriggerButton } from "@/components/common/TagPicker";
import { fieldButtonClass, inputClass } from "@/components/ui/input";

interface AddTaskTagsSectionProps {
  tagInput: string;
  setTagInput: (val: string) => void;
  tags: string[];
  allTags: string[];
  tagCounts?: Record<string, number>;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  onToggleTag: (tag: string) => void;
}

export const AddTaskTagsSection: React.FC<AddTaskTagsSectionProps> = ({
  tagInput,
  setTagInput,
  tags,
  allTags,
  tagCounts,
  onAddTag,
  onRemoveTag,
  onToggleTag,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          分類標籤
        </label>
        <TagPicker selected={tags} allTags={allTags} counts={tagCounts} onToggle={onToggleTag} align="end">
          <TagPickerTriggerButton label="瀏覽標籤" />
        </TagPicker>
      </div>

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
          className={inputClass("md")}
        />
        <button
          type="button"
          onClick={onAddTag}
          disabled={!tagInput.trim()}
          className={fieldButtonClass("md", "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200")}
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
              aria-label={`移除標籤 ${t}`}
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
