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
import { TaskCardLinkCover, TaskCardLinkMeta } from "@/features/bookmarks";

interface TaskCardProps {
  task: Task;
  variant?: "card" | "row";
  inboxWidth?: number;
  isOverlay?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, variant = "card", inboxWidth = 320, isOverlay = false }) => {
  const store = useKanbanStore();
  const { toggleTaskComplete, setEditingTaskId, isMultiSelectMode, selectedTaskIds, toggleTaskSelection, toggleChecklistItem } = store;
  const [isSubtasksExpanded, setIsSubtasksExpanded] = useState(false);

  const sortable = useSortable({
    id: task.id, data: { type: "Task", task }, disabled: isMultiSelectMode || isOverlay,
  });

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = isOverlay
    ? { attributes: {}, listeners: {}, setNodeRef: undefined, transform: null, transition: undefined, isDragging: false }
    : sortable;

  const style = isOverlay ? undefined : { transform: CSS.Transform.toString(transform), transition };
  const isSelected = selectedTaskIds.includes(task.id);

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

  if (variant === "row") {
    return (
      <div ref={setNodeRef} style={style} data-task-card="true" {...attributes} {...listeners} onClick={handleCardClick} className={`group relative bg-white/95 dark:bg-slate-850 backdrop-blur-md rounded-xl px-3 py-2 shadow-2xs hover:shadow-card-hover border transition-all select-none cursor-grab active:cursor-grabbing ${isSelected ? "border-2 border-orange-500 bg-orange-50/40" : "border-slate-200/80 dark:border-slate-700/80 hover:border-orange-400"} ${isDragging ? "opacity-25" : ""} ${task.completed ? "opacity-65 bg-slate-50/80" : ""}`}>
        <TaskCardRowVariant task={task} isSelected={isSelected} isMultiSelectMode={isMultiSelectMode} inboxWidth={inboxWidth} onSelect={() => toggleTaskSelection(task.id)} onToggleComplete={handleToggleComplete} />
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} data-task-card="true" {...attributes} {...listeners} onClick={handleCardClick} className={`group relative bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover border transition-all select-none cursor-grab active:cursor-grabbing ${isSelected ? "border-2 border-orange-500 bg-orange-50/40" : "border-slate-100 dark:border-slate-700/80 hover:border-slate-300"} ${isDragging ? "opacity-25" : ""} ${task.completed ? "opacity-65 bg-slate-50/80" : ""}`}>
      {task.link && !task.coverColor ? <TaskCardLinkCover link={task.link} /> : <TaskCardCover coverColor={task.coverColor} coverAspectRatio={task.coverAspectRatio} />}
      <div className="p-3 sm:p-3.5">
        <TaskCardHeader title={task.title} completed={task.completed} isSelected={isSelected} isMultiSelectMode={isMultiSelectMode} onSelect={() => toggleTaskSelection(task.id)} onToggleComplete={handleToggleComplete} />
        {task.link && <TaskCardLinkMeta link={task.link} />}
        <TaskCardTags tags={task.tags} dueDateStatus={dueDateStatus} completed={task.completed} />
        <TaskCardBadges isStarred={task.isStarred} hasDescription={Boolean(task.description)} totalAttachments={totalAttachments} totalChecklist={totalChecklist} completedChecklist={completedChecklist} isChecklistAllDone={isChecklistAllDone} isSubtasksExpanded={isSubtasksExpanded} dueDateStatus={dueDateStatus} onToggleSubtasksExpand={(e) => { e.stopPropagation(); setIsSubtasksExpanded(!isSubtasksExpanded); }} />
        <TaskCardSubtasksAccordion isSubtasksExpanded={isSubtasksExpanded} totalChecklist={totalChecklist} completedChecklist={completedChecklist} isChecklistAllDone={isChecklistAllDone} checklist={task.checklist} onSubtaskToggle={(e, id, cur) => { e.stopPropagation(); if (!cur && completedChecklist + 1 === totalChecklist) { try { confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 }, colors: ["#10B981", "#3B82F6", "#F59E0B"] }); } catch {} } toggleChecklistItem(task.id, id); }} />
      </div>
    </div>
  );
};
