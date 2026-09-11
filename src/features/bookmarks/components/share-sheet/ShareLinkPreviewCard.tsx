import React from "react";
import { AlertCircle } from "lucide-react";
import { LinkPlatform } from "@/core/types/task";
import { LinkPreview } from "../../types";
import { getDisplayHost } from "../../utils/linkParser";
import { LinkThumbnail } from "../LinkThumbnail";
import { PlatformBadge } from "../PlatformBadge";

interface Props {
  url: string;
  platform: LinkPlatform;
  preview: LinkPreview | null;
  isLoading: boolean;
}

export const ShareLinkPreviewCard: React.FC<Props> = ({ url, platform, preview, isLoading }) => (
  <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden bg-slate-50 dark:bg-slate-800/60">
    <div className="relative aspect-video bg-slate-200 dark:bg-slate-700">
      {isLoading ? (
        <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-700" />
      ) : (
        <LinkThumbnail thumbnailUrl={preview?.thumbnailUrl} platform={platform} className="absolute inset-0 w-full h-full" />
      )}
      <PlatformBadge platform={platform} variant="overlay" className="absolute left-2.5 bottom-2.5" />
    </div>

    <div className="p-3 space-y-1.5">
      {isLoading ? (
        <div className="space-y-1.5" aria-label="正在讀取預覽">
          <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
          <div className="h-3 w-5/6 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
        </div>
      ) : preview ? (
        <>
          {preview.author && <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{preview.author}</p>}
          {preview.description && (
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 whitespace-pre-line">{preview.description}</p>
          )}
        </>
      ) : (
        <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>讀不到預覽（可能是私人帳號或離線），仍可直接儲存連結</span>
        </p>
      )}
      <p className="text-[11px] text-slate-400 truncate">{getDisplayHost(url)}</p>
    </div>
  </div>
);
