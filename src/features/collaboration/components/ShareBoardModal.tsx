"use client";

import React, { useState, useEffect } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { useEscapeKey } from "@/core/hooks/useEscapeKey";
import {
  X,
  Copy,
  Check,
  UserPlus,
  Users,
  Shield,
  Crown,
  Edit3,
  Eye,
  Trash2,
  Share2,
  Sparkles,
  Link,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/core/utils/cn";
import { CollaboratorRole, BoardMember } from "@/core/types/task";

export const ShareBoardModal: React.FC = () => {
  const {
    isShareBoardModalOpen,
    setIsShareBoardModalOpen,
    boards,
    activeBoardId,
    userSession,
    enableActiveBoardSharing,
    updateMemberRole,
    removeMemberFromBoard,
    getCurrentUserRole,
  } = useKanbanStore();

  useEscapeKey(() => setIsShareBoardModalOpen(false));

  const [isLoading, setIsLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [memberToRemove, setMemberToRemove] = useState<BoardMember | null>(null);

  const activeBoard = boards.find((b) => b.id === activeBoardId);
  const myRole = getCurrentUserRole(activeBoardId);
  const isOwner = myRole === "owner";

  // Automatically ensure board has sharing enabled and code generated
  useEffect(() => {
    if (!isShareBoardModalOpen || !activeBoard) return;

    if (activeBoard.inviteCode) {
      setInviteCode(activeBoard.inviteCode);
    } else {
      setIsLoading(true);
      setErrorMsg("");
      enableActiveBoardSharing()
        .then((code) => {
          setInviteCode(code);
        })
        .catch((err) => {
          console.error("Failed to enable sharing:", err);
          setErrorMsg("無法產生邀請代碼，請檢查連線後重試。");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isShareBoardModalOpen, activeBoard?.id, activeBoard?.inviteCode]);

  if (!isShareBoardModalOpen || !activeBoard) return null;

  const members: BoardMember[] = activeBoard.members || [];
  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/?invite=${inviteCode}`
      : `/?invite=${inviteCode}`;

  const handleCopyCode = async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Fallback
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyLink = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Fallback
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleRoleChange = async (memberUid: string, newRole: CollaboratorRole) => {
    if (!isOwner) return;
    try {
      await updateMemberRole(memberUid, newRole);
    } catch (e) {
      console.error("Failed to update role:", e);
    }
  };

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;
    try {
      await removeMemberFromBoard(memberToRemove.uid);
      setMemberToRemove(null);
    } catch (e) {
      console.error("Failed to remove member:", e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-2rem)] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>多人協同與成員管理</span>
                <span className="text-xs font-normal text-slate-400">({activeBoard.name})</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                邀請好友或團隊成員加入看板，支援跨裝置即時同步
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsShareBoardModalOpen(false)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Loading State */}
          {isLoading && (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
              <p className="text-xs font-medium">正在為此看板生成專屬協同金鑰與邀請連結...</p>
            </div>
          )}

          {/* Error State */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2.5 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!isLoading && (
            <>
              {/* Share Method 1: Invite Code */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50/80 to-amber-50/50 dark:from-orange-950/20 dark:to-amber-950/10 border border-orange-200/80 dark:border-orange-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-orange-800 dark:text-orange-300">
                    <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                    <span>看板專屬 6 碼邀請代碼</span>
                  </div>
                  <span className="text-[10px] text-orange-600 dark:text-orange-400 font-medium">
                    輸入即可秒加入
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-orange-200 dark:border-orange-900/50 text-center font-mono font-black text-xl tracking-widest text-orange-600 dark:text-orange-400 shadow-2xs select-all">
                    {inviteCode || "VK-...."}
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className={cn(
                      "px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs active:scale-95",
                      copiedCode
                        ? "bg-emerald-500 text-white"
                        : "bg-orange-500 hover:bg-orange-600 text-white"
                    )}
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>已複製代碼</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>複製代碼</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Share Method 2: Share Link */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Link className="w-3.5 h-3.5 text-slate-400" />
                  <span>一鍵分享專屬連結</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteUrl}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 font-mono truncate select-all focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={cn(
                      "px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs active:scale-95 border",
                      copiedLink
                        ? "bg-emerald-50 text-emerald-600 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                    )}
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>已複製連結</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>複製連結</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Member List Section */}
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

                {/* Empty State: Only 1 Member */}
                {members.length <= 1 ? (
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
                ) : null}

                {/* Member Cards */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {members.map((member) => {
                    const isMe =
                      member.uid === userSession.id ||
                      (userSession.email && member.email === userSession.email);
                    const isMemberOwner = member.role === "owner";

                    return (
                      <div
                        key={member.uid}
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
                          {/* Role Selector or Badge */}
                          {isOwner && !isMemberOwner ? (
                            <select
                              value={member.role}
                              onChange={(e) =>
                                handleRoleChange(member.uid, e.target.value as CollaboratorRole)
                              }
                              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-hidden cursor-pointer"
                            >
                              <option value="editor">✏️ 編輯者</option>
                              <option value="viewer">👁️ 檢視者 (唯讀)</option>
                            </select>
                          ) : (
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
                          )}

                          {/* Owner can remove member */}
                          {isOwner && !isMemberOwner && (
                            <button
                              type="button"
                              onClick={() => setMemberToRemove(member)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="移出此成員"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Remove Member Confirmation Sub-Modal */}
        {memberToRemove && (
          <div className="absolute inset-0 z-20 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-xs bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                確定移出協作成員？
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                成員「{memberToRemove.name}」將無法再檢視或編輯此看板。
              </p>
              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setMemberToRemove(null)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRemove}
                  className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-colors"
                >
                  確認移出
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between shrink-0 text-xs">
          <span className="text-[11px] text-slate-400">
            支援訪客免登入即時加入編輯
          </span>
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
