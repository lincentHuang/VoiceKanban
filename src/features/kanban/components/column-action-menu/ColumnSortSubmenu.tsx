"use client";

import React from "react";
import { ArrowUpDown } from "lucide-react";
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ColumnActionItem } from "./useColumnActions";

interface ColumnSortSubmenuProps {
  sortItems: ColumnActionItem[];
}

export const ColumnSortSubmenu: React.FC<ColumnSortSubmenuProps> = ({ sortItems }) => (
  <DropdownMenuSub>
    <DropdownMenuSubTrigger className="flex items-center gap-2">
      <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
      <span>排序依據</span>
    </DropdownMenuSubTrigger>
    <DropdownMenuSubContent collisionPadding={12} className="min-w-[11rem]">
      {sortItems.map((item) => {
        const Icon = item.icon;
        return (
          <DropdownMenuItem
            key={item.key}
            onClick={item.onSelect}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Icon className="w-3.5 h-3.5 text-slate-400" />
            <span>{item.label}</span>
          </DropdownMenuItem>
        );
      })}
    </DropdownMenuSubContent>
  </DropdownMenuSub>
);
