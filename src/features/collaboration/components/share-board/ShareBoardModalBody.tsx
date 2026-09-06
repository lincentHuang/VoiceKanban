"use client";

import React from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Board, CollaboratorRole, BoardMember } from "@/core/types/task";
import { ShareInviteCodeCard } from "./ShareInviteCodeCard";
import { ShareInviteLinkRow } from "./ShareInviteLinkRow";
import { ShareMemberList } from "./ShareMemberList";

interface ShareBoardModalBodyProps {
  isLoading: boolean;
  errorMsg: string;
  inviteCode: string;
  inviteUrl: string;
  copiedCode: boolean;
  copiedLink: boolean;
  activeBoard: Board;
  isOwner: boolean;
  userSession: { id?: string; email?: string };
  onCopyCode: () => void;
  onCopyLink: () => void;
  onRoleChange: (memberUid: string, newRole: CollaboratorRole) => void;
  onSelectToRemove: (member: BoardMember) => void;
}

export const ShareBoardModalBody: React.FC<ShareBoardModalBodyProps> = ({
  isLoading,
  errorMsg,
  inviteCode,
  inviteUrl,
  copiedCode,
  copiedLink,
  activeBoard,
  isOwner,
  userSession,
  onCopyCode,
  onCopyLink,
  onRoleChange,
  onSelectToRemove,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
      {isLoading && (
        <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
          <p className="text-xs font-medium">正在為此看板生成專屬協同金鑰與邀請連結...</p>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2.5 text-rose-700 dark:text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {!isLoading && (
        <>
          <ShareInviteCodeCard
            inviteCode={inviteCode}
            copiedCode={copiedCode}
            onCopyCode={onCopyCode}
          />
          <ShareInviteLinkRow
            inviteUrl={inviteUrl}
            copiedLink={copiedLink}
            onCopyLink={onCopyLink}
          />
          <ShareMemberList
            members={activeBoard.members || []}
            isOwner={isOwner}
            userSession={userSession}
            onRoleChange={onRoleChange}
            onSelectToRemove={onSelectToRemove}
          />
        </>
      )}
    </div>
  );
};
