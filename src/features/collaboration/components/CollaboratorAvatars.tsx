"use client";

import React from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { Users, UserPlus, Crown, Edit3, Eye } from "lucide-react";
import { cn } from "@/core/utils/cn";
import { BoardMember } from "@/core/types/task";

interface CollaboratorAvatarsProps {
  className?: string;
  compact?: boolean;
}

export const CollaboratorAvatars: React.FC<CollaboratorAvatarsProps> = ({
  className,
  compact = false,
}) => {
  const {
    boards,
    activeBoardId,
    setIsShareBoardModalOpen,
    userSession,
  } = useKanbanStore();

  const activeBoard = boards.find((b) => b.id === activeBoardId);
  const isShared = !!activeBoard?.isShared;
  const members: BoardMember[] = activeBoard?.members || [];

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

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {isShared && members.length > 0 && (
        <div className="flex items-center -space-x-2 overflow-hidden py-0.5 px-1">
          {members.slice(0, 4).map((member) => {
            const isMe =
              member.uid === userSession.id ||
              (userSession.email && member.email === userSession.email);

            return (
              <div
                key={member.uid}
                className="relative group cursor-pointer transition-transform hover:scale-115 hover:z-20"
                onClick={() => setIsShareBoardModalOpen(true)}
                title={`${member.name} (${roleLabels[member.role] || member.role})${isMe ? " - 您" : ""}`}
              >
                <img
                  src={
                    member.avatarUrl ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                      member.name || member.uid
                    )}`
                  }
                  alt={member.name}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 object-cover shadow-xs"
                />
                <span className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-white dark:bg-slate-900 rounded-full shadow-2xs">
                  {roleIcons[member.role] || roleIcons.editor}
                </span>

                {/* Hover Tooltip */}
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
          })}

          {members.length > 4 && (
            <button
              onClick={() => setIsShareBoardModalOpen(true)}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold flex items-center justify-center shadow-xs cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              title={`還有 ${members.length - 4} 位協作者，點擊查看全部`}
            >
              +{members.length - 4}
            </button>
          )}
        </div>
      )}

      {/* Invite / Share Button */}
      <button
        type="button"
        onClick={() => setIsShareBoardModalOpen(true)}
        className={cn(
          "flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95",
          isShared
            ? "bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-800/60"
            : "bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md"
        )}
        title={isShared ? "管理協作者或複製邀請代碼" : "開啟多人即時協作編輯"}
      >
        <UserPlus className="w-3.5 h-3.5" />
        <span className={compact ? "hidden sm:inline" : "inline"}>
          {isShared ? "邀請" : "邀請協作"}
        </span>
      </button>
    </div>
  );
};
