"use client";

import React from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { UserPlus } from "lucide-react";
import { cn } from "@/core/utils/cn";
import { BoardMember } from "@/core/types/task";
import { MemberAvatarItem } from "./MemberAvatarItem";

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

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {isShared && members.length > 0 && (
        <div className="flex items-center -space-x-2 overflow-hidden py-0.5 px-1">
          {members.slice(0, 4).map((member) => {
            const isMe =
              member.uid === userSession.id ||
              (userSession.email && member.email === userSession.email);

            return (
              <MemberAvatarItem
                key={member.uid}
                member={member}
                isMe={!!isMe}
                onClick={() => setIsShareBoardModalOpen(true)}
              />
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
