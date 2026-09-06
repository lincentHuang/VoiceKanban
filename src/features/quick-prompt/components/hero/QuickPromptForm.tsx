"use client";

import React from "react";
import { Mic, ArrowUp } from "lucide-react";

interface QuickPromptFormProps {
  promptText: string;
  onPromptChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onStartVoice: () => void;
}

export const QuickPromptForm: React.FC<QuickPromptFormProps> = ({
  promptText,
  onPromptChange,
  onSubmit,
  onStartVoice,
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white/95 dark:bg-slate-800/95 rounded-2xl p-3 sm:p-4 shadow-xs border border-slate-100 dark:border-slate-700/80 flex flex-col justify-between min-h-[90px] relative focus-within:border-orange-500 transition-all"
    >
      <textarea
        value={promptText}
        onChange={(e) => onPromptChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing || e.key === "Process") return;
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit(e);
          }
        }}
        placeholder="今天想完成什麼任務？（例如：明天下午三點和設計團隊討論 RWD，高優先級）..."
        rows={2}
        className="w-full resize-none bg-transparent border-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-sm focus:outline-hidden leading-relaxed"
      />

      <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-700/50">
        <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">
          按 <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 font-mono text-[10px]">Enter</kbd> 快速推入收件匣，或點擊右側語音
        </span>

        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={onStartVoice}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 text-orange-600 dark:text-orange-400 text-xs font-semibold transition-colors cursor-pointer"
            title="一鍵語音口述"
          >
            <Mic className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            <span>語音口述</span>
          </button>

          <button
            type="submit"
            disabled={!promptText.trim()}
            className={`p-2 rounded-xl text-white font-medium transition-all cursor-pointer ${
              promptText.trim()
                ? "bg-base44-orange hover:bg-base44-orangeHover shadow-xs scale-100 opacity-100"
                : "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed opacity-60"
            }`}
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </form>
  );
};
