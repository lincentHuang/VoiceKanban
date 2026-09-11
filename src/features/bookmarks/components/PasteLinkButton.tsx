"use client";

import React from "react";
import { ClipboardPaste } from "lucide-react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { buildSharedDraft } from "../utils/linkParser";

/**
 * iOS home-screen apps can't be share-sheet targets, so on iPhone the flow is
 * "複製連結" in IG/YouTube/Threads → tap this. Opens the manual form when the clipboard has no URL.
 */
export const PasteLinkButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const setPendingShare = useKanbanStore((s) => s.setPendingShare);

  const handleClick = async () => {
    let clipboardText: string | null = null;
    try {
      clipboardText = (await navigator.clipboard?.readText?.()) ?? null;
    } catch {
      // Permission denied or unsupported — the sheet falls back to a paste field
    }
    setPendingShare(buildSharedDraft({ text: clipboardText }));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-sm transition-colors cursor-pointer"
      title="從剪貼簿貼上連結收藏"
    >
      <ClipboardPaste className="w-3.5 h-3.5" />
      <span className="text-[11px]">{compact ? "貼上" : "貼上連結"}</span>
    </button>
  );
};
