"use client";

import React from "react";
import { X, Bookmark, Loader2 } from "lucide-react";
import { useEscapeKey } from "@/core/hooks/useEscapeKey";
import { useShareSaveSheet } from "./share-sheet/useShareSaveSheet";
import { ShareLinkPreviewCard } from "./share-sheet/ShareLinkPreviewCard";
import { ShareManualUrlForm } from "./share-sheet/ShareManualUrlForm";
import { ShareSavedState } from "./share-sheet/ShareSavedState";

/** Bottom sheet (mobile) / dialog (desktop) that saves a shared link into the 收藏 board. */
export const ShareSaveSheet: React.FC = () => {
  const sheet = useShareSaveSheet();
  useEscapeKey(sheet.close, Boolean(sheet.pendingShare));

  if (!sheet.pendingShare) return null;

  const isSaved = sheet.status === "saved";
  const isLoading = sheet.status === "loading";

  return (
    <div
      onClick={sheet.close}
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-save-sheet-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md max-h-[90dvh] flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/80 dark:border-slate-800 rounded-t-[2rem] sm:rounded-3xl shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100 pb-[env(safe-area-inset-bottom,0px)] animate-in slide-in-from-bottom-4 duration-200"
      >
        <div className="sm:hidden flex justify-center pt-2.5 shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        <div className="flex items-center justify-between px-5 pt-3 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h3 id="share-save-sheet-title" className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-orange-500" />
            儲存到收藏
          </h3>
          <button
            type="button"
            onClick={sheet.close}
            aria-label="關閉"
            className="p-2 -mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 pt-4 space-y-4">
          {isSaved && sheet.savedLocation ? (
            <ShareSavedState
              boardName={sheet.savedLocation.boardName}
              columnTitle={sheet.savedLocation.columnTitle}
              onViewCollection={sheet.viewCollection}
              onDone={sheet.close}
            />
          ) : !sheet.url ? (
            <ShareManualUrlForm initialText={sheet.pendingShare.sharedText || ""} onSubmitUrl={sheet.handleSubmitManualUrl} />
          ) : (
            <>
              <ShareLinkPreviewCard url={sheet.url} platform={sheet.pendingShare.platform} preview={sheet.preview} isLoading={isLoading} />

              {sheet.duplicateTask && (
                <p className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-200">
                  這則已經收藏過了（「{sheet.duplicateTask.title}」），再存一次會建立新的卡片。
                </p>
              )}

              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-slate-500">標題</span>
                <input
                  value={sheet.title}
                  onChange={(e) => sheet.handleTitleChange(e.target.value)}
                  placeholder="幫這則收藏取個名字"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[16px] sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400/60"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-slate-500">備註（選填）</span>
                <textarea
                  value={sheet.note}
                  onChange={(e) => sheet.setNote(e.target.value)}
                  rows={2}
                  placeholder="為什麼想存這則？之後要做什麼？"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[16px] sm:text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400/60"
                />
              </label>
            </>
          )}
        </div>

        {sheet.url && !isSaved && (
          <div className="px-5 pb-5 pt-2 shrink-0">
            <button
              type="button"
              onClick={sheet.handleSave}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white text-sm font-bold shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bookmark className="w-4 h-4" />}
              {isLoading ? "讀取預覽中…可直接儲存" : "儲存到收藏"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
