"use client";

import React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Board } from "@/core/types/task";

interface ByokModelSelectSectionProps {
  selectedModel: "gemini-2.0-flash" | "gemini-1.5-pro";
  setSelectedModel: (v: "gemini-2.0-flash" | "gemini-1.5-pro") => void;
  defaultBoard: string;
  setDefaultBoard: (v: string) => void;
  boards: Board[];
}

export const ByokModelSelectSection: React.FC<ByokModelSelectSectionProps> = ({
  selectedModel,
  setSelectedModel,
  defaultBoard,
  setDefaultBoard,
  boards,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          多模態模型
        </label>
        <Select
          value={selectedModel}
          onValueChange={(val) => setSelectedModel(val as any)}
        >
          <SelectTrigger className="w-full h-9 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gemini-2.0-flash">gemini-2.0-flash (推薦 - 極速)</SelectItem>
            <SelectItem value="gemini-1.5-pro">gemini-1.5-pro (深度語義)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          預設注入看板
        </label>
        <Select value={defaultBoard} onValueChange={(val) => setDefaultBoard(val)}>
          <SelectTrigger className="w-full h-9 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {boards.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.icon} {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
