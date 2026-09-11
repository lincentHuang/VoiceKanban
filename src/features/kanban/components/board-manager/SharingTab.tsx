"use client";

import React from "react";
import { Users, ExternalLink } from "lucide-react";
import { Board } from "@/core/types/task";
import { MemberAvatarItem } from "@/features/collaboration";

interface SharingTabProps {
  activeBoard: Board | undefined;
  onOpenSharing: () => void;
}

export const SharingTab: React.FC<SharingTabProps> = ({ activeBoard, onOpenSharing }) => {
  const isShared = !!activeBoard?.isShared;
  const members = activeBoard?.members || [];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">共享狀態</label>
        <div
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold ${
            isShared
              ? "bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400"
              : "bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400"
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          <span>{isShared ? `共享中・${members.length} 位協作成員` : "尚未開啟共享，僅自己可見"}</span>
        </div>
      </div>

      {isShared && members.length > 0 && (
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">協作成員</label>
          <div className="flex items-center -space-x-2 overflow-hidden py-0.5 px-1">
            {members.slice(0, 8).map((member) => (
              <MemberAvatarItem key={member.uid} member={member} isMe={false} onClick={onOpenSharing} />
            ))}
            {members.length > 8 && (
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold flex items-center justify-center shadow-xs">
                +{members.length - 8}
              </span>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onOpenSharing}
        className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-base44-orange hover:bg-base44-orangeHover text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        <span>{isShared ? "管理協作成員與邀請代碼" : "開啟多人即時協作"}</span>
      </button>
    </div>
  );
};
