"use client";

import React, { useState } from "react";
import { User } from "lucide-react";

interface UserAvatarProps {
  src?: string | null;
  /** Used for the alt text and for the initial shown when the image fails. */
  name?: string;
  className?: string;
  /** Extra classes for the fallback box (it reuses `className` too). */
  fallbackClassName?: string;
  title?: string;
}

/**
 * Avatar image with a graceful fallback.
 *
 * Third-party avatar hosts fail often: Google's `lh3.googleusercontent.com`
 * rate-limits (429) and refuses requests that carry a referrer, and DiceBear
 * can be unreachable. Without `referrerPolicy` + `onError` the browser paints
 * its broken-image icon, which is what users see as a "壞掉的頭像".
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name,
  className = "",
  fallbackClassName = "",
  title,
}) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const initial = name?.trim()?.[0]?.toUpperCase();

  if (!src || failedSrc === src) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold select-none ${className} ${fallbackClassName}`}
        title={title}
        aria-label={name ? `${name} 的頭像` : "頭像"}
      >
        {initial ? <span className="text-[0.95em] leading-none">{initial}</span> : <User className="w-1/2 h-1/2" />}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- arbitrary third-party hosts; next/image would need a remotePatterns allowlist
    <img
      src={src}
      alt={name || "頭像"}
      title={title}
      draggable={false}
      referrerPolicy="no-referrer"
      onError={() => setFailedSrc(src)}
      className={`object-cover bg-slate-100 dark:bg-slate-700 ${className}`}
    />
  );
};
