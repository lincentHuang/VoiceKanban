"use client";

import React from "react";
import { BoardMember } from "@/core/types/task";

interface ShareRemoveMemberModalProps {
  memberToRemove: BoardMember | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ShareRemoveMemberModal: React.FC<ShareRemoveMemberModalProps> = ({
  memberToRemove,
  onCancel,
  onConfirm,
}) => {
  if (!memberToRemove) return null;

  return (
    <div className="absolute inset-0 z-20 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-xs bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xl space-y-3">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
          確定移出協作成員？
        </h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          成員「{memberToRemove.name}」將無法再檢視或編輯此看板。
        </p>
        <div className="flex gap-2 justify-end pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            確認移出
          </button>
        </div>
      </div>
    </div>
  );
};
