"use client";

import React from "react";
import { Crown, Edit3, Eye } from "lucide-react";
import { BoardMember } from "@/core/types/task";

const roleIcons = {
  owner: <Crown className="w-2.5 h-2.5 text-amber-500" />,
  editor: <Edit3 className="w-2.5 h-2.5 text-blue-500" />,
  viewer: <Eye className="w-2.5 h-2.5 text-slate-400" />,
};

const roleLabels = {
  owner: "擁有者",
  editor: "編輯者",
  viewer: "檢視者",
};

interface MemberAvatarItemProps {
  member: BoardMember;
  isMe: boolean;
  onClick: () => void;
}

export const MemberAvatarItem: React.FC<MemberAvatarItemProps> = ({
  member,
  isMe,
  onClick,
}) => {
  const avatarUrl =
    member.avatarUrl ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
      member.name || member.uid
    )}`;

  return (
    <div
      className="relative group cursor-pointer transition-transform hover:scale-115 hover:z-20"
      onClick={onClick}
      title={`${member.name} (${roleLabels[member.role] || member.role})${isMe ? " - 您" : ""}`}
    >
      <img
        src={avatarUrl}
        alt={member.name}
        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 object-cover shadow-xs"
      />
      <span className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-white dark:bg-slate-900 rounded-full shadow-2xs">
        {roleIcons[member.role] || roleIcons.editor}
      </span>

      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:flex flex-col items-center pointer-events-none z-30">
        <div className="bg-slate-900 text-white text-[10px] rounded px-2 py-0.5 whitespace-nowrap shadow-lg flex items-center gap-1">
          <span className="font-bold">{member.name}</span>
          <span className="opacity-75">({roleLabels[member.role]})</span>
          {isMe && <span className="text-orange-400 font-bold">(您)</span>}
        </div>
        <div className="w-1.5 h-1.5 bg-slate-900 rotate-45 -mt-0.5" />
      </div>
    </div>
  );
};
