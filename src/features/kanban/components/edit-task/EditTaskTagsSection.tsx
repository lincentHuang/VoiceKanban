import React, { useState } from "react";
import { Tag } from "lucide-react";
import { TagPicker, TagPickerTriggerButton } from "@/components/common/TagPicker";
import { fieldButtonClass, inputClass } from "@/components/ui/input";

interface EditTaskTagsSectionProps {
  tags: string[];
  /** Every tag used across the workspace, offered for quick re-use. */
  allTags: string[];
  tagCounts?: Record<string, number>;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export const EditTaskTagsSection: React.FC<EditTaskTagsSectionProps> = ({
  tags,
  allTags,
  tagCounts,
  onAddTag,
  onRemoveTag,
}) => {
  const [tagInput, setTagInput] = useState("");

  const handleToggle = (tag: string) => {
    if (tags.includes(tag)) onRemoveTag(tag);
    else onAddTag(tag);
  };

  const handleAdd = () => {
    const value = tagInput.trim();
    if (value && !tags.includes(value)) onAddTag(value);
    setTagInput("");
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-slate-400" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">標籤管理</h4>
        </div>
        <TagPicker selected={tags} allTags={allTags} counts={tagCounts} onToggle={handleToggle} align="end">
          <TagPickerTriggerButton />
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
              handleAdd();
            }
          }}
          placeholder="輸入標籤按 Enter..."
          className={inputClass("md")}
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!tagInput.trim()}
          className={fieldButtonClass("md", "bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-700")}
        >
          新增
        </button>
      </div>

      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {tags.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium flex items-center gap-1"
            >
              #{t}
              <button
                onClick={() => onRemoveTag(t)}
                aria-label={`移除標籤 ${t}`}
                className="hover:text-rose-500 text-slate-400 text-xs cursor-pointer"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : (
        <TagPicker selected={tags} allTags={allTags} counts={tagCounts} onToggle={handleToggle}>
          <button
            type="button"
            className="w-full text-left text-[11px] text-slate-400 hover:text-orange-500 transition-colors px-1 py-0.5 cursor-pointer"
          >
            尚未加上標籤 — 點擊瀏覽既有標籤
          </button>
        </TagPicker>
      )}
    </div>
  );
};
