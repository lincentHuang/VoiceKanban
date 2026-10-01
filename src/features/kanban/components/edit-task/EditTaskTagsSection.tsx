import React from "react";
import { Tag } from "lucide-react";
import { fieldButtonClass, inputClass } from "@/components/ui/input";
import { useEditTaskTags } from "./tags/useEditTaskTags";
import { EditTaskTagDropdown } from "./tags/EditTaskTagDropdown";
import { EditTaskTagChips } from "./tags/EditTaskTagChips";

interface EditTaskTagsSectionProps {
  tags: string[];
  /** Every tag used across the workspace, offered for quick re-use. */
  allTags: string[];
  tagCounts?: Record<string, number>;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export const EditTaskTagsSection: React.FC<EditTaskTagsSectionProps> = ({
  tags, allTags, tagCounts, onAddTag, onRemoveTag,
}) => {
  const {
    tagInput, setTagInput, isOpen, setIsOpen, containerRef, inputRef,
    trimmed, options, canCreate, handleToggle, handleAdd,
  } = useEditTaskTags({ tags, allTags, tagCounts, onAddTag, onRemoveTag });

  return (
    <div>
      {/* 標籤管理標頭（已移除右側冗餘按鈕） */}
      <div className="flex items-center gap-2 mb-2">
        <Tag className="w-4 h-4 text-slate-400" />
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">標籤管理</h4>
      </div>

      {/* 輸入框與即時下拉選單容器 */}
      <div ref={containerRef} className="relative mb-2">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={tagInput}
            onFocus={() => setIsOpen(true)}
            onClick={() => setIsOpen(true)}
            onChange={(e) => {
              setTagInput(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing || e.key === "Process") return;
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              } else if (e.key === "Escape") {
                setIsOpen(false);
              }
            }}
            placeholder="輸入標籤按 Enter..."
            aria-expanded={isOpen}
            aria-haspopup="listbox"
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

        {isOpen && (
          <EditTaskTagDropdown
            options={options}
            selectedTags={tags}
            tagCounts={tagCounts}
            totalTagsCount={allTags.length}
            canCreate={canCreate}
            createValue={trimmed}
            onToggle={handleToggle}
            onCreate={(val) => { onAddTag(val); setTagInput(""); }}
          />
        )}
      </div>

      {/* 已套用標籤清單（尚未加上標籤時純淨無冗餘文字） */}
      <EditTaskTagChips tags={tags} onRemoveTag={onRemoveTag} />
    </div>
  );
};
