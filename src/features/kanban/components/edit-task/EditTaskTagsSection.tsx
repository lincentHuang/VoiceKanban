import React, { useState } from "react";
import { MessageSquare } from "lucide-react";

interface EditTaskTagsSectionProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export const EditTaskTagsSection: React.FC<EditTaskTagsSectionProps> = ({
  tags,
  onAddTag,
  onRemoveTag,
}) => {
  const [tagInput, setTagInput] = useState("");

  const handleAdd = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      onAddTag(tagInput.trim());
      setTagInput("");
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="w-4 h-4 text-slate-400" />
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">標籤管理</h4>
      </div>
      <div className="flex gap-1 mb-1.5">
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
          className="flex-1 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
        />
      </div>

      <div className="flex flex-wrap gap-1">
        {tags.map((t) => (
          <span
            key={t}
            className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium flex items-center gap-1"
          >
            #{t}
            <button
              onClick={() => onRemoveTag(t)}
              className="hover:text-rose-500 text-slate-400 text-xs"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};
