"use client";

import React from "react";
import { Shield, UserPlus } from "lucide-react";
import { CollaboratorRole, BoardMember } from "@/core/types/task";
import { ShareMemberItem } from "./ShareMemberItem";

interface ShareMemberListProps {
  members: BoardMember[];
  isOwner: boolean;
  userSession: { id?: string; email?: string };
  onRoleChange: (memberUid: string, newRole: CollaboratorRole) => void;
  onSelectToRemove: (member: BoardMember) => void;
}

export const ShareMemberList: React.FC<ShareMemberListProps> = ({
  members,
  isOwner,
  userSession,
  onRoleChange,
  onSelectToRemove,
}) => {
  return (
    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-slate-400" />
          <span>協作成員與權限 ({members.length})</span>
        </h3>
        <span className="text-[11px] text-slate-400">
          {isOwner ? "👑 您是看板擁有者" : "✏️ 您以成員身分協同中"}
        </span>
      </div>

      {members.length <= 1 && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700/60 text-center space-y-1.5">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 mx-auto flex items-center justify-center">
            <UserPlus className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
            目前尚無其他協作者
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            複製上方邀請代碼或連結分享給朋友或同事，即可一同即時拖曳與編輯任務！
          </p>
        </div>
      )}

      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {members.map((member) => {
          const isMe =
            member.uid === userSession.id ||
            (userSession.email ? member.email === userSession.email : false);

          return (
            <ShareMemberItem
              key={member.uid}
              member={member}
              isMe={isMe}
              isOwner={isOwner}
              onRoleChange={onRoleChange}
              onSelectToRemove={onSelectToRemove}
            />
          );
        })}
      </div>
    </div>
  );
};
