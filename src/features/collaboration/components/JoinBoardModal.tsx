"use client";

import React, { useState, useEffect } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { useEscapeKey } from "@/core/hooks/useEscapeKey";
import {
  X,
  UserPlus,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Smile,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/core/utils/cn";

export const JoinBoardModal: React.FC = () => {
  const {
    isJoinBoardModalOpen,
    setIsJoinBoardModalOpen,
    joinBoardInitialCode,
    setJoinBoardInitialCode,
    joinBoardByInviteCode,
    userSession,
  } = useKanbanStore();

  useEscapeKey(() => setIsJoinBoardModalOpen(false));

  const [code, setCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const isGuest = userSession.isGuest || userSession.provider === "guest";

  useEffect(() => {
    if (isJoinBoardModalOpen) {
      if (joinBoardInitialCode) {
        setCode(joinBoardInitialCode.toUpperCase());
      }
      if (isGuest && userSession.name && userSession.name !== "訪客") {
        setNickname(userSession.name);
      }
      setErrorMsg("");
      setSuccessMsg("");
    }
  }, [isJoinBoardModalOpen, joinBoardInitialCode, isGuest, userSession.name]);

  if (!isJoinBoardModalOpen) return null;

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
    // Auto prefix VK- if user starts typing characters
    if (val && !val.startsWith("VK-") && !val.startsWith("V")) {
      val = "VK-" + val;
    }
    setCode(val);
    setErrorMsg("");
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg("請輸入邀請代碼");
      return;
    }

    if (isGuest && !nickname.trim()) {
      setErrorMsg("請輸入您在協作看板上的暱稱");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const result = await joinBoardByInviteCode(cleanCode, isGuest ? nickname.trim() : undefined);
      if (result.success) {
        setSuccessMsg(result.message || "成功加入協作看板！");
        setTimeout(() => {
          setIsJoinBoardModalOpen(false);
          setJoinBoardInitialCode("");
        }, 1200);
      } else {
        setErrorMsg(result.message || "查無此邀請代碼，請確認後重試。");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "加入看板失敗，請檢查網路連線。");
    } finally {
      setIsLoading(false);
    }
  };

  const previewAvatarName = nickname.trim() || userSession.name || "Guest";
  const previewAvatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
    previewAvatarName
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-2rem)] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                加入協作看板
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                輸入 6 碼邀請短代碼，即刻與團隊夥伴共同編輯
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsJoinBoardModalOpen(false)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleJoin} className="p-6 space-y-4 flex-1 overflow-y-auto">
          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2.5 text-rose-700 dark:text-rose-300 text-xs animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2.5 text-emerald-700 dark:text-emerald-300 text-xs animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Invite Code Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>看板邀請代碼 (Invite Code)</span>
              <span className="text-[11px] font-normal text-slate-400">格式：VK-XXXX</span>
            </label>
            <input
              type="text"
              placeholder="例如：VK-9X4B"
              value={code}
              onChange={handleCodeChange}
              autoFocus
              maxLength={10}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center font-mono font-black text-xl tracking-widest text-slate-800 dark:text-slate-100 placeholder:text-slate-400 placeholder:font-normal placeholder:text-sm focus:outline-hidden focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all uppercase"
            />
          </div>

          {/* Guest Nickname Input */}
          {isGuest && (
            <div className="p-4 rounded-2xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/70 dark:border-orange-900/40 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-bold text-orange-900 dark:text-orange-200">
                  訪客極速加入：輸入您的協作暱稱
                </span>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={previewAvatarUrl}
                  alt="預覽頭像"
                  className="w-10 h-10 rounded-full border-2 border-orange-300 dark:border-orange-700 bg-white dark:bg-slate-800 shrink-0 shadow-xs"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="請輸入暱稱（如：小明、Alex）"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    maxLength={20}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-900/60 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-orange-500"
                  />
                </div>
              </div>
              <p className="text-[11px] text-orange-700/80 dark:text-orange-300/80">
                無需註冊即可參與編輯，系統自動指派協同頭像，日後登入可無縫綁定。
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !code.trim() || (isGuest && !nickname.trim())}
            className={cn(
              "w-full py-3 rounded-2xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98",
              isLoading || !code.trim() || (isGuest && !nickname.trim())
                ? "bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-slate-500 shadow-none"
                : "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>正在加入看板...</span>
              </>
            ) : (
              <>
                <span>加入協作看板</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
