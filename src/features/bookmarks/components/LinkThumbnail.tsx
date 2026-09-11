"use client";

import React, { useState } from "react";
import { LinkPlatform } from "@/core/types/task";
import { PLATFORM_META } from "../constants";

interface Props {
  thumbnailUrl?: string | null;
  platform: LinkPlatform;
  className?: string;
}

/** Thumbnail with a platform-gradient fallback — IG/Threads CDN image URLs expire after a few days. */
export const LinkThumbnail: React.FC<Props> = ({ thumbnailUrl, platform, className = "" }) => {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const meta = PLATFORM_META[platform];

  if (!thumbnailUrl || failedUrl === thumbnailUrl) {
    return (
      <div className={`bg-gradient-to-br ${meta.fallbackGradient} flex items-center justify-center ${className}`}>
        <span className="text-3xl drop-shadow-md">{meta.icon}</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- arbitrary third-party hosts; next/image would need a remotePatterns allowlist
    <img
      src={thumbnailUrl}
      alt=""
      loading="lazy"
      draggable={false}
      referrerPolicy="no-referrer"
      onError={() => setFailedUrl(thumbnailUrl)}
      className={`object-cover ${className}`}
    />
  );
};
