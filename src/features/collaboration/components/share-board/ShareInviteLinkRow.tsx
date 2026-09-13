"use client";

import React from "react";
import { Link, Check, Share2 } from "lucide-react";
import { cn } from "@/core/utils/cn";
import { fieldButtonClass, inputClass } from "@/components/ui/input";

interface ShareInviteLinkRowProps {
  inviteUrl: string;
  copiedLink: boolean;
  onCopyLink: () => void;
}

export const ShareInviteLinkRow: React.FC<ShareInviteLinkRowProps> = ({
  inviteUrl,
  copiedLink,
  onCopyLink,
}) => {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
        <Link className="w-3.5 h-3.5 text-slate-400" />
        <span>一鍵分享專屬連結</span>
      </label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={inviteUrl}
          className={inputClass("md", "flex-1 text-slate-600 dark:text-slate-300 font-mono truncate select-all")}
        />
        <button
          type="button"
          onClick={onCopyLink}
          className={cn(
            fieldButtonClass("md", "gap-1.5 shadow-2xs active:scale-95 border"),
            copiedLink
              ? "bg-emerald-50 text-emerald-600 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800"
              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
          )}
        >
          {copiedLink ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>已複製連結</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-slate-400" />
              <span>複製連結</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
