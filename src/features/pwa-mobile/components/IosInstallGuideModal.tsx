"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle2, Smartphone, X } from "lucide-react";
import { IosInstallSteps } from "./IosInstallSteps";

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
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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

        <IosInstallSteps isIos={isIos} />

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
