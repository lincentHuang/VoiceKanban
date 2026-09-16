"use client";

import React from "react";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ColumnActionItem } from "./useColumnActions";

interface ColumnActionBasicItemsProps {
  primaryItems: ColumnActionItem[];
  manageItems: ColumnActionItem[];
}

const TONE_CLASS: Record<string, string> = {
  default: "text-slate-700 dark:text-slate-200",
  accent: "text-indigo-600 dark:text-indigo-400",
  destructive: "",
};

const ICON_CLASS: Record<string, string> = {
  default: "text-slate-400",
  accent: "text-indigo-500",
  destructive: "",
};

const renderItem = (item: ColumnActionItem) => {
  const tone = item.tone ?? "default";
  const Icon = item.icon;
  return (
    <DropdownMenuItem
      key={item.key}
      variant={tone === "destructive" ? "destructive" : "default"}
      onClick={item.onSelect}
      className={`flex items-center gap-2 font-medium cursor-pointer ${TONE_CLASS[tone]}`}
    >
      <Icon className={`w-3.5 h-3.5 ${ICON_CLASS[tone]}`} />
      <span>{item.label}</span>
    </DropdownMenuItem>
  );
};

export const ColumnActionBasicItems: React.FC<ColumnActionBasicItemsProps> = ({
  primaryItems,
  manageItems,
}) => (
  <>
    {primaryItems.map(renderItem)}
    <DropdownMenuSeparator />
    {manageItems.map(renderItem)}
  </>
);
