"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface JoinBoardGuestSectionProps {
  nickname: string;
  onNicknameChange: (name: string) => void;
  userSessionName?: string;
}

export const JoinBoardGuestSection: React.FC<JoinBoardGuestSectionProps> = ({
  nickname,
  onNicknameChange,
  userSessionName,
}) => {
  const previewAvatarName = nickname.trim() || userSessionName || "Guest";
  const previewAvatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
    previewAvatarName
  )}`;

  return (
    <div className="p-4 rounded-2xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/70 dark:border-orange-900/40 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-orange-500" />
        <span className="text-xs font-bold text-orange-900 dark:text-orange-200">
          訪客極速加入：輸入您的協作暱稱
        </span>
      </div>

      <div className="flex items-center gap-3">
        <img
          src={previewAvatarUrl}
          alt="預覽頭像"
          className="w-10 h-10 rounded-full border-2 border-orange-300 dark:border-orange-700 bg-white dark:bg-slate-800 shrink-0 shadow-xs"
        />
        <div className="flex-1">
          <input
            type="text"
            placeholder="請輸入暱稱（如：小明、Alex）"
            value={nickname}
            onChange={(e) => onNicknameChange(e.target.value)}
            maxLength={20}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-900/60 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-orange-500"
          />
        </div>
      </div>
      <p className="text-[11px] text-orange-700/80 dark:text-orange-300/80">
        無需註冊即可參與編輯，系統自動指派協同頭像，日後登入可無縫綁定。
      </p>
    </div>
  );
};
