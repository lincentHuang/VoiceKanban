import React from "react";
import { LinkPlatform } from "@/core/types/task";
import { PLATFORM_META } from "../constants";

interface Props {
  platform: LinkPlatform;
  /** "overlay" sits on top of a thumbnail; "soft" sits on a light surface. */
  variant?: "overlay" | "soft";
  className?: string;
}

export const PlatformBadge: React.FC<Props> = ({ platform, variant = "soft", className = "" }) => {
  const meta = PLATFORM_META[platform];
  const tone = variant === "overlay" ? "bg-black/55 text-white backdrop-blur-md" : meta.badgeClass;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0 ${tone} ${className}`}>
      <span>{meta.icon}</span>
      <span>{meta.label}</span>
    </span>
  );
};
