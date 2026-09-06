"use client";

import React from "react";
import { AlertCircle, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/core/utils/cn";
import { useJoinBoardModal } from "./join-board/useJoinBoardModal";
import { JoinBoardHeader } from "./join-board/JoinBoardHeader";
import { JoinBoardGuestSection } from "./join-board/JoinBoardGuestSection";
import { JoinBoardCodeInput } from "./join-board/JoinBoardCodeInput";

export const JoinBoardModal: React.FC = () => {
  const {
    isOpen,
    closeModal,
    code,
    nickname,
    setNickname,
    isLoading,
    errorMsg,
    successMsg,
    isGuest,
    userSession,
    handleCodeChange,
    handleJoin,
  } = useJoinBoardModal();

  if (!isOpen) return null;

  const isSubmitDisabled = isLoading || !code.trim() || (isGuest && !nickname.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100dvh-2rem)] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <JoinBoardHeader onClose={closeModal} />

        <form onSubmit={handleJoin} className="p-6 space-y-4 flex-1 overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2.5 text-rose-700 dark:text-rose-300 text-xs animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2.5 text-emerald-700 dark:text-emerald-300 text-xs animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <JoinBoardCodeInput code={code} onChange={handleCodeChange} />

          {isGuest && (
            <JoinBoardGuestSection
              nickname={nickname}
              onNicknameChange={setNickname}
              userSessionName={userSession.name}
            />
          )}

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={cn(
              "w-full py-3 rounded-2xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98",
              isSubmitDisabled
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
