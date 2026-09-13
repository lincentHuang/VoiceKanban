"use client";

import React from "react";
import { ColumnIconPicker } from "../ColumnIconPicker";
import { inputClass } from "@/components/ui/input";

interface Props {
  name: string;
  onSetName: (name: string) => void;
  icon: string;
  onSetIcon: (icon: string) => void;
  description: string;
  onSetDescription: (description: string) => void;
}

export const EditBoardFields: React.FC<Props> = ({
  name,
  onSetName,
  icon,
  onSetIcon,
  description,
  onSetDescription,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
          看板圖示與名稱 <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          <ColumnIconPicker
            value={icon}
            onChange={onSetIcon}
            size="md"
          />
          <input
            type="text"
            value={name}
            onChange={(e) => onSetName(e.target.value)}
            placeholder="例如：工作專案、個人生活、產品規劃..."
            autoFocus
            required
            className={inputClass("md", "flex-1 bg-white/60 dark:bg-slate-800/60")}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
          看板描述 (選填)
        </label>
        <textarea
          value={description}
          onChange={(e) => onSetDescription(e.target.value)}
          placeholder="簡要描述此看板的主要用途與分類目標..."
          rows={3}
          className={inputClass("md", "h-auto py-2.5 bg-white/60 dark:bg-slate-800/60 resize-none leading-relaxed")}
        />
      </div>
    </div>
  );
};
