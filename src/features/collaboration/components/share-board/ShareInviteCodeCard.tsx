"use client";

import React from "react";
import { Sparkles, Check, Copy } from "lucide-react";
import { cn } from "@/core/utils/cn";

interface ShareInviteCodeCardProps {
  inviteCode: string;
  copiedCode: boolean;
  onCopyCode: () => void;
}

export const ShareInviteCodeCard: React.FC<ShareInviteCodeCardProps> = ({
  inviteCode,
  copiedCode,
  onCopyCode,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50/80 to-amber-50/50 dark:from-orange-950/20 dark:to-amber-950/10 border border-orange-200/80 dark:border-orange-900/40 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-orange-800 dark:text-orange-300">
          <Sparkles className="w-3.5 h-3.5 text-orange-500" />
          <span>看板專屬 6 碼邀請代碼</span>
        </div>
        <span className="text-[10px] text-orange-600 dark:text-orange-400 font-medium">
          輸入即可秒加入
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-orange-200 dark:border-orange-900/50 text-center font-mono font-black text-xl tracking-widest text-orange-600 dark:text-orange-400 shadow-2xs select-all">
          {inviteCode || "VK-...."}
        </div>
        <button
          type="button"
          onClick={onCopyCode}
          className={cn(
            "px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs active:scale-95",
            copiedCode
              ? "bg-emerald-500 text-white"
              : "bg-orange-500 hover:bg-orange-600 text-white"
          )}
        >
          {copiedCode ? (
            <>
              <Check className="w-4 h-4" />
              <span>已複製代碼</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>複製代碼</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
