"use client";

import React, { useState } from "react";
import { Ban } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/core/utils/cn";
import { EMOJI_CATEGORIES } from "./icon-picker/emojiData";
import { EmojiGrid } from "./icon-picker/EmojiGrid";
import { IconPickerTrigger } from "./icon-picker/IconPickerTrigger";

export { EMOJI_CATEGORIES };

export interface ColumnIconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  size?: "sm" | "md";
  variant?: "button" | "ghost";
  children?: React.ReactNode;
}

export const ColumnIconPicker: React.FC<ColumnIconPickerProps> = ({
  value,
  onChange,
  size = "md",
  variant = "button",
  children,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <IconPickerTrigger size={size} variant={variant} value={value}>
          {children}
        </IconPickerTrigger>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        collisionPadding={12}
        className="w-64 p-3 shadow-2xl rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl z-[9999]"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
          <span className="font-bold text-slate-800 dark:text-slate-200">選擇欄位圖示</span>
          <span className="text-[11px] text-slate-400">{value ? `目前：${value}` : "目前：無圖示"}</span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChange("");
            setOpen(false);
          }}
          className={cn(
            "w-full flex items-center justify-center gap-1.5 py-1.5 px-2 mb-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer",
            !value
              ? "bg-orange-50 dark:bg-orange-950/50 border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 font-bold"
              : "bg-slate-50 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          )}
        >
          <Ban className="w-3.5 h-3.5" />
          <span>不使用圖示 (純文字)</span>
        </button>

        <EmojiGrid
          value={value}
          onSelect={(em) => {
            onChange(em);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};
