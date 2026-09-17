"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, Palette, ArrowUpDown, MoveRight, ChevronDown, Check, FolderInput } from "lucide-react";
import { Column } from "@/core/types/task";
import { useEscapeKey } from "@/core/hooks/useEscapeKey";
import { useColumnActions, ColumnActionItem } from "./useColumnActions";

interface ColumnActionSheetProps {
  column: Column;
  onAddTask: () => void;
  onStartRename?: () => void;
  onClose: () => void;
}

const TONE_ROW: Record<string, string> = {
  default: "text-slate-700 dark:text-slate-200",
  accent: "text-indigo-600 dark:text-indigo-400",
  destructive: "text-rose-600 dark:text-rose-400",
};

const TONE_ICON: Record<string, string> = {
  default: "text-slate-400",
  accent: "text-indigo-500",
  destructive: "text-rose-500",
};

const SheetRow: React.FC<{ item: ColumnActionItem }> = ({ item }) => {
  const tone = item.tone ?? "default";
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={item.onSelect}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-left active:bg-slate-100 dark:active:bg-slate-800 transition-colors cursor-pointer ${TONE_ROW[tone]}`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${TONE_ICON[tone]}`} />
      <span className="flex-1 min-w-0">{item.label}</span>
    </button>
  );
};

const SheetSection: React.FC<{
  id: string;
  label: string;
  icon: React.ElementType;
  iconClass?: string;
  badge?: React.ReactNode;
  expandedId: string | null;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}> = ({ id, label, icon: Icon, iconClass = "text-slate-400", badge, expandedId, onToggle, children }) => {
  const isExpanded = expandedId === id;
  return (
    <div>
      <button
        type="button"
        aria-expanded={isExpanded}
        onClick={() => onToggle(id)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-left text-slate-700 dark:text-slate-200 active:bg-slate-100 dark:active:bg-slate-800 transition-colors cursor-pointer"
      >
        <Icon className={`w-4 h-4 shrink-0 ${iconClass}`} />
        <span className="flex-1 min-w-0">{label}</span>
        {badge}
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>
      {isExpanded && (
        <div className="mx-2 mb-1 px-2 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 animate-in fade-in slide-in-from-top-1 duration-150">
          {children}
        </div>
      )}
    </div>
  );
};

/**
 * Phone presentation of the column menu. A dropdown anchored to the column
 * header gets clipped on narrow screens (and its fly-out submenus even more
 * so), so on mobile every level is shown in one full-width bottom sheet.
 */
export const ColumnActionSheet: React.FC<ColumnActionSheetProps> = ({
  column,
  onAddTask,
  onStartRename,
  onClose,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const actions = useColumnActions({ column, onAddTask, onStartRename, onCloseMenu: onClose });

  useEscapeKey(onClose);

  const toggle = (id: string) => setExpandedId((current) => (current === id ? null : id));

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="column-action-sheet-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-h-[85dvh] flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/80 dark:border-slate-800 rounded-t-[2rem] shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100 pb-[env(safe-area-inset-bottom,0px)] animate-in slide-in-from-bottom-4 duration-200"
      >
        <div className="flex justify-center pt-2.5 shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        <div className="flex items-center justify-between gap-3 px-5 pt-3 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="min-w-0">
            <h3
              id="column-action-sheet-title"
              className="text-base font-bold text-slate-900 dark:text-white"
            >
              列表動作
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{column.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉"
            className="p-2 -mr-2 shrink-0 rounded-full active:bg-slate-100 dark:active:bg-slate-800 text-slate-400 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-2">
          {actions.primaryItems.map((item) => (
            <SheetRow key={item.key} item={item} />
          ))}

          <div className="my-1.5 mx-4 border-t border-slate-100 dark:border-slate-800" />

          {actions.manageItems.map((item) => (
            <SheetRow key={item.key} item={item} />
          ))}

          <div className="my-1.5 mx-4 border-t border-slate-100 dark:border-slate-800" />

          <SheetSection
            id="color"
            label="變更列表顏色"
            icon={Palette}
            iconClass="text-orange-500"
            badge={
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-bold shrink-0">
                PREMIUM
              </span>
            }
            expandedId={expandedId}
            onToggle={toggle}
          >
            <div className="grid grid-cols-5 gap-2 mb-2">
              {actions.colors.map((c) => {
                const isSelected = actions.isColorSelected(c.hex);
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => actions.applyColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                    aria-label={c.name}
                    className={`h-10 rounded-xl shadow-xs active:scale-95 transition-transform flex items-center justify-center border cursor-pointer ${
                      isSelected
                        ? "border-2 border-slate-900 dark:border-white"
                        : "border-slate-300/80 dark:border-slate-600"
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 stroke-[3] text-slate-800" />}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={actions.clearColor}
              className="w-full py-2.5 text-center text-xs text-slate-500 dark:text-slate-400 font-medium bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700 active:scale-[0.99] transition-transform cursor-pointer"
            >
              ✕ 移除顏色
            </button>
          </SheetSection>

          <SheetSection
            id="sort"
            label="排序依據"
            icon={ArrowUpDown}
            expandedId={expandedId}
            onToggle={toggle}
          >
            {actions.sortItems.map((item) => (
              <SheetRow key={item.key} item={item} />
            ))}
          </SheetSection>

          {actions.moveTargets.length > 0 && (
            <SheetSection
              id="move"
              label="移動這個列表的所有卡片"
              icon={MoveRight}
              expandedId={expandedId}
              onToggle={toggle}
            >
              {actions.moveTargets.map((target) => (
                <button
                  key={target.id}
                  type="button"
                  onClick={target.onSelect}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium text-left text-slate-700 dark:text-slate-200 active:bg-slate-100 dark:active:bg-slate-700 transition-colors cursor-pointer"
                >
                  <span className="text-orange-500 shrink-0">➔</span>
                  <span className="truncate">移動至「{target.title}」</span>
                </button>
              ))}
            </SheetSection>
          )}

          {actions.boardTransferTargets.length > 0 && (
            <SheetSection
              id="board-transfer"
              label="移動或複製到其他看板"
              icon={FolderInput}
              expandedId={expandedId}
              onToggle={toggle}
            >
              {actions.moveOutBlockedReason && (
                <p className="px-2 pb-2 text-xs text-slate-400 dark:text-slate-500">
                  {actions.moveOutBlockedReason}
                </p>
              )}
              {actions.boardTransferTargets.map((target) => (
                <div key={target.id} className="flex items-center gap-2 px-2 py-1.5">
                  <span className="flex-1 min-w-0 flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                    {target.icon && <span className="shrink-0">{target.icon}</span>}
                    <span className="truncate">{target.name}</span>
                    {target.isShared && (
                      <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold">
                        共享
                      </span>
                    )}
                  </span>
                  {target.onMove && (
                    <button
                      type="button"
                      onClick={target.onMove}
                      className="shrink-0 px-3 py-2 rounded-xl text-xs font-bold bg-orange-500 text-white active:scale-95 transition-transform cursor-pointer"
                    >
                      移動
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={target.onCopy}
                    className="shrink-0 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 active:scale-95 transition-transform cursor-pointer"
                  >
                    複製
                  </button>
                </div>
              ))}
            </SheetSection>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
