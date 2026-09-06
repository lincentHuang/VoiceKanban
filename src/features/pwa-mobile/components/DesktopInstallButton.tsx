"use client";

import React from "react";
import { Monitor, Download, Loader2 } from "lucide-react";
import { usePwaInstall } from "../hooks/usePwaInstall";
import { DesktopInstallGuideModal } from "./DesktopInstallGuideModal";

export const DesktopInstallButton: React.FC = () => {
  const {
    isInstalled,
    isDesktop,
    isMac,
    isSafari,
    isInstalling,
    isDesktopGuideOpen,
    setIsDesktopGuideOpen,
    triggerInstall,
  } = usePwaInstall();

  // 若已經在獨立模式中運行，或非桌機環境，自動隱藏按鈕維持純淨
  if (isInstalled || !isDesktop) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={triggerInstall}
        disabled={isInstalling}
        className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-orange-200/90 dark:border-orange-800/80 bg-orange-50/80 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/60 font-bold text-xs shadow-2xs transition-all cursor-pointer active:scale-95 group"
        title="安裝為電腦桌面應用程式（無網址列與分頁標籤干擾）"
      >
        {isInstalling ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Monitor className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
        )}
        <span>安裝電腦版</span>
      </button>

      {/* 電腦桌面專屬安裝圖文指引視窗 */}
      <DesktopInstallGuideModal
        isOpen={isDesktopGuideOpen}
        onClose={() => setIsDesktopGuideOpen(false)}
        isSafari={isSafari}
        isMac={isMac}
        onTriggerInstall={triggerInstall}
      />
    </>
  );
};
