"use client";

import React from "react";
import { useEscapeKey } from "@/core/hooks/useEscapeKey";
import { useAddTaskForm } from "./add-task/useAddTaskForm";
import { AddTaskHeader } from "./add-task/AddTaskHeader";
import { AddTaskTitleDescription } from "./add-task/AddTaskTitleDescription";
import { AddTaskColumnStarRow } from "./add-task/AddTaskColumnStarRow";
import { AddTaskDateSection } from "./add-task/AddTaskDateSection";
import { AddTaskTagsSection } from "./add-task/AddTaskTagsSection";
import { AddTaskModalFooter } from "./add-task/AddTaskModalFooter";

export const AddTaskModal: React.FC = () => {
  const form = useAddTaskForm();

  useEscapeKey(() => {
    if (form.isAddTaskModalOpen) form.setIsAddTaskModalOpen(false);
  }, form.isAddTaskModalOpen);

  if (!form.isAddTaskModalOpen) return null;

  return (
    <div
      onClick={() => form.setIsAddTaskModalOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[calc(100dvh-2rem)] sm:max-h-[90vh] flex flex-col backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 border border-white/80 dark:border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden"
      >
        <AddTaskHeader onClose={() => form.setIsAddTaskModalOpen(false)} />

        <form onSubmit={form.handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6 pt-4 space-y-4">
          <AddTaskTitleDescription
            title={form.title}
            setTitle={form.setTitle}
            description={form.description}
            setDescription={form.setDescription}
          />
          <AddTaskColumnStarRow
            columnId={form.columnId}
            setColumnId={form.setColumnId}
            columns={form.columns}
            isStarred={form.isStarred}
            setIsStarred={form.setIsStarred}
          />
          <AddTaskDateSection
            dueDate={form.dueDate}
            startDate={form.startDate}
            isAllDay={form.isAllDay}
            setStartDate={form.setStartDate}
            setDueDate={form.setDueDate}
            setIsAllDay={form.setIsAllDay}
          />
          <AddTaskTagsSection
            tagInput={form.tagInput}
            setTagInput={form.setTagInput}
            tags={form.tags}
            onAddTag={form.handleAddTag}
            onRemoveTag={form.handleRemoveTag}
          />
          <AddTaskModalFooter
            onClose={() => form.setIsAddTaskModalOpen(false)}
            isSubmitting={form.isSubmitting}
            disabled={form.isSubmitting || !form.title.trim()}
          />
        </form>
      </div>
    </div>
  );
};
export default AddTaskModal;
