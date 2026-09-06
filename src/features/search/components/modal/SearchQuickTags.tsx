"use client";

import React from "react";
import { Tag } from "lucide-react";

interface SearchQuickTagsProps {
  tags: string[];
  onSelectTag: (tag: string) => void;
}

export const SearchQuickTags: React.FC<SearchQuickTagsProps> = ({
  tags,
  onSelectTag,
}) => {
  if (tags.length === 0) return null;

  return (
    <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/60 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
      <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
        <Tag className="w-3 h-3 text-slate-400" />
        標籤篩選:
      </span>
      <div className="flex items-center gap-1.5 flex-wrap">
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onSelectTag(tag)}
            className="px-2 py-0.5 rounded-full text-[11px] bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-orange-400 hover:text-orange-500 transition-all cursor-pointer shadow-2xs"
          >
            #{tag}
          </button>
        ))}
      </div>
    </div>
  );
};
