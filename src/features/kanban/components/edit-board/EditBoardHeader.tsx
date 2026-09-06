"use client";

import React from "react";
import { X, Layout } from "lucide-react";

interface Props {
  onClose: () => void;
}

export const EditBoardHeader: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
          <Layout className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">編輯看板設定</h3>
          <p className="text-xs text-slate-400">修改看板名稱、代表圖示與簡短說明</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
