"use client";

import React from "react";
import { inputClass } from "@/components/ui/input";

interface AddTaskTitleDescriptionProps {
  title: string;
  setTitle: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
}

export const AddTaskTitleDescription: React.FC<AddTaskTitleDescriptionProps> = ({
  title,
  setTitle,
  description,
  setDescription,
}) => {
  return (
    <>
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          任務標題 *
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例如：完成季報分析、設計新版首頁..."
          className={inputClass("md")}
        />
      </div>

      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
          任務描述 / 備註
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="補充詳細背景或交付標準..."
          className={inputClass("md", "h-auto py-2.5 resize-none leading-relaxed")}
        />
      </div>
    </>
  );
};
