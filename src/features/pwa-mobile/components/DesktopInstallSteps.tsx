"use client";

import React from "react";
import { Monitor, Download, PlusSquare, ArrowRight } from "lucide-react";

interface Props {
  isSafari: boolean;
  isMac: boolean;
}

export const DesktopInstallSteps: React.FC<Props> = ({ isSafari, isMac }) => {
  if (isSafari && isMac) {
    return (
      <div className="space-y-3 my-4">
        <div className="p-3 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-900/40 flex items-start gap-3">
          <div className="w-7 h-7 rounded-xl bg-orange-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            1
          </div>
          <div className="text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-100">點擊 Mac 頂部選單列「檔案 (File)」</span>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">在 Safari 頂部功能選單中找到「檔案」。</p>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-900/40 flex items-start gap-3">
          <div className="w-7 h-7 rounded-xl bg-orange-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            2
          </div>
          <div className="text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-100">選擇「加入 Dock (Add to Dock...)」</span>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">點擊後確認名稱，按下「新增」。</p>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 flex items-start gap-3">
          <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            3
          </div>
          <div className="text-xs">
            <span className="font-bold text-emerald-900 dark:text-emerald-100">秒級建立獨立 Mac App</span>
            <p className="text-emerald-600 dark:text-emerald-400 mt-0.5">從 Mac Dock 或應用程式啟動，完全脫離網頁分頁！</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 my-4">
      <div className="p-3 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-900/40 flex items-start gap-3">
        <div className="w-7 h-7 rounded-xl bg-orange-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
          1
        </div>
        <div className="text-xs">
          <span className="font-bold text-slate-800 dark:text-slate-100">查看瀏覽器網址列右側「安裝 💻」圖示</span>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5">Chrome / Edge / Brave 網址列右端會出現安裝按鈕。</p>
        </div>
      </div>

      <div className="p-3 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-900/40 flex items-start gap-3">
        <div className="w-7 h-7 rounded-xl bg-orange-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
          2
        </div>
        <div className="text-xs">
          <span className="font-bold text-slate-800 dark:text-slate-100">點擊「安裝 (Install)」</span>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5">或點選右上角選單 `⋮` ➔「儲存並分享」➔「安裝聲動看板」。</p>
        </div>
      </div>

      <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 flex items-start gap-3">
        <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
          3
        </div>
        <div className="text-xs">
          <span className="font-bold text-emerald-900 dark:text-emerald-100">享受沉浸式桌面應用</span>
          <p className="text-emerald-600 dark:text-emerald-400 mt-0.5">常駐於電腦工作列或 Dock，擺脫雜亂標籤頁！</p>
        </div>
      </div>
    </div>
  );
};
