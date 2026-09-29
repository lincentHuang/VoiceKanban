"use client";

import React from "react";
import { X } from "lucide-react";

interface BatchTagAppliedChipsProps {
  appliedTags: string[];
  selectedTagsCoverage: Record<string, "all" | "some">;
  onRemoveTag: (tag: string) => void;
}

export const BatchTagAppliedChips: React.FC<BatchTagAppliedChipsProps> = ({
  appliedTags,
  selectedTagsCoverage,
  onRemoveTag,
}) => {
  if (appliedTags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 px-0.5 max-h-20 overflow-y-auto custom-scrollbar">
      {appliedTags.map((tag) => {
        const coverage = selectedTagsCoverage[tag];
        const isAll = coverage === "all";

        return (
          <span
            key={tag}
            className={`inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full text-[11px] font-semibold border transition-all ${
              isAll
                ? "bg-orange-500/20 text-orange-300 border-orange-500/40"
                : "bg-slate-800/80 text-orange-300/80 border-orange-400/30 border-dashed"
            }`}
            title={isAll ? "所有已選任務皆有此標籤" : "部分已選任務有此標籤"}
          >
            <span>#{tag}</span>
            {!isAll && (
              <span className="text-[9px] text-orange-400/70 font-mono">(部分)</span>
            )}
            <button
              type="button"
              onClick={() => onRemoveTag(tag)}
              className="p-0.5 rounded-full hover:bg-orange-500/30 text-orange-300 hover:text-white transition-colors cursor-pointer"
              title="從所有已選任務中移除此標籤"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        );
      })}
    </div>
  );
};
