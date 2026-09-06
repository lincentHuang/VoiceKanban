"use client";

import React from "react";

interface TableRowTagsProps {
  tags?: string[];
}

export const TableRowTags: React.FC<TableRowTagsProps> = ({ tags }) => {
  if (!tags || tags.length === 0) {
    return <span className="text-slate-400 italic text-[11px]">-</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((t) => (
        <span
          key={t}
          className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px]"
        >
          #{t}
        </span>
      ))}
    </div>
  );
};
