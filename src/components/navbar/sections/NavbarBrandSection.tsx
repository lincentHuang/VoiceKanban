"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { OfflineIndicator } from "@/features/offline";

interface NavbarBrandSectionProps {
  isGuest: boolean;
}

export const NavbarBrandSection: React.FC<NavbarBrandSectionProps> = ({ isGuest }) => {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <BrandLogo bgVariant="white" size="sm" showBadge={false} />
      <OfflineIndicator />
      {isGuest && (
        <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-[10px] font-bold text-amber-800 dark:text-amber-300">
          <Sparkles className="w-2.5 h-2.5 text-amber-600" />
          <span>訪客體驗中</span>
        </span>
      )}
    </div>
  );
};
