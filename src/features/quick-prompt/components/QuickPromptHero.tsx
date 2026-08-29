"use client";

import React, { useState } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { Mic, ArrowUp, Sparkles, Wand2 } from "lucide-react";

export const QuickPromptHero: React.FC = () => {
  const {
    activeBoardId,
    addTask,
    setIsVoiceOverlayOpen,
    setVoiceState,
    setExtractedTask,
  } = useKanbanStore();

  const [promptText, setPromptText] = useState("");
  const [isParsing, setIsParsing] = useState(false);

  const handleStartVoice = () => {
    setVoiceState("recording");
    setIsVoiceOverlayOpen(true);
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;

    // Fast quick task addition to inbox (temporary staging)
    addTask({
      title: promptText.trim(),
      description: "透過快速輸入建立",
      boardId: "global",
      columnId: "inbox",
      priority: "medium",
      tags: ["QuickAdd"],
      dueDate: null,
      completed: false,
    });

    setPromptText("");
  };

  const handleSuggestionClick = (text: string) => {
    setPromptText(text);
  };

  return (
    <section className="relative w-full max-w-4xl mx-auto pt-6 pb-4 px-4 text-center">
      {/* Base 44 Main Headline */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15] mb-3">
        Let&apos;s make your day an{" "}
        <span className="relative inline-block px-2 text-slate-900 bg-base44-lime/90 rounded-lg shadow-xs -rotate-1">
          action.
        </span>
        <br />
        Right now.
      </h1>

      <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-normal max-w-xl mx-auto mb-6 leading-relaxed">
        VoiceKanban 讓您只需口述或一鍵輸入，AI 即刻提取時間、優先級並自動分流卡片。
      </p>

      {/* Base 44 Signature Frosted Prompt Container */}
      <div className="backdrop-blur-2xl bg-white/40 dark:bg-slate-900/40 border border-white/60 dark:border-slate-800/60 shadow-glass-elevated rounded-3xl p-3 sm:p-5 text-left transition-all">
        {/* Inner elevated white card */}
        <form onSubmit={handleQuickSubmit} className="bg-white/95 dark:bg-slate-800/95 rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-100 dark:border-slate-700/80 flex flex-col justify-between min-h-[90px] relative focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            onKeyDown={(e) => {
              if (e.nativeEvent.isComposing || e.key === "Process") return;
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleQuickSubmit(e);
              }
            }}
            placeholder="今天想完成什麼任務？（例如：明天下午三點和設計團隊討論 RWD，高優先級）..."
            rows={2}
            className="w-full resize-none bg-transparent border-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-sm focus:outline-none leading-relaxed"
          />

          <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-700/50">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">
              按 <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 font-mono text-[10px]">Enter</kbd> 快速推入收件匣，或點擊右側語音
            </span>

            <div className="flex items-center gap-2 ml-auto">
              {/* Mic Voice Trigger inside Prompt Bar */}
              <button
                type="button"
                onClick={handleStartVoice}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 text-orange-600 dark:text-orange-400 text-xs font-semibold transition-colors"
                title="一鍵語音口述"
              >
                <Mic className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                <span>語音口述</span>
              </button>

              {/* Submit Arrow Button */}
              <button
                type="submit"
                disabled={!promptText.trim()}
                className={`p-2 rounded-xl text-white font-medium transition-all ${
                  promptText.trim()
                    ? "bg-base44-orange hover:bg-base44-orangeHover shadow-sm scale-100 opacity-100"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed opacity-60"
                }`}
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            快速靈感：
          </span>
          {[
            "⚡ 部署 Next.js 15 上線",
            "📅 明天 15:00 產品週會",
            "🎨 微調 Base 44 設計系統",
            "🌱 晨跑 5 公里與重訓",
          ].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleSuggestionClick(tag.replace(/^[^\s]+\s/, ""))}
              className="px-3 py-1 rounded-full bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 border border-white/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium shadow-2xs hover:shadow-xs transition-all"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
