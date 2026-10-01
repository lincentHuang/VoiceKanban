import React from "react";
import { Check, Plus } from "lucide-react";
import { cn } from "@/core/utils/cn";

interface EditTaskTagDropdownProps {
  options: string[];
  selectedTags: string[];
  tagCounts?: Record<string, number>;
  totalTagsCount: number;
  canCreate: boolean;
  createValue: string;
  onToggle: (tag: string) => void;
  onCreate: (tag: string) => void;
}

export const EditTaskTagDropdown: React.FC<EditTaskTagDropdownProps> = ({
  options,
  selectedTags,
  tagCounts,
  totalTagsCount,
  canCreate,
  createValue,
  onToggle,
  onCreate,
}) => {
  return (
    <div
      role="listbox"
      className="absolute top-full left-0 right-0 mt-1.5 z-40 max-h-56 overflow-y-auto custom-scrollbar rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl p-2 shadow-2xl space-y-0.5 animate-in fade-in-0 zoom-in-95 duration-150"
    >
      {options.length === 0 && !canCreate && (
        <p className="text-xs text-slate-400 px-2 py-3 text-center">
          {totalTagsCount === 0 ? "尚無標籤，輸入文字按 Enter 即可建立" : "找不到符合的標籤"}
        </p>
      )}

      {options.map((tag) => {
        const isSelected = selectedTags.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onToggle(tag)}
            className={cn(
              "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer",
              isSelected
                ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400"
                : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
            )}
          >
            <span
              className={cn(
                "w-4 h-4 rounded-[5px] border flex items-center justify-center shrink-0 transition-colors",
                isSelected
                  ? "bg-orange-500 border-orange-500 text-white"
                  : "border-slate-300 dark:border-slate-600"
              )}
            >
              {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
            </span>
            <span className="flex-1 min-w-0 truncate text-xs font-medium">
              #{tag}
            </span>
            {tagCounts?.[tag] ? (
              <span className="text-[11px] font-mono text-slate-400 shrink-0">
                {tagCounts[tag]}
              </span>
            ) : null}
          </button>
        );
      })}

      {canCreate && (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onCreate(createValue)}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-orange-600 dark:text-orange-400"
        >
          <span className="w-4 h-4 rounded-[5px] border border-dashed border-orange-400 text-orange-500 flex items-center justify-center shrink-0">
            <Plus className="w-3 h-3" strokeWidth={3} />
          </span>
          <span className="flex-1 min-w-0 truncate text-xs font-medium">
            建立「{createValue}」
          </span>
        </button>
      )}
    </div>
  );
};
