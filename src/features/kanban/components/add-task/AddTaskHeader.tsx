"use client";

import React from "react";
import { X } from "lucide-react";

interface AddTaskHeaderProps {
  onClose: () => void;
}

export const AddTaskHeader: React.FC<AddTaskHeaderProps> = ({ onClose }) => {
  return (
    <div className="flex items-center justify-between p-5 sm:p-6 pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">新增任務卡片</h3>
        <p className="text-xs text-slate-500">手動建立卡片或自訂詳細參數</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
