"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/core/types/task";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { getDueDateStatus } from "@/core/utils/dateUtils";
import {
  Check,
  CheckCircle2,
  Calendar,
  Edit3,
  AlignLeft,
  Paperclip,
  CheckSquare2,
  CheckSquare,
  Square,
  Star,
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
  } = useKanbanStore();

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
        transform: CSS.Translate.toString(transform),
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
      } catch {}
    }
    toggleTaskComplete(task.id);
  };

  // Smart Due Date Status with simplified Date only & dynamic color
  const dueDateStatus = getDueDateStatus(task.dueDate, task.completed);

  // Checklist counts
  const totalChecklist = task.checklist ? task.checklist.length : 0;
  const completedChecklist = task.checklist ? task.checklist.filter((i) => i.completed).length : 0;
  const isChecklistAllDone = totalChecklist > 0 && totalChecklist === completedChecklist;

  const hasTags = task.tags && task.tags.length > 0;
  const hasBottomBadges =
    !!task.description ||
    (task.attachmentsCount || 0) > 0 ||
    totalChecklist > 0 ||
    !!dueDateStatus;

  // --- HORIZONTAL ROW / STRIP VARIANT (with Progressive Disclosure) ---
  if (variant === "row") {
    // Determine level of detail based on available width:
    // Small (< 520px): Only Title (min 100px) + Star + Complete button
    // Medium (520px - 650px): Title + Star + 1-2 Tags + Checklist + Complete + Edit
    // Large (>= 650px): Everything (Title + All Tags + Checklist + Due Date + Complete + Edit)
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
        className={`group relative bg-white/95 dark:bg-slate-850 backdrop-blur-md rounded-xl px-3 py-2 shadow-2xs hover:shadow-card-hover border transition-all select-none touch-manipulation cursor-grab active:cursor-grabbing active:scale-[0.99] ${
          isSelected
            ? "border-orange-500 ring-2 ring-orange-500/30 bg-orange-50/40 dark:bg-orange-950/30"
            : "border-slate-200/80 dark:border-slate-700/80 hover:border-orange-400 dark:hover:border-slate-600"
        } ${
          isDragging ? "opacity-25 bg-slate-200/40 dark:bg-slate-800/40 border-2 border-dashed border-slate-300 dark:border-slate-700 shadow-none pointer-events-none" : ""
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
            className={`text-xs font-semibold text-slate-800 dark:text-slate-100 truncate flex-1 min-w-[100px] ${
              task.completed ? "line-through text-slate-400 dark:text-slate-500" : ""
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
              className={`flex items-center gap-1 font-medium px-1.5 py-0.5 rounded-md ${
                isChecklistAllDone
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500"
              }`}
              title={`子任務: ${completedChecklist}/${totalChecklist}`}
            >
              <CheckSquare2 className="w-3 h-3" />
              <span>
                {completedChecklist}/{totalChecklist}
              </span>
            </span>
          )}

          {/* Due date badge (Only visible on Large) */}
          {dueDateStatus && isLargeRow && (
            <span
              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${dueDateStatus.badgeClasses.cardBadge}`}
              title={`到期時間: ${dueDateStatus.formattedFullDateTime} (${dueDateStatus.label})`}
            >
              <Calendar className={`w-3 h-3 ${dueDateStatus.badgeClasses.iconColor}`} />
              <span className={dueDateStatus.badgeClasses.cardText}>{dueDateStatus.formattedDateOnly}</span>
            </span>
          )}

          {/* Action buttons: Quick Complete (Always visible) + Edit Pencil (Medium/Large) */}
          <div className="flex items-center gap-0.5">
            {/* Quick Complete Button - Always Available */}
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={handleToggleComplete}
              className={`p-1 rounded-lg transition-colors ${
                task.completed
                  ? "bg-emerald-100 text-emerald-700"
                  : "hover:bg-emerald-50 text-slate-400 hover:text-emerald-600"
              }`}
              title="標記完成"
            >
              <CheckCircle2
                className={`w-3.5 h-3.5 ${
                  task.completed ? "fill-emerald-500 text-white" : ""
                }`}
              />
            </button>

            {/* Edit Pencil Button (Visible when Medium/Large or on hover) */}
            {(!isSmallRow || isSelected) && (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingTaskId(task.id);
                }}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 transition-colors"
                title="編輯"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
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
      className={`group relative bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover border transition-all select-none touch-manipulation cursor-grab active:cursor-grabbing active:scale-[0.99] ${
        isSelected
          ? "border-orange-500 ring-2 ring-orange-500/30 bg-orange-50/40 dark:bg-orange-950/30"
          : "border-slate-100 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600"
      } ${
        isDragging ? "opacity-25 bg-slate-200/40 dark:bg-slate-800/40 border-2 border-dashed border-slate-300 dark:border-slate-700 shadow-none pointer-events-none" : ""
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
          className={`w-full transition-all duration-200 ${
            task.coverAspectRatio === "1:1"
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
        {/* Main Header Row: Title on the left, Actions on the right */}
        <div className="flex items-start justify-between gap-2">
          {/* In Multi-Select Mode: show select checkbox on the left */}
          {isMultiSelectMode && (
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                toggleTaskSelection(task.id);
              }}
              className="mt-0.5 text-orange-600 dark:text-orange-400 p-0.5 shrink-0"
            >
              {isSelected ? (
                <CheckSquare className="w-4 h-4 fill-orange-500 text-white" />
              ) : (
                <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
              )}
            </button>
          )}

          {/* Task Title (Flush with left edge, zero blank space, min-width guaranteed) */}
          <div className="flex-1 min-w-0">
            <h4
              style={{ minWidth: "100px" }}
              className={`text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug break-words ${
                task.completed ? "line-through text-slate-400 dark:text-slate-500" : ""
              }`}
            >
              {task.title}
            </h4>
          </div>

          {/* Top-Right Badges & Hover Action Controls */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Star Important Icon */}
            {task.isStarred && (
              <span className="text-amber-500 p-0.5" title="重要事項">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              </span>
            )}

            {/* Completed Indicator */}
            {task.completed && (
              <span className="p-0.5 text-emerald-600 group-hover:hidden" title="已完成">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            )}

            {/* Hover Action Buttons: Quick Complete + Edit Pencil */}
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-all">
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={handleToggleComplete}
                className={`p-1 rounded-lg transition-colors ${
                  task.completed
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300"
                    : "hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 dark:hover:bg-emerald-950/40"
                }`}
                title={task.completed ? "標記為未完成" : "快速標記完成"}
              >
                <CheckCircle2
                  className={`w-3.5 h-3.5 ${
                    task.completed ? "fill-emerald-500 text-white" : ""
                  }`}
                />
              </button>

              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingTaskId(task.id);
                }}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                title="編輯詳細資訊"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tags Section (Only displayed when tags exist or dynamic urgent status) */}
        {(hasTags || (dueDateStatus?.isUrgent && !task.completed)) && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {dueDateStatus?.urgency === "overdue" && !task.completed && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 shadow-2xs">
                🔥 逾期
              </span>
            )}
            {dueDateStatus?.urgency === "due-soon" && !task.completed && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 shadow-2xs">
                ⏳ 即將到期
              </span>
            )}
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Bottom Metadata Badges (Only displayed when metadata exists) */}
        {hasBottomBadges && (
          <div className="flex items-center gap-3 mt-3 pt-2 border-t border-slate-100/80 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400">
            {/* Description note icon */}
            {task.description && (
              <span className="flex items-center gap-1" title="有備註說明">
                <AlignLeft className="w-3.5 h-3.5" />
              </span>
            )}

            {/* Attachments icon */}
            {(task.attachmentsCount || 0) > 0 && (
              <span className="flex items-center gap-1" title="有附件檔案">
                <Paperclip className="w-3.5 h-3.5" />
                <span>{task.attachmentsCount}</span>
              </span>
            )}

            {/* Checklist progress pill */}
            {totalChecklist > 0 && (
              <span
                className={`flex items-center gap-1 font-medium px-1.5 py-0.5 rounded-md ${
                  isChecklistAllDone
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                }`}
                title={`子任務完成進度: ${completedChecklist}/${totalChecklist}`}
              >
                <CheckSquare2 className="w-3.5 h-3.5" />
                <span>
                  {completedChecklist}/{totalChecklist}
                </span>
              </span>
            )}

            {/* Due date badge (Formatted with only Date and dynamic urgency color) */}
            {dueDateStatus && (
              <span
                className={`flex items-center gap-1.5 ml-auto text-[11px] px-2 py-0.5 rounded-lg font-bold transition-all ${dueDateStatus.badgeClasses.cardBadge}`}
                title={`到期時間: ${dueDateStatus.formattedFullDateTime} (${dueDateStatus.label})`}
              >
                <Calendar className={`w-3.5 h-3.5 ${dueDateStatus.badgeClasses.iconColor}`} />
                <span className={dueDateStatus.badgeClasses.cardText}>
                  {dueDateStatus.formattedDateOnly}
                </span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
