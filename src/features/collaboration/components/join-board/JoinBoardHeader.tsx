"use client";

import React from "react";
import { UserPlus, X } from "lucide-react";

interface JoinBoardHeaderProps {
  onClose: () => void;
}

export const JoinBoardHeader: React.FC<JoinBoardHeaderProps> = ({ onClose }) => {
  return (
    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-2xl bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
          <UserPlus className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            加入協作看板
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            輸入 6 碼邀請短代碼，即刻與團隊夥伴共同編輯
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
