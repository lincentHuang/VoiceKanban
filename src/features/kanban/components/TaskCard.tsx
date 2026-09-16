"use client";

import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/core/types/task";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { getDueDateStatus } from "@/core/utils/dateUtils";
import confetti from "canvas-confetti";
import { TaskCardRowVariant } from "./task-card/TaskCardRowVariant";
import { TaskCardCover } from "./task-card/TaskCardCover";
import { TaskCardHeader } from "./task-card/TaskCardHeader";
import { TaskCardTags } from "./task-card/TaskCardTags";
import { TaskCardBadges } from "./task-card/TaskCardBadges";
import { TaskCardSubtasksAccordion } from "./task-card/TaskCardSubtasksAccordion";
import { TaskCardLinkCover, TaskCardLinkMeta, LinkEnrichingHint } from "@/features/bookmarks/components/TaskCardLinkParts";

interface TaskCardProps {
  task: Task;
  variant?: "card" | "row";
  inboxWidth?: number;
  isOverlay?: boolean;
}

const TaskCardImpl: React.FC<TaskCardProps> = ({ task, variant = "card", inboxWidth = 320, isOverlay = false }) => {
  // 每一項都收斂成純量或穩定的 action 參考。整包 useKanbanStore() 會讓畫面上
  // 每一張卡在任何一次 store 變動（開收件匣、拖曳、同步寫入）時全部重畫。
  const toggleTaskComplete = useKanbanStore((s) => s.toggleTaskComplete);
  const setEditingTaskId = useKanbanStore((s) => s.setEditingTaskId);
  const toggleTaskSelection = useKanbanStore((s) => s.toggleTaskSelection);
  const toggleChecklistItem = useKanbanStore((s) => s.toggleChecklistItem);
  const isMultiSelectMode = useKanbanStore((s) => s.isMultiSelectMode);
  const isSelected = useKanbanStore((s) => s.selectedTaskIds.includes(task.id));
  const isEnrichingLink = useKanbanStore((s) => Boolean(s.enrichingTaskIds[task.id]));
  // 只有家人共用的看板才需要標示是誰記的；個人看板上每張卡都是自己，顯示只是雜訊
  const isSharedBoard = useKanbanStore((s) => Boolean(s.boards.find((b) => b.id === task.boardId)?.isShared));

  const [isSubtasksExpanded, setIsSubtasksExpanded] = useState(false);

  const sortable = useSortable({
    id: task.id, data: { type: "Task", task }, disabled: isMultiSelectMode || isOverlay,
  });

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = isOverlay
    ? { attributes: {}, listeners: {}, setNodeRef: undefined, transform: null, transition: undefined, isDragging: false }
    : sortable;

  const style = isOverlay ? undefined : { transform: CSS.Transform.toString(transform), transition };

  const handleCardClick = (e: React.MouseEvent) => {
    if (isMultiSelectMode) { e.stopPropagation(); toggleTaskSelection(task.id); }
    else { setEditingTaskId(task.id); }
  };

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.completed) {
      try { confetti({ particleCount: 35, spread: 55, origin: { y: 0.8 }, colors: ["#BEF264", "#F97316", "#10B981"] }); } catch {}
    }
    toggleTaskComplete(task.id);
  };

  const totalChecklist = task.checklist ? task.checklist.length : 0;
  const completedChecklist = task.checklist ? task.checklist.filter((i) => i.completed).length : 0;
  const isChecklistAllDone = totalChecklist > 0 && totalChecklist === completedChecklist;
  const dueDateStatus = getDueDateStatus(task.dueDate, task.completed, task.isAllDay, task.startDate);
  const totalAttachments = (task.attachments?.length || 0) > 0 ? task.attachments!.length : (task.attachmentsCount || 0);
  const creator = isSharedBoard ? task.createdBy : null;

  if (variant === "row") {
    return (
      <div ref={setNodeRef} style={style} data-task-card="true" {...attributes} {...listeners} onClick={handleCardClick} className={`group relative bg-white dark:bg-slate-850 rounded-xl px-3 py-2 shadow-2xs hover:shadow-card-hover border transition-[box-shadow,border-color,opacity] select-none cursor-grab active:cursor-grabbing ${isSelected ? "border-2 border-orange-500 bg-orange-50/40" : "border-slate-200/80 dark:border-slate-700/80 hover:border-orange-400"} ${isDragging ? "opacity-25" : ""} ${task.completed ? "opacity-65 bg-slate-50/80" : ""}`}>
        <TaskCardRowVariant task={task} isEnrichingLink={isEnrichingLink} isSelected={isSelected} isMultiSelectMode={isMultiSelectMode} inboxWidth={inboxWidth} onSelect={() => toggleTaskSelection(task.id)} onToggleComplete={handleToggleComplete} />
      </div>
    );
  }

  return (
    // 這裡原本是 bg-white/95 + backdrop-blur-md：底色已經 95% 不透明，模糊只影響最後
    // 5% 的像素，肉眼看不出來，卻讓橫向捲動時每一幀都要對背景重新取樣一次。
    <div ref={setNodeRef} style={style} data-task-card="true" {...attributes} {...listeners} onClick={handleCardClick} className={`group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover border transition-[box-shadow,border-color,opacity] select-none cursor-grab active:cursor-grabbing ${isSelected ? "border-2 border-orange-500 bg-orange-50/40" : "border-slate-100 dark:border-slate-700/80 hover:border-slate-300"} ${isDragging ? "opacity-25" : ""} ${task.completed ? "opacity-65 bg-slate-50/80" : ""}`}>
      {task.link && !task.coverColor ? <TaskCardLinkCover link={task.link} /> : <TaskCardCover coverColor={task.coverColor} coverAspectRatio={task.coverAspectRatio} />}
      <div className="p-3 sm:p-3.5">
        <TaskCardHeader title={task.title} completed={task.completed} isSelected={isSelected} isMultiSelectMode={isMultiSelectMode} onSelect={() => toggleTaskSelection(task.id)} onToggleComplete={handleToggleComplete} />
        {isEnrichingLink ? <div className="mt-1.5"><LinkEnrichingHint /></div> : task.link && <TaskCardLinkMeta link={task.link} />}
        <TaskCardTags tags={task.tags} dueDateStatus={dueDateStatus} completed={task.completed} />
        <TaskCardBadges isStarred={task.isStarred} hasDescription={Boolean(task.description)} totalAttachments={totalAttachments} totalChecklist={totalChecklist} completedChecklist={completedChecklist} isChecklistAllDone={isChecklistAllDone} isSubtasksExpanded={isSubtasksExpanded} dueDateStatus={dueDateStatus} creator={creator} onToggleSubtasksExpand={(e) => { e.stopPropagation(); setIsSubtasksExpanded(!isSubtasksExpanded); }} />
        <TaskCardSubtasksAccordion isSubtasksExpanded={isSubtasksExpanded} totalChecklist={totalChecklist} completedChecklist={completedChecklist} isChecklistAllDone={isChecklistAllDone} checklist={task.checklist} onSubtaskToggle={(e, id, cur) => { e.stopPropagation(); if (!cur && completedChecklist + 1 === totalChecklist) { try { confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 }, colors: ["#10B981", "#3B82F6", "#F59E0B"] }); } catch {} } toggleChecklistItem(task.id, id); }} />
      </div>
    </div>
  );
};

// 卡片數量通常是畫面上最大的一群節點，memo 讓「不是這張卡改了」的更新直接跳過。
export const TaskCard = React.memo(TaskCardImpl);
TaskCard.displayName = "TaskCard";
