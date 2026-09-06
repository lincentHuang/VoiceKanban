"use client";

import React, { useState } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { QuickPromptForm } from "./hero/QuickPromptForm";
import { QuickPromptSuggestions } from "./hero/QuickPromptSuggestions";

export const QuickPromptHero: React.FC = () => {
  const {
    addTask,
    setIsVoiceOverlayOpen,
    setVoiceState,
  } = useKanbanStore();

  const [promptText, setPromptText] = useState("");

  const handleStartVoice = () => {
    setVoiceState("recording");
    setIsVoiceOverlayOpen(true);
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;

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

  return (
    <section className="relative w-full max-w-4xl mx-auto pt-6 pb-4 px-4 text-center">
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

      <div className="backdrop-blur-2xl bg-white/40 dark:bg-slate-900/40 border border-white/60 dark:border-slate-800/60 shadow-glass-elevated rounded-3xl p-3 sm:p-5 text-left transition-all">
        <QuickPromptForm
          promptText={promptText}
          onPromptChange={setPromptText}
          onSubmit={handleQuickSubmit}
          onStartVoice={handleStartVoice}
        />

        <QuickPromptSuggestions onSelectSuggestion={setPromptText} />
      </div>
    </section>
  );
};
