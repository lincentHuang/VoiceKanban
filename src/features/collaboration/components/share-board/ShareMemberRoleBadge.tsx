"use client";

import React from "react";
import { Crown, Edit3, Eye } from "lucide-react";
import { CollaboratorRole, BoardMember } from "@/core/types/task";

interface ShareMemberRoleBadgeProps {
  member: BoardMember;
  isOwner: boolean;
  onRoleChange: (memberUid: string, newRole: CollaboratorRole) => void;
}

export const ShareMemberRoleBadge: React.FC<ShareMemberRoleBadgeProps> = ({
  member,
  isOwner,
  onRoleChange,
}) => {
  const isMemberOwner = member.role === "owner";

  if (isOwner && !isMemberOwner) {
    return (
      <select
        value={member.role}
        onChange={(e) => onRoleChange(member.uid, e.target.value as CollaboratorRole)}
        className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-hidden cursor-pointer"
      >
        <option value="editor">✏️ 編輯者</option>
        <option value="viewer">👁️ 檢視者 (唯讀)</option>
      </select>
    );
  }

  return (
    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-xs font-medium text-slate-600 dark:text-slate-300">
      {isMemberOwner ? (
        <>
          <Crown className="w-3 h-3 text-amber-500" />
          <span>擁有者</span>
        </>
      ) : member.role === "viewer" ? (
        <>
          <Eye className="w-3 h-3 text-slate-400" />
          <span>檢視者</span>
        </>
      ) : (
        <>
          <Edit3 className="w-3 h-3 text-blue-500" />
          <span>編輯者</span>
        </>
      )}
    </div>
  );
};
