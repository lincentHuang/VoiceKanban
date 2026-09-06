"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Monitor, CheckCircle2, Download, X } from "lucide-react";
import { DesktopInstallSteps } from "./DesktopInstallSteps";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isSafari: boolean;
  isMac: boolean;
  onTriggerInstall: () => void;
}

export const DesktopInstallGuideModal: React.FC<Props> = ({
  isOpen,
  onClose,
  isSafari,
  isMac,
  onTriggerInstall,
}) => {
  const [activeTab, setActiveTab] = useState<"auto" | "chrome" | "safari">(
    isSafari && isMac ? "safari" : "chrome"
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-[99999]">
        <DialogHeader className="text-left space-y-2">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 font-bold text-xs">
              <Monitor className="w-3.5 h-3.5" />
              <span>電腦桌面應用程式安裝指南</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <DialogTitle className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            將看板安裝為獨立電腦應用
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            完全脫離瀏覽器分頁標籤干擾，享受專屬視窗與常駐 Dock / 工作列體驗：
          </DialogDescription>
        </DialogHeader>

        <DesktopInstallSteps
          isSafari={activeTab === "safari"}
          isMac={isMac}
        />

        <div className="mt-5 flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              onTriggerInstall();
              onClose();
            }}
            className="flex-1 py-2.5 px-4 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>立即安裝應用程式</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm transition-all cursor-pointer"
          >
            稍後再說
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
