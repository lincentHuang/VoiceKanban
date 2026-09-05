"use client";

import React, { useState } from "react";
import { SmilePlus, Ban } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/core/utils/cn";

export const EMOJI_CATEGORIES = [
  {
    name: "常用狀態",
    emojis: ["✨", "📥", "📋", "⚡", "⏳", "✅", "🧪", "🎨", "🚀", "💡", "📌", "🔍", "🔥", "🎯", "📦"],
  },
  {
    name: "專案與管理",
    emojis: ["💼", "🛠️", "🚩", "💬", "📊", "📝", "🔔", "🌟", "🚧", "🏆", "☕", "📅", "🏷️", "🔒", "📈", "🤖"],
  },
];

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
        {children ? (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            className="focus:outline-none focus:ring-1 focus:ring-orange-500 rounded-md shrink-0 cursor-pointer"
            title={value ? `目前圖示：${value} (點擊更換)` : "選擇圖示"}
            aria-label="選擇欄位圖示"
          >
            {children}
          </button>
        ) : (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            className={cn(
              "flex items-center justify-center rounded-xl border transition-all cursor-pointer select-none shrink-0 focus:outline-none focus:border-orange-500",
              size === "sm" ? "w-8 h-8 text-sm" : "w-9 h-9 text-base",
              variant === "ghost"
                ? "border-transparent hover:bg-black/5 dark:hover:bg-white/10"
                : value
                ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-500 hover:bg-orange-50/40 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100"
                : "bg-slate-100/90 dark:bg-slate-800/60 border-dashed border-slate-300 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:border-slate-400"
            )}
            title={value ? `目前圖示：${value} (點擊更換)` : "選擇圖示 (點擊開啟)"}
            aria-label="選擇欄位圖示"
          >
            {value ? (
              <span>{value}</span>
            ) : (
              <SmilePlus className="w-4 h-4 opacity-70" />
            )}
          </button>
        )}
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
          {value ? (
            <span className="text-[11px] text-slate-400">目前：{value}</span>
          ) : (
            <span className="text-[11px] text-slate-400">目前：無圖示</span>
          )}
        </div>

        {/* Option: No Icon */}
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

        {/* Emoji Grid */}
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
                        onChange(em);
                        setOpen(false);
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
      </PopoverContent>
    </Popover>
  );
};
