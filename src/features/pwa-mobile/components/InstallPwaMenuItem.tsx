"use client";

import React from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Smartphone, Download, Loader2 } from "lucide-react";
import { usePwaInstall } from "../hooks/usePwaInstall";
import { IosInstallGuideModal } from "./IosInstallGuideModal";

export const InstallPwaMenuItem: React.FC = () => {
  const {
    isInstalled,
    isIos,
    isInstalling,
    isIosGuideOpen,
    setIsIosGuideOpen,
    triggerInstall,
  } = usePwaInstall();

  // 決策遵循 Option A：若已在 Standalone PWA 模式或 Capacitor 原生 App 中執行，自動隱藏該按鈕
  if (isInstalled) {
    return null;
  }

  return (
    <>
      <DropdownMenuItem
        onClick={(e) => {
          e.preventDefault();
          triggerInstall();
        }}
        disabled={isInstalling}
        className="flex items-center justify-between cursor-pointer py-2 px-2.5 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-950/40 text-slate-700 dark:text-slate-200 group transition-all"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            {isInstalling ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Smartphone className="w-3.5 h-3.5" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-xs text-slate-800 dark:text-slate-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors truncate">
              在手機安裝應用
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
              {isIos ? "iOS 主畫面快捷安裝" : "極速全螢幕原生體驗"}
            </span>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/60 shrink-0">
          <Download className="w-2.5 h-2.5" />
          <span>PWA</span>
        </span>
      </DropdownMenuItem>

      {/* iOS 3 步驟圖文導引視窗 */}
      <IosInstallGuideModal
        isOpen={isIosGuideOpen}
        onClose={() => setIsIosGuideOpen(false)}
        isIos={isIos}
      />
    </>
  );
};
