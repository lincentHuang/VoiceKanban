"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Share, PlusSquare, CheckCircle2, Smartphone, X, Sparkles } from "lucide-react";

interface IosInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIos: boolean;
}

export const IosInstallGuideModal: React.FC<IosInstallGuideModalProps> = ({
  isOpen,
  onClose,
  isIos,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-[99999]">
        <DialogHeader className="text-left space-y-2">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 font-bold text-xs">
              <Smartphone className="w-3.5 h-3.5" />
              <span>{isIos ? "iOS Safari 安裝指南" : "安裝至手機桌面"}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="關閉"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <DialogTitle className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            將「聲動看板」安裝至主畫面
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            享受全螢幕秒開、無網址列干擾的原生 App 體驗，無需經過 App Store 下載：
          </DialogDescription>
        </DialogHeader>

        {/* 3 步驟圖文導引卡片 */}
        <div className="mt-4 space-y-3">
          {/* Step 1 */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-start gap-3.5 transition-all hover:border-orange-200">
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
              1
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span>點擊瀏覽器底部的</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-semibold text-orange-600 dark:text-orange-400 shadow-2xs">
                  <Share className="w-3.5 h-3.5" />
                  <span>分享按鈕</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isIos ? "位於 iPhone Safari 底部中央工具列（方形含向上箭頭圖示）。" : "位於瀏覽器功能表選單中。"}
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-start gap-3.5 transition-all hover:border-orange-200">
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
              2
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span>向下捲動並點選</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-semibold text-orange-600 dark:text-orange-400 shadow-2xs">
                  <PlusSquare className="w-3.5 h-3.5" />
                  <span>加入主畫面</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                若未看見此選項，請往下滑動分享列表即可找到「加入主畫面 (Add to Home Screen)」。
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-start gap-3.5 transition-all hover:border-orange-200">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
              3
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span>點選右上角的「新增」</span>
                <Sparkles className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                完成後，「聲動看板」App 圖示將立刻出現在你的手機主畫面上，點擊即可獨立啟動！
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>我知道了，立即體驗</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
