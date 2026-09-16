"use client";

import React, { useState } from "react";
import { Mic, Plus } from "lucide-react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { inputClass } from "@/components/ui/input";

export const InboxQuickAddBar: React.FC = () => {
const addToInbox = useKanbanStore((s) => s.addToInbox);
  const setIsVoiceOverlayOpen = useKanbanStore((s) => s.setIsVoiceOverlayOpen);
  const setVoiceState = useKanbanStore((s) => s.setVoiceState);
  const [newTitle, setNewTitle] = useState("");

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addToInbox(newTitle.trim());
    setNewTitle("");
  };

  const handleVoiceAdd = () => {
    setVoiceState("recording");
    setIsVoiceOverlayOpen(true);
  };

  return (
    <div className="mt-2.5 shrink-0">
      <form onSubmit={handleQuickAdd} className="relative">
        <input
          type="text"
          placeholder="記錄新想法（口述或輸入）..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className={inputClass("md", "pr-16 bg-slate-100/90 dark:bg-slate-800/90 border-transparent focus:border-blue-500 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-850")}
        />

        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <button
            type="button"
            onClick={handleVoiceAdd}
            className="p-1 rounded-lg text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/40 cursor-pointer"
            title="語音快速輸入"
          >
            <Mic className="w-3.5 h-3.5" />
          </button>

          <button
            type="submit"
            disabled={!newTitle.trim()}
            className="p-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-40 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
