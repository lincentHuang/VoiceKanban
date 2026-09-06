"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/core/utils/cn";
import { CollaboratorRole, BoardMember } from "@/core/types/task";
import { ShareMemberRoleBadge } from "./ShareMemberRoleBadge";

interface ShareMemberItemProps {
  member: BoardMember;
  isMe: boolean;
  isOwner: boolean;
  onRoleChange: (memberUid: string, newRole: CollaboratorRole) => void;
  onSelectToRemove: (member: BoardMember) => void;
}

export const ShareMemberItem: React.FC<ShareMemberItemProps> = ({
  member,
  isMe,
  isOwner,
  onRoleChange,
  onSelectToRemove,
}) => {
  const isMemberOwner = member.role === "owner";

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 p-2.5 rounded-2xl border transition-all text-xs",
        isMe
          ? "bg-orange-50/40 dark:bg-orange-950/20 border-orange-200/70 dark:border-orange-900/50"
          : "bg-white dark:bg-slate-850 border-slate-200/80 dark:border-slate-800"
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <img
          src={
            member.avatarUrl ||
            `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
              member.name || member.uid
            )}`
          }
          alt={member.name}
          className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0 object-cover"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-800 dark:text-slate-100 truncate">
              {member.name}
            </span>
            {isMe && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-orange-100 dark:bg-orange-900/60 text-orange-700 dark:text-orange-300">
                您
              </span>
            )}
          </div>
          {member.email && (
            <p className="text-[11px] text-slate-400 truncate max-w-[140px] sm:max-w-[200px]">
              {member.email}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <ShareMemberRoleBadge
          member={member}
          isOwner={isOwner}
          onRoleChange={onRoleChange}
        />

        {isOwner && !isMemberOwner && (
          <button
            type="button"
            onClick={() => onSelectToRemove(member)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            title="移出此成員"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
