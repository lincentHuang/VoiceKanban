import React from "react";

interface EditTaskTagChipsProps {
  tags: string[];
  onRemoveTag: (tag: string) => void;
}

export const EditTaskTagChips: React.FC<EditTaskTagChipsProps> = ({
  tags,
  onRemoveTag,
}) => {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((t) => (
        <span
          key={t}
          className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium flex items-center gap-1"
        >
          #{t}
          <button
            type="button"
            onClick={() => onRemoveTag(t)}
            aria-label={`移除標籤 ${t}`}
            className="hover:text-rose-500 text-slate-400 text-xs cursor-pointer"
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
};
