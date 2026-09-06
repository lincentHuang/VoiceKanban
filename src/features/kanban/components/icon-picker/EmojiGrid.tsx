"use client";

import React from "react";
import { cn } from "@/core/utils/cn";
import { EMOJI_CATEGORIES } from "./emojiData";

interface EmojiGridProps {
  value: string;
  onSelect: (emoji: string) => void;
}

export const EmojiGrid: React.FC<EmojiGridProps> = ({ value, onSelect }) => {
  return (
    <div className="space-y-2.5 max-h-48 overflow-y-auto custom-scrollbar pr-0.5">
      {EMOJI_CATEGORIES.map((cat) => (
        <div key={cat.name}>
          <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-1 px-0.5">
            {cat.name}
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {cat.emojis.map((em) => {
              const isSelected = value === em;
              return (
                <button
                  key={em}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(em);
                  }}
                  className={cn(
                    "w-8 h-8 rounded-lg text-base flex items-center justify-center transition-transform hover:scale-115 active:scale-95 cursor-pointer",
                    isSelected
                      ? "bg-orange-100 dark:bg-orange-950/60 border-2 border-orange-500 font-bold"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  {em}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
