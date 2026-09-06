"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export const BindAccountGuarantee: React.FC = () => {
  return (
    <div className="mb-3 p-3 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20 border border-orange-200/80 dark:border-orange-900/50 text-xs text-orange-900 dark:text-orange-200 flex items-start gap-2.5 shrink-0">
      <Sparkles className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
      <div>
        <span className="font-bold">無縫資料整併保障：</span>
        <span> 您在訪客期間建立的看板、工作流程與所有任務將全數自動合併至新帳號，絕不丟失。</span>
      </div>
    </div>
  );
};
