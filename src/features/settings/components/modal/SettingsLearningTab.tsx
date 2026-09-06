"use client";

import React from "react";
import { BrainCircuit, Check, RotateCcw } from "lucide-react";

interface LearningStats {
  totalLearnedWords: number;
  totalFeedbackCount: number;
  zhFeedbackCount: number;
  enFeedbackCount: number;
  lastUpdated: string | null;
}

interface SettingsLearningTabProps {
  learningStats: LearningStats;
  resetSuccess: boolean;
  handleResetLearning: () => void;
  onClose: () => void;
}

export const SettingsLearningTab: React.FC<SettingsLearningTabProps> = ({
  learningStats,
  resetSuccess,
  handleResetLearning,
  onClose,
}) => {
  return (
    <div className="mt-4 space-y-4">
      <div className="p-4 rounded-2xl bg-lime-50/60 dark:bg-lime-950/20 border border-lime-200/60 dark:border-lime-900/60 space-y-2">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-lime-600" />
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
            純前端半自動學習 (Active Correction Feedback)
          </h4>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
          每次您在預覽確認卡片中調整看板、欄位、標籤或優先級時，系統會自動在本地瀏覽器強化對應詞彙的貝氏權重，越用越精準，<strong>完全無須連接雲端 AI API</strong>。
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-center">
          <span className="text-[10px] font-semibold text-slate-400 block mb-1">已學習詞彙</span>
          <span className="text-lg font-black text-slate-800 dark:text-slate-100 font-mono">
            {learningStats.totalLearnedWords}
          </span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-center">
          <span className="text-[10px] font-semibold text-slate-400 block mb-1">總修正回饋次數</span>
          <span className="text-lg font-black text-lime-600 font-mono">
            {learningStats.totalFeedbackCount}
          </span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-center">
          <span className="text-[10px] font-semibold text-slate-400 block mb-1">🇹🇼 中文樣本</span>
          <span className="text-lg font-black text-slate-800 dark:text-slate-100 font-mono">
            {learningStats.zhFeedbackCount}
          </span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-center">
          <span className="text-[10px] font-semibold text-slate-400 block mb-1">🇺🇸 英文樣本</span>
          <span className="text-lg font-black text-slate-800 dark:text-slate-100 font-mono">
            {learningStats.enFeedbackCount}
          </span>
        </div>
      </div>

      {resetSuccess && (
        <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>學習記憶庫已重設為初始乾淨狀態！</span>
        </div>
      )}

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <button
          type="button"
          onClick={handleResetLearning}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>重設學習記憶庫</span>
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
        >
          完成
        </button>
      </div>
    </div>
  );
};
