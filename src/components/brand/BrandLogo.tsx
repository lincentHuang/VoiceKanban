"use client";

import React from "react";
import Link from "next/link";

interface BrandLogoProps {
  variant?: "horizontal" | "icon-only" | "vertical";
  bgVariant?: "white" | "primary";
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
  href?: string;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = "horizontal",
  bgVariant = "white",
  size = "md",
  showBadge = true,
  href = "/",
  className = "",
}) => {
  const iconSizes = {
    sm: "w-7 h-7 rounded-xl",
    md: "w-8 h-8 rounded-xl",
    lg: "w-14 h-14 rounded-2xl",
  };

  const textSizes = {
    sm: "text-base tracking-tight",
    md: "text-lg tracking-tight",
    lg: "text-2xl sm:text-3xl tracking-tight",
  };

  const badgeSizes = {
    sm: "text-[9px] px-1.5 py-0.5",
    md: "text-[10px] px-2 py-0.5",
    lg: "text-xs px-2.5 py-1",
  };

  const iconSrc = bgVariant === "white" ? "/smile_icon_white_bg.svg" : "/smile_icon.svg";

  const content = (
    <div
      className={`inline-flex items-center select-none ${
        variant === "vertical" ? "flex-col gap-2 text-center" : "flex-row gap-2.5"
      } ${className}`}
    >
      <img
        src={iconSrc}
        alt="VoiceKanban Logo"
        className={`${iconSizes[size]} object-contain shrink-0`}
      />

      {variant !== "icon-only" && (
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black text-slate-900 dark:text-white font-sans ${textSizes[size]}`}>
            voice<span className="text-[#FC3F1B]">kanban</span>
          </span>

          {showBadge && (
            <span
              className={`inline-flex items-center gap-1 font-extrabold uppercase rounded-full bg-red-50 dark:bg-red-950/80 border border-red-200/80 dark:border-red-900/60 text-[#FC3F1B] ${badgeSizes[size]}`}
            >
              AI
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center focus:outline-hidden">
        {content}
      </Link>
    );
  }

  return content;
};