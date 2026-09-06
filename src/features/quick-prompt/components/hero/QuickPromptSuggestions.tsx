"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface QuickPromptSuggestionsProps {
  onSelectSuggestion: (text: string) => void;
}

const SUGGESTIONS = [
  "⚡ 部署 Next.js 15 上線",
  "📅 明天 15:00 產品週會",
  "🎨 微調 Base 44 設計系統",
  "🌱 晨跑 5 公里與重訓",
];

export const QuickPromptSuggestions: React.FC<QuickPromptSuggestionsProps> = ({
  onSelectSuggestion,
}) => {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
      <span className="text-slate-500 dark:text-slate-400 font-medium mr-1 flex items-center gap-1">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        快速靈感：
      </span>
      {SUGGESTIONS.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onSelectSuggestion(tag.replace(/^[^\s]+\s/, ""))}
          className="px-3 py-1 rounded-full bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 border border-white/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium shadow-2xs hover:shadow-xs transition-all cursor-pointer"
        >
          {tag}
        </button>
      ))}
    </div>
  );
};
