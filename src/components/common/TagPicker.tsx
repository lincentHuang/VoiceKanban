"use client";

import React, { useMemo, useRef, useState } from "react";
import { Check, Plus, Search, Tag as TagIcon, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { inputClass } from "@/components/ui/input";
import { cn } from "@/core/utils/cn";

interface TagPickerProps {
  /** Tags currently on the task. */
  selected: string[];
  /** Every tag already used anywhere in the workspace, for quick re-use. */
  allTags: string[];
  /** How many tasks use each tag, shown on the right of each row. */
  counts?: Record<string, number>;
  onToggle: (tag: string) => void;
  /** Rendered inside the popover trigger. */
  children: React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
}

/**
 * Notion-style tag popover: one search box that both filters the existing tags
 * and doubles as the "create a new tag" field, so browsing what already exists
 * and adding something new are the same gesture.
 */
export const TagPicker: React.FC<TagPickerProps> = ({
  selected,
  allTags,
  counts,
  onToggle,
  children,
  className,
  align = "start",
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = query.trim();

  const options = useMemo(() => {
    // Selected tags first so the current state is readable at a glance, then the
    // rest of the workspace's tags ordered by how often they are used.
    const pool = Array.from(new Set([...selected, ...allTags])).filter(Boolean);
    const lower = trimmed.toLowerCase();
    return pool
      .filter((t) => !lower || t.toLowerCase().includes(lower))
      .sort((a, b) => {
        const aSel = selected.includes(a) ? 0 : 1;
        const bSel = selected.includes(b) ? 0 : 1;
        if (aSel !== bSel) return aSel - bSel;
        return (counts?.[b] || 0) - (counts?.[a] || 0);
      });
  }, [selected, allTags, counts, trimmed]);

  const canCreate =
    trimmed.length > 0 &&
    !options.some((t) => t.toLowerCase() === trimmed.toLowerCase());

  const commit = (tag: string) => {
    onToggle(tag);
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align={align}
        className={cn("w-[min(20rem,calc(100vw-1.5rem))] p-2", className)}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <div className="relative mb-2">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing || e.key === "Process") return;
              if (e.key === "Enter") {
                e.preventDefault();
                if (canCreate) commit(trimmed);
                else if (options.length > 0) commit(options[0]);
              }
            }}
            placeholder="搜尋或建立標籤..."
            className={inputClass("sm", "pl-8")}
          />
        </div>

        <div className="max-h-56 overflow-y-auto custom-scrollbar -mx-0.5 px-0.5">
          {options.length === 0 && !canCreate && (
            <p className="text-xs text-slate-400 px-2 py-4 text-center">
              {allTags.length === 0 ? "尚無標籤，輸入文字即可建立" : "找不到符合的標籤"}
            </p>
          )}

          {options.map((tag) => {
            const isSelected = selected.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => commit(tag)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors cursor-pointer",
                  isSelected
                    ? "bg-orange-50 dark:bg-orange-500/10"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <span
                  className={cn(
                    "w-4 h-4 rounded-[5px] border flex items-center justify-center shrink-0",
                    isSelected
                      ? "bg-orange-500 border-orange-500 text-white"
                      : "border-slate-300 dark:border-slate-600"
                  )}
                >
                  {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
                </span>
                <span className="flex-1 min-w-0 truncate text-xs font-medium text-slate-700 dark:text-slate-200">
                  #{tag}
                </span>
                {counts?.[tag] ? (
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    {counts[tag]}
                  </span>
                ) : null}
              </button>
            );
          })}

          {canCreate && (
            <button
              type="button"
              onClick={() => commit(trimmed)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <span className="w-4 h-4 rounded-[5px] border border-dashed border-orange-400 text-orange-500 flex items-center justify-center shrink-0">
                <Plus className="w-3 h-3" strokeWidth={3} />
              </span>
              <span className="flex-1 min-w-0 truncate text-xs font-medium text-slate-700 dark:text-slate-200">
                建立「{trimmed}」
              </span>
            </button>
          )}
        </div>

        {selected.length > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-200/70 dark:border-slate-800 flex flex-wrap gap-1">
            {selected.map((t) => (
              <span
                key={t}
                className="pl-2 pr-1 py-0.5 rounded-full bg-orange-100/70 dark:bg-orange-500/15 text-orange-700 dark:text-orange-300 text-[11px] font-semibold flex items-center gap-0.5"
              >
                #{t}
                <button
                  type="button"
                  onClick={() => onToggle(t)}
                  aria-label={`移除標籤 ${t}`}
                  className="p-0.5 rounded-full hover:bg-orange-200/70 dark:hover:bg-orange-500/25 cursor-pointer"
                >
                  <X className="w-2.5 h-2.5" strokeWidth={3} />
                </button>
              </span>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

/** Default trigger button — a compact "manage tags" affordance. */
export const TagPickerTriggerButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { label?: string }
>(({ label = "管理標籤", className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      "inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer",
      className
    )}
    {...props}
  >
    <TagIcon className="w-3.5 h-3.5" />
    {label}
  </button>
));
TagPickerTriggerButton.displayName = "TagPickerTriggerButton";
