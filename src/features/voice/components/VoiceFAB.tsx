"use client";

import React, { useEffect } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { Mic } from "lucide-react";

export const VoiceFAB: React.FC = () => {
  const { isVoiceOverlayOpen, setIsVoiceOverlayOpen, setVoiceState } = useKanbanStore();

  const handleOpenVoice = () => {
    setVoiceState("recording");
    setIsVoiceOverlayOpen(true);
  };

  // Keyboard shortcut listener for Space or Ctrl+M
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if ((e.code === "Space" && e.shiftKey) || (e.ctrlKey && e.key === "m")) {
        e.preventDefault();
        handleOpenVoice();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (isVoiceOverlayOpen) return null;

  return (
    <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:bottom-6 right-3 sm:right-6 z-40">
      <div className="relative group">
        {/* Pulsing Ripple Effect */}
        <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-orange-400 to-rose-500 opacity-40 group-hover:opacity-75 blur-md animate-pulse transition duration-1000 group-hover:duration-200" />

        {/* Floating Voice Button */}
        <button
          onClick={handleOpenVoice}
          className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200"
          title="一鍵語音錄製 (Shift + Space)"
        >
          <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Floating Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 hidden group-hover:flex items-center px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md text-white text-xs font-medium whitespace-nowrap shadow-lg">
          <span>點擊或按 <kbd className="font-mono text-orange-300 font-bold">Shift+Space</kbd> 口述任務</span>
        </div>
      </div>
    </div>
  );
};
