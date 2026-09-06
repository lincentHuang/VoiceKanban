"use client";

import React from "react";
import { useEscapeKey } from "@/core/hooks/useEscapeKey";
import { useShareBoardModal } from "./share-board/useShareBoardModal";
import { ShareBoardHeader } from "./share-board/ShareBoardHeader";
import { ShareBoardModalBody } from "./share-board/ShareBoardModalBody";
import { ShareRemoveMemberModal } from "./share-board/ShareRemoveMemberModal";

export const ShareBoardModal: React.FC = () => {
  const {
    isShareBoardModalOpen,
    setIsShareBoardModalOpen,
    activeBoard,
    userSession,
    isOwner,
    isLoading,
    inviteCode,
    inviteUrl,
    copiedCode,
    copiedLink,
    errorMsg,
    memberToRemove,
    setMemberToRemove,
    handleCopyCode,
    handleCopyLink,
    handleRoleChange,
    handleConfirmRemove,
  } = useShareBoardModal();

  useEscapeKey(() => setIsShareBoardModalOpen(false));

  if (!isShareBoardModalOpen || !activeBoard) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-2rem)] animate-in zoom-in-95 duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <ShareBoardHeader
          activeBoard={activeBoard}
          onClose={() => setIsShareBoardModalOpen(false)}
        />

        <ShareBoardModalBody
          isLoading={isLoading}
          errorMsg={errorMsg}
          inviteCode={inviteCode}
          inviteUrl={inviteUrl}
          copiedCode={copiedCode}
          copiedLink={copiedLink}
          activeBoard={activeBoard}
          isOwner={isOwner}
          userSession={userSession}
          onCopyCode={handleCopyCode}
          onCopyLink={handleCopyLink}
          onRoleChange={handleRoleChange}
          onSelectToRemove={setMemberToRemove}
        />

        <ShareRemoveMemberModal
          memberToRemove={memberToRemove}
          onCancel={() => setMemberToRemove(null)}
          onConfirm={handleConfirmRemove}
        />

        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between shrink-0 text-xs">
          <span className="text-[11px] text-slate-400">支援訪客免登入即時加入編輯</span>
          <button
            type="button"
            onClick={() => setIsShareBoardModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold transition-colors cursor-pointer"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
export default ShareBoardModal;
