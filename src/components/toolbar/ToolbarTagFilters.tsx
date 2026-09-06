"use client";

import React from "react";
import { Tag } from "lucide-react";

interface ToolbarTagFiltersProps {
  allTags: string[];
  tagFilter: string;
  onSelectTag: (tag: string) => void;
}

export const ToolbarTagFilters: React.FC<ToolbarTagFiltersProps> = ({
  allTags,
  tagFilter,
  onSelectTag,
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar py-0.5">
      <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
        <Tag className="w-3 h-3 text-slate-400" />
        標籤:
      </span>

      <button
        onClick={() => onSelectTag("all")}
        className={`px-2 py-0.5 rounded-full font-semibold transition-all shrink-0 cursor-pointer ${
          tagFilter === "all"
            ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs"
            : "bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
        }`}
      >
        全部
      </button>

      {allTags.map((tag) => (
        <button
          key={tag}
          onClick={() => onSelectTag(tag === tagFilter ? "all" : tag)}
          className={`px-2 py-0.5 rounded-full font-semibold transition-all shrink-0 cursor-pointer ${
            tagFilter === tag
              ? "bg-orange-500 text-white shadow-2xs"
              : "bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-orange-50 hover:text-orange-600"
          }`}
        >
          #{tag}
        </button>
      ))}
    </div>
  );
};
