"use client";

import React from "react";
import { ExternalLink } from "lucide-react";
import { TaskLink } from "@/core/types/task";
import { getDisplayHost } from "../utils/linkParser";
import { LinkThumbnail } from "./LinkThumbnail";
import { PlatformBadge } from "./PlatformBadge";

export const EditTaskLinkSection: React.FC<{ link: TaskLink }> = ({ link }) => (
  <a
    href={link.url}
    target="_blank"
    rel="noopener noreferrer"
    className="group flex gap-3 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/50 hover:border-orange-300 dark:hover:border-orange-800 transition-colors"
  >
    <div className="relative w-28 sm:w-36 aspect-video shrink-0 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700">
      <LinkThumbnail thumbnailUrl={link.thumbnailUrl} platform={link.platform} className="absolute inset-0 w-full h-full" />
    </div>
    <div className="flex-1 min-w-0 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 min-w-0">
        <PlatformBadge platform={link.platform} />
        <span className="truncate text-xs font-semibold text-slate-600 dark:text-slate-300">
          {link.author || getDisplayHost(link.url)}
        </span>
      </div>
      <span className="mt-auto inline-flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400 group-hover:underline">
        開啟原文 <ExternalLink className="w-3 h-3" />
      </span>
    </div>
  </a>
);
