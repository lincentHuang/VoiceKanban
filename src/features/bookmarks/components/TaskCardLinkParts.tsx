"use client";

import React from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { TaskLink } from "@/core/types/task";
import { getDisplayHost } from "../utils/linkParser";
import { LinkThumbnail } from "./LinkThumbnail";
import { PlatformBadge } from "./PlatformBadge";

/** Thumbnail cover for saved-link cards; pointer-events-none so taps and drags reach the card. */
export const TaskCardLinkCover: React.FC<{ link: TaskLink }> = ({ link }) => (
  <div className="relative w-full aspect-video max-h-40 overflow-hidden bg-slate-100 dark:bg-slate-800 pointer-events-none select-none">
    <LinkThumbnail thumbnailUrl={link.thumbnailUrl} platform={link.platform} className="absolute inset-0 w-full h-full" />
  </div>
);

/** Shown while a card titled with a bare URL is being expanded into title / image / content. */
export const LinkEnrichingHint: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-orange-600 dark:text-orange-400 shrink-0" title="讀取連結內容中">
    <Loader2 className="w-3 h-3 animate-spin" />
    {!compact && <span>讀取連結內容…</span>}
  </span>
);

export const TaskCardLinkMeta: React.FC<{ link: TaskLink }> = ({ link }) => (
  <div className="mt-1.5 flex items-center gap-1.5 min-w-0">
    <PlatformBadge platform={link.platform} />
    <span className="flex-1 min-w-0 truncate text-[11px] text-slate-500 dark:text-slate-400">
      {link.author || getDisplayHost(link.url)}
    </span>
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className="p-1 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors shrink-0"
      title="開啟原文"
      aria-label="開啟原文"
    >
      <ExternalLink className="w-3.5 h-3.5" />
    </a>
  </div>
);
