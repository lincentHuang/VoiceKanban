"use client";

import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/core/types/task";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { getDueDateStatus } from "@/core/utils/dateUtils";
import {
  Check,
  CheckCircle2,
  Calendar,
  AlignLeft,
  Paperclip,
  CheckSquare2,
  CheckSquare,
  Square,
  Star,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import confetti from "canvas-confetti";

interface TaskCardProps {
  task: Task;
  variant?: "card" | "row";
  inboxWidth?: number;
  isOverlay?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  variant = "card",
  inboxWidth = 320,
  isOverlay = false,
}) => {
  const {
    toggleTaskComplete,
    toggleTaskStarred,
    setEditingTaskId,
    isMultiSelectMode,
    selectedTaskIds,
    toggleTaskSelection,
    toggleChecklistItem,
  } = useKanbanStore();

  const [isSubtasksExpanded, setIsSubtasksExpanded] = useState(false);

  const sortable = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
    disabled: isMultiSelectMode || isOverlay,
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = isOverlay
      ? {
        attributes: {},
        listeners: {},
        setNodeRef: undefined,
        transform: null,
        transition: undefined,
        isDragging: false,
      }
      : sortable;

  const style = isOverlay
    ? undefined
    : {
      transform: CSS.Transform.toString(transform),
      transition,
    };

  const isSelected = selectedTaskIds.includes(task.id);

  const handleCardClick = (e: React.MouseEvent) => {
    if (isMultiSelectMode) {
      e.stopPropagation();
      toggleTaskSelection(task.id);
    } else {
      setEditingTaskId(task.id);
    }
  };

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.completed) {
      try {
        confetti({
          particleCount: 35,
          spread: 55,
          origin: { y: 0.8 },
          colors: ["#BEF264", "#F97316", "#10B981"],
        });
      } catch { }
    }
    toggleTaskComplete(task.id);
  };

  // Checklist counts
  const totalChecklist = task.checklist ? task.checklist.length : 0;
  const completedChecklist = task.checklist ? task.checklist.filter((i) => i.completed).length : 0;
  const isChecklistAllDone = totalChecklist > 0 && totalChecklist === completedChecklist;

  const handleToggleSubtasksExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSubtasksExpanded((prev) => !prev);
  };

  const handleSubtaskToggle = (e: React.MouseEvent, itemId: string, currentCompleted: boolean) => {
    e.stopPropagation();
    if (!currentCompleted && completedChecklist + 1 === totalChecklist) {
      try {
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.8 },
          colors: ["#10B981", "#3B82F6", "#F59E0B"],
        });
      } catch { }
    }
    toggleChecklistItem(task.id, itemId);
  };

  // Smart Due Date Status with simplified Date only & dynamic color
  const dueDateStatus = getDueDateStatus(task.dueDate, task.completed, task.isAllDay, task.startDate);

  const hasTags = task.tags && task.tags.length > 0;
  const totalAttachments = (task.attachments?.length || 0) > 0 ? task.attachments!.length : (task.attachmentsCount || 0);
  const hasBottomBadges =
    !!task.isStarred ||
    !!task.description ||
    totalAttachments > 0 ||
    totalChecklist > 0 ||
    !!dueDateStatus;

  // --- HORIZONTAL ROW / STRIP VARIANT (with Progressive Disclosure) ---
  if (variant === "row") {
    const isSmallRow = inboxWidth < 520;
    const isMediumRow = inboxWidth >= 520 && inboxWidth < 650;
    const isLargeRow = inboxWidth >= 650;

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={handleCardClick}
        className={`group relative bg-white/95 dark:bg-slate-850 backdrop-blur-md rounded-xl px-3 py-2 shadow-2xs hover:shadow-card-hover border transition-all select-none touch-manipulation cursor-grab active:cursor-grabbing active:scale-[0.99] ${isSelected
          ? "border-orange-500 ring-2 ring-orange-500/30 bg-orange-50/40 dark:bg-orange-950/30"
          : "border-slate-200/80 dark:border-slate-700/80 hover:border-orange-400 dark:hover:border-slate-600"
          } ${isDragging ? "opacity-25 bg-slate-200/40 dark:bg-slate-800/40 border-2 border-dashed border-slate-300 dark:border-slate-700 shadow-none pointer-events-none" : ""
          } ${task.completed ? "opacity-65 bg-slate-50/80 dark:bg-slate-900/60" : ""}`}
      >
        {/* Left Color Indicator Accent */}
        {task.coverColor && !task.coverColor.startsWith("data:image") && (
          <div
            style={{ backgroundColor: task.coverColor }}
            className="w-1.5 self-stretch rounded-full shrink-0 my-0.5"
          />
        )}

        {/* Multi-Select Mode Checkbox */}
        {isMultiSelectMode && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              toggleTaskSelection(task.id);
            }}
            className="text-orange-600 dark:text-orange-400 p-0.5 shrink-0"
          >
            {isSelected ? (
              <CheckSquare className="w-4 h-4 fill-orange-500 text-white" />
            ) : (
              <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
            )}
          </button>
        )}

        {/* Left Content: Star + Title (Protected Min 100px) + Optional Tags */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {task.isStarred && (
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
          )}

          {/* Guaranteed Min-Width 100px Title */}
          <h4
            style={{ minWidth: "100px" }}
            className={`text-[16px] sm:text-xs font-semibold text-slate-800 dark:text-slate-100 truncate flex-1 min-w-[100px] ${task.completed ? "line-through text-slate-400 dark:text-slate-500" : ""
              }`}
          >
            {task.title}
          </h4>

          {/* Tags (Only visible when Medium or Large) */}
          {hasTags && (isMediumRow || isLargeRow) && (
            <div className="flex items-center gap-1 shrink-0">
              {(isLargeRow ? task.tags : task.tags.slice(0, 1)).map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium"
                >
                  #{tag}
                </span>
              ))}
              {isMediumRow && task.tags.length > 1 && (
                <span className="text-[10px] text-slate-400 font-medium">
                  +{task.tags.length - 1}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right Content: Meta Badges + Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 text-[11px] text-slate-400">
          {/* Checklist progress (Visible on Medium & Large) */}
          {totalChecklist > 0 && !isSmallRow && (
            <span
              className={`inline-flex items-center gap-1 font-medium px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0 ${isChecklistAllDone
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                }`}
              title={`子任務: ${completedChecklist}/${totalChecklist}`}
            >
              <CheckSquare2 className="w-3 h-3 shrink-0" />
              <span className="whitespace-nowrap">
                {completedChecklist}/{totalChecklist}
              </span>
            </span>
          )}

          {/* Due date badge (Only visible on Large) */}
          {dueDateStatus && isLargeRow && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap shrink-0 ${dueDateStatus.badgeClasses.cardBadge}`}
              title={`到期時間: ${dueDateStatus.formattedFullDateTime} (${dueDateStatus.label})`}
            >
              <Calendar className={`w-3 h-3 shrink-0 ${dueDateStatus.badgeClasses.iconColor}`} />
              <span className={`whitespace-nowrap ${dueDateStatus.badgeClasses.cardText}`}>{dueDateStatus.formattedDateOnly}</span>
            </span>
          )}

          {/* Action buttons: Quick Complete (Always visible) + Edit Pencil (Medium/Large) */}
          <div className="flex items-center gap-0.5">
            {/* Quick Complete Button - Always Available */}
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={handleToggleComplete}
              className={`p-1 rounded-lg transition-colors ${task.completed
                ? "bg-emerald-100 text-emerald-700"
                : "hover:bg-emerald-50 text-slate-400 hover:text-emerald-600"
                }`}
              title="標記完成"
            >
              <CheckCircle2
                className={`w-3.5 h-3.5 ${task.completed ? "fill-emerald-500 text-white" : ""
                  }`}
              />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- STANDARD VERTICAL CARD VARIANT ---
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleCardClick}
      className={`group relative bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover border transition-all select-none touch-manipulation cursor-grab active:cursor-grabbing active:scale-[0.99] ${isSelected
        ? "border-orange-500 ring-2 ring-orange-500/30 bg-orange-50/40 dark:bg-orange-950/30"
        : "border-slate-100 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600"
        } ${isDragging ? "opacity-25 bg-slate-200/40 dark:bg-slate-800/40 border-2 border-dashed border-slate-300 dark:border-slate-700 shadow-none pointer-events-none" : ""
        } ${task.completed ? "opacity-65 bg-slate-50/80 dark:bg-slate-900/60" : ""}`}
    >
      {/* Top Cover Color/Image Banner (With Aspect Ratio support) */}
      {task.coverColor && (
        <div
          style={{
            background:
              task.coverColor.startsWith("data:image") || task.coverColor.startsWith("http")
                ? `url(${task.coverColor}) center/cover no-repeat`
                : task.coverColor,
            backgroundColor:
              !task.coverColor.startsWith("data:image") &&
                !task.coverColor.startsWith("http") &&
                !task.coverColor.startsWith("linear")
                ? task.coverColor
                : undefined,
          }}
          className={`w-full transition-all duration-200 ${task.coverAspectRatio === "1:1"
            ? "aspect-square object-cover"
            : task.coverAspectRatio === "3:4"
              ? "aspect-[3/4] max-h-64 object-cover"
              : task.coverAspectRatio === "9:16"
                ? "aspect-[9/16] max-h-72 object-cover"
                : task.coverAspectRatio === "banner"
                  ? "aspect-video max-h-36 object-cover"
                  : task.coverColor.startsWith("data:image") || task.coverColor.startsWith("http")
                    ? "aspect-video max-h-36 object-cover"
                    : "h-3"
            }`}
        />
      )}

      <div className="p-3 sm:p-3.5">
        {/* Main Header Row: Title on the left, Actions on the right (Y-axis Centered, min-h-[25px]) */}
        <div className="flex items-start justify-between gap-2 min-h-[25px]">
          {/* In Multi-Select Mode: show select checkbox on the left */}
          {isMultiSelectMode && (
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                toggleTaskSelection(task.id);
              }}
              className="text-orange-600 h-[25px] dark:text-orange-400 p-0.5 shrink-0 flex items-center justify-center self-start"
            >
              {isSelected ? (
                <CheckSquare className="w-4 h-4 fill-orange-500 text-white" />
              ) : (
                <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
              )}
            </button>
          )}

          {/* Task Title (16px on mobile, min-h-[25px], Y-axis centered to perfectly align with quick complete button) */}
          <div className="flex-1 min-w-0 flex items-center min-h-[25px]">
            <h4
              style={{ minWidth: "100px" }}
              className={`text-[16px] sm:text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug break-words flex items-center min-h-[25px] ${task.completed ? "line-through text-slate-400 dark:text-slate-500" : ""
                }`}
            >
              {task.title}
            </h4>
          </div>

          {/* Top-Right Action Controls (Aligned with Title Y-axis center) */}
          <div className="flex items-start gap-1 shrink-0 self-start">
            {/* Quick Complete Button: ALWAYS directly visible & clickable on mobile & desktop without hover */}
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={handleToggleComplete}
              className={`p-1 rounded-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center ${task.completed
                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 ring-1 ring-emerald-500/20"
                : "text-slate-300 dark:text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                }`}
              title={task.completed ? "標記為未完成" : "快速標記完成"}
            >
              <CheckCircle2
                className={`w-4 h-4 transition-transform ${task.completed ? "fill-emerald-500 text-white" : ""
                  }`}
              />
            </button>
          </div>
        </div>

        {/* Tags Section (Only displayed when tags exist or dynamic urgent status) */}
        {(hasTags || (dueDateStatus?.isUrgent && !task.completed)) && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {dueDateStatus?.urgency === "overdue" && !task.completed && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 shadow-2xs whitespace-nowrap shrink-0">
                🔥 逾期
              </span>
            )}
            {dueDateStatus?.urgency === "due-soon" && !task.completed && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 shadow-2xs whitespace-nowrap shrink-0">
                ⏳ 即將到期
              </span>
            )}
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 whitespace-nowrap shrink-0"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Bottom Metadata Badges (Wraps gracefully when crowded, date badge never wraps text internally) */}
        {hasBottomBadges && (
          <div className="flex flex-wrap items-center gap-2 mt-2.5 pt-2 border-t border-slate-100/80 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400">
            {/* Star Important Icon - Placed at the very front of the bottom row */}
            {task.isStarred && (
              <span className="text-amber-500 flex items-center justify-center shrink-0" title="重要事項">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
              </span>
            )}

            {/* Description note icon */}
            {task.description && (
              <span className="inline-flex items-center gap-1 shrink-0" title="有備註說明">
                <AlignLeft className="w-3.5 h-3.5" />
              </span>
            )}

            {/* Attachments icon */}
            {totalAttachments > 0 && (
              <span className="inline-flex items-center gap-1 shrink-0" title="有附件檔案">
                <Paperclip className="w-3.5 h-3.5" />
                <span>{totalAttachments}</span>
              </span>
            )}

            {/* Interactive Checklist Expansion Button */}
            {totalChecklist > 0 && (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={handleToggleSubtasksExpand}
                className={`inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded-lg transition-all cursor-pointer group/badge select-none whitespace-nowrap shrink-0 ${isSubtasksExpanded
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 ring-1 ring-blue-400/50 shadow-2xs"
                  : isChecklistAllDone
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 font-bold"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }`}
                title={isSubtasksExpanded ? "收合子任務列表" : `點擊展開子任務 (${completedChecklist}/${totalChecklist})`}
                aria-expanded={isSubtasksExpanded}
              >
                <CheckSquare2 className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">
                  {completedChecklist}/{totalChecklist}
                </span>
                {isSubtasksExpanded ? (
                  <ChevronUp className="w-3 h-3 ml-0.5 opacity-75 shrink-0" />
                ) : (
                  <ChevronDown className="w-3 h-3 ml-0.5 opacity-75 group-hover/badge:translate-y-0.5 transition-transform shrink-0" />
                )}
              </button>
            )}

            {/* Due date badge (Always on single line, never breaks into 2 lines) */}
            {dueDateStatus && (
              <span
                className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-lg font-bold transition-all whitespace-nowrap shrink-0 ml-auto ${dueDateStatus.badgeClasses.cardBadge}`}
                title={`到期時間: ${dueDateStatus.formattedFullDateTime} (${dueDateStatus.label})`}
              >
                <Calendar className={`w-3.5 h-3.5 shrink-0 ${dueDateStatus.badgeClasses.iconColor}`} />
                <span className={`whitespace-nowrap ${dueDateStatus.badgeClasses.cardText}`}>
                  {dueDateStatus.formattedDateOnly}
                </span>
              </span>
            )}
          </div>
        )}

        {/* Inline Expanded Subtasks Container (Accordion) */}
        {isSubtasksExpanded && totalChecklist > 0 && (
          <div
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-150"
          >
            {/* Progress Header & Mini Bar */}
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-0">
              <span>子任務進度</span>
              <span className={isChecklistAllDone ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}>
                {Math.round((completedChecklist / totalChecklist) * 100)}%
              </span>
            </div>
            <div className="w-full h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${isChecklistAllDone ? "bg-emerald-500" : "bg-blue-500"
                  }`}
                style={{ width: `${(completedChecklist / totalChecklist) * 100}%` }}
              />
            </div>

            {/* Subtask Items List (Exact Y-axis vertical alignment between Checkbox & Item Title) */}
            <div className="space-y-1 pt-1 max-h-48 overflow-y-auto custom-scrollbar pr-0.5">
              {task.checklist?.map((item) => (
                <div
                  key={item.id}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => handleSubtaskToggle(e, item.id, item.completed)}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors cursor-pointer group/item select-none ${item.completed
                    ? "bg-slate-50/70 dark:bg-slate-900/40 text-slate-400 dark:text-slate-500"
                    : "hover:bg-slate-100/90 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200"
                    }`}
                >
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => handleSubtaskToggle(e, item.id, item.completed)}
                    className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shrink-0 flex items-center justify-center"
                    aria-label={item.completed ? `取消完成 ${item.title}` : `標記完成 ${item.title}`}
                  >
                    {item.completed ? (
                      <CheckSquare className="w-3.5 h-3.5 fill-emerald-500 text-white dark:fill-emerald-600 shrink-0" />
                    ) : (
                      <Square className="w-3.5 h-3.5 group-hover/item:text-emerald-500 shrink-0" />
                    )}
                  </button>
                  <span
                    className={`flex-1 break-words leading-normal text-[11px] ${item.completed ? "line-through text-slate-400 dark:text-slate-500" : "font-normal text-slate-700 dark:text-slate-200"
                      }`}
                  >
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
