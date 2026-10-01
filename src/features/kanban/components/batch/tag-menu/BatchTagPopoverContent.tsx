"use client";

import React from "react";
import { Plus } from "lucide-react";
import { useBatchTagMenu } from "./useBatchTagMenu";
import { BatchTagMenuHeader } from "./BatchTagMenuHeader";
import { BatchTagSearchInput } from "./BatchTagSearchInput";
import { BatchTagAppliedChips } from "./BatchTagAppliedChips";
import { BatchTagOptionItem } from "./BatchTagOptionItem";

interface BatchTagPopoverContentProps {
  onClose: () => void;
  menu: ReturnType<typeof useBatchTagMenu>;
}

export const BatchTagPopoverContent: React.FC<BatchTagPopoverContentProps> = ({
  onClose,
  menu,
}) => {
  const {
    query, setQuery, inputRef, trimmed, selectedTasks, allWorkspaceTags,
    tagCounts, selectedTagsCoverage, appliedTags, options, canCreate,
    batchRemoveTag, handleCommitTag, handleCreateAndAdd,
  } = menu;

  return (
    <>
      <BatchTagMenuHeader selectedCount={selectedTasks.length} />

      <BatchTagSearchInput
        query={query}
        setQuery={setQuery}
        inputRef={inputRef}
        canCreate={canCreate}
        firstOption={options[0]}
        onCommitTag={handleCommitTag}
        onCreateAndAdd={handleCreateAndAdd}
      />

      <BatchTagAppliedChips
        appliedTags={appliedTags}
        selectedTagsCoverage={selectedTagsCoverage}
        onRemoveTag={batchRemoveTag}
      />

      <div className="max-h-48 overflow-y-auto custom-scrollbar flex flex-col gap-0.5 pr-0.5">
        {options.length === 0 && !canCreate && (
          <p className="text-xs text-slate-400 py-3 text-center">
            {allWorkspaceTags.length === 0 ? "尚無標籤，輸入文字並按 Enter 建立" : "找不到符合的標籤"}
          </p>
        )}

        {options.map((tag) => (
          <BatchTagOptionItem
            key={tag}
            tag={tag}
            count={tagCounts[tag]}
            coverage={selectedTagsCoverage[tag]}
            onSelect={handleCommitTag}
          />
        ))}

        {canCreate && (
          <button
            type="button"
            onClick={handleCreateAndAdd}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left hover:bg-orange-500/20 text-orange-300 transition-colors cursor-pointer mt-0.5"
          >
            <span className="w-4 h-4 rounded-[4px] border border-dashed border-orange-400 text-orange-400 flex items-center justify-center shrink-0">
              <Plus className="w-3 h-3" strokeWidth={3} />
            </span>
            <span className="flex-1 min-w-0 truncate text-xs font-semibold">
              建立並加入「{trimmed}」
            </span>
          </button>
        )}
      </div>

      <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between">
        <span className="text-[10px] text-slate-400">點擊標籤切換套用</span>
        <button
          type="button"
          onClick={onClose}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
        >
          完成
        </button>
      </div>
    </>
  );
};
