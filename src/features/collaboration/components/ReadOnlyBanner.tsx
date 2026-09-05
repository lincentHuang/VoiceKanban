"use client";

import React from "react";
import { Eye, ShieldAlert } from "lucide-react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";

export const ReadOnlyBanner: React.FC = () => {
  const { boards, activeBoardId, userSession, getCurrentUserRole } = useKanbanStore();
  const activeBoard = boards.find((b) => b.id === activeBoardId);

  if (!activeBoard?.isShared) return null;

  const role = getCurrentUserRole(activeBoardId);
  if (role !== "viewer") return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pt-2">
      <div className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs shadow-xs backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold mr-1.5">👁️ 唯讀檢視模式：</span>
            <span>您在此看板的權限為「檢視者」，可即時瀏覽所有任務與卡片變更，無法新增、編輯或拖曳卡片。</span>
          </div>
        </div>
        <div className="shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-200/60 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
          唯讀保護中
        </div>
      </div>
    </div>
  );
};
