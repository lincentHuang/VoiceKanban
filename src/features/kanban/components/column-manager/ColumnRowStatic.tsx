"use client";

import React from "react";
import { Edit2, Trash2 } from "lucide-react";
import { Column } from "@/core/types/task";

interface ColumnRowStaticProps {
  col: Column;
  onStartEdit: () => void;
  onDelete: () => void;
  canDelete: boolean;
}

export const ColumnRowStatic: React.FC<ColumnRowStaticProps> = ({
  col,
  onStartEdit,
  onDelete,
  canDelete,
}) => {
  return (
    <>
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {col.icon ? (
          <span className="text-lg shrink-0 select-none">{col.icon}</span>
        ) : (
          <span className="w-6 h-6 rounded-lg bg-slate-200/60 dark:bg-slate-700/60 flex items-center justify-center text-[10px] font-mono font-bold text-slate-400 shrink-0 select-none">
            Aa
          </span>
        )}
        <div className="min-w-0 flex items-center gap-1.5">
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
            {col.title}
          </span>
          {col.isCustom && (
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-semibold shrink-0">
              自訂
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-2">
        <button
          onClick={onStartEdit}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          title="編輯名稱與圖示"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>

        {canDelete && (
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            title="刪除此欄位 (內部任務將自動移轉)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </>
  );
};
