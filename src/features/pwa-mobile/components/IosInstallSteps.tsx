"use client";

import React from "react";
import { Share, PlusSquare, Sparkles } from "lucide-react";

interface IosInstallStepsProps {
  isIos: boolean;
}

export const IosInstallSteps: React.FC<IosInstallStepsProps> = ({ isIos }) => {
  return (
    <div className="mt-4 space-y-3">
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
  );
};
