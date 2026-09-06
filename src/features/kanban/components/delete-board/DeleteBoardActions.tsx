"use client";

import React from "react";
import { Trash2 } from "lucide-react";

interface Props {
  isOnlyBoard: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const DeleteBoardActions: React.FC<Props> = ({
  isOnlyBoard,
  onCancel,
  onConfirm,
}) => {
  return (
    <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
      {isOnlyBoard ? (
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
        >
          我知道了
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>確認刪除看板</span>
          </button>
        </>
      )}
    </div>
  );
};
