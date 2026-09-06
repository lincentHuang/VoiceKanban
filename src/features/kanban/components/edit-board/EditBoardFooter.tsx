"use client";

import React from "react";
import { Trash2 } from "lucide-react";

interface Props {
  canDelete: boolean;
  isSubmitDisabled: boolean;
  onCancel: () => void;
  onDelete: () => void;
}

export const EditBoardFooter: React.FC<Props> = ({
  canDelete,
  isSubmitDisabled,
  onCancel,
  onDelete,
}) => {
  return (
    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
      <div>
        {canDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-medium transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>刪除看板</span>
          </button>
        ) : (
          <span className="text-[11px] text-slate-400">需保留至少一個看板</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="px-5 py-2 rounded-xl bg-base44-orange hover:bg-base44-orangeHover disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
        >
          儲存變更
        </button>
      </div>
    </div>
  );
};
