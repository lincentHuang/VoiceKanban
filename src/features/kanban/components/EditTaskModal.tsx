"use client";

import React, { useState } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { ColumnId, TaskAttachment } from "@/core/types/task";
import { MarkdownEditor } from "@/features/editor";
import { DateTimePicker } from "@/components/common/DateTimePicker";
import { useEscapeKey } from "@/core/hooks/useEscapeKey";
import confetti from "canvas-confetti";
import { CheckCircle2 } from "lucide-react";
import { useDrawerGesture } from "./edit-task/useDrawerGesture";
import { useEditTaskForm } from "./edit-task/useEditTaskForm";
import { EditTaskCoverBanner } from "./edit-task/EditTaskCoverBanner";
import { EditTaskHeaderControls } from "./edit-task/EditTaskHeaderControls";
import { EditTaskTitleInput } from "./edit-task/EditTaskTitleInput";
import { EditTaskChecklistSection } from "./edit-task/EditTaskChecklistSection";
import { EditTaskAttachmentsSection } from "./edit-task/EditTaskAttachmentsSection";
import { EditTaskTagsSection } from "./edit-task/EditTaskTagsSection";
import { EditTaskCommentsSection } from "./edit-task/EditTaskCommentsSection";
import { EditTaskExpandModal } from "./edit-task/EditTaskExpandModal";
import { EditTaskDeleteModal } from "./edit-task/EditTaskDeleteModal";
import { EditTaskLinkSection } from "@/features/bookmarks";

export const EditTaskModal: React.FC = () => {
  const store = useKanbanStore();
  const { editingTaskId, setEditingTaskId, tasks, getActiveBoardColumns, activeBoardId } = store;
  const task = tasks.find((t) => t.id === editingTaskId);
  const columns = getActiveBoardColumns();
  const allTargetColumns = [{ id: "inbox" as ColumnId, title: "靈感收件匣", icon: "📥" }, ...columns];

  const [isMovePopoverOpen, setIsMovePopoverOpen] = useState(false);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const [isExpandConfirm, setIsExpandConfirm] = useState(false);

  const gesture = useDrawerGesture(() => setEditingTaskId(null), editingTaskId);
  const form = useEditTaskForm(task);

  useEscapeKey(() => {
    if (isDeleteConfirm) setIsDeleteConfirm(false);
    else if (isCoverModalOpen) setIsCoverModalOpen(false);
    else if (isMovePopoverOpen) setIsMovePopoverOpen(false);
    else if (isExpandConfirm) setIsExpandConfirm(false);
    else if (editingTaskId) gesture.handleCloseDrawer();
  }, !!editingTaskId);

  if (!editingTaskId || !task) return null;

  const currentColumn = form.columnId === "inbox" ? { id: "inbox" as ColumnId, title: "靈感收件匣", icon: "📥" } : columns.find((c) => c.id === form.columnId) || columns[0] || { id: "todo" as ColumnId, title: "待辦清單", icon: "📋" };

  const handleMoveColumn = (targetColId: ColumnId) => {
    const newBoardId = targetColId === "inbox" ? "global" : (task.boardId === "global" ? activeBoardId : task.boardId || activeBoardId);
    form.setColumnId(targetColId);
    form.setBoardId(newBoardId);
    store.updateTask(task.id, { columnId: targetColId, boardId: newBoardId, completed: task.completed });
    setIsMovePopoverOpen(false);
  };

  const handleToggleComplete = () => {
    if (!task.completed) {
      try { confetti({ particleCount: 45, spread: 60, origin: { y: 0.7 }, colors: ["#BEF264", "#F97316", "#10B981"] }); } catch {}
    }
    store.toggleTaskComplete(task.id);
  };

  const handleExpandToColumn = () => {
    try { confetti({ particleCount: 55, spread: 70, origin: { y: 0.6 }, colors: ["#6366F1", "#3B82F6", "#F97316", "#10B981"] }); } catch {}
    store.expandTaskToColumn(task.id);
  };

  return (
    <div onClick={gesture.handleCloseDrawer} className={`fixed inset-0 z-50 flex ${gesture.isMobile ? "items-end" : "items-center"} justify-center ${gesture.isMobile ? "p-0" : "p-3 sm:p-4"} bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-200 overflow-hidden`}>
      <div onClick={(e) => e.stopPropagation()} onTouchStart={gesture.handleTouchStart} onTouchMove={gesture.handleTouchMove} onTouchEnd={gesture.handleTouchEnd} style={{ transform: gesture.isMobile ? (gesture.isClosingDrawer ? "translateY(100%)" : `translateY(${gesture.drawerDragY}px)`) : undefined, transition: gesture.isDraggingDrawer ? "none" : "transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)" }} className={`w-full ${gesture.isMobile ? "max-h-[88dvh] h-[88dvh] rounded-t-[2rem] rounded-b-none border-t border-x border-white/80 dark:border-slate-800" : "max-w-4xl max-h-[calc(100dvh-2rem)] sm:max-h-[90vh] rounded-3xl border border-white/80 dark:border-slate-800"} flex flex-col backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 shadow-2xl relative text-slate-800 dark:text-slate-100 overflow-hidden`}>
        {gesture.isMobile && <div className="w-full flex items-center justify-center pt-2.5 pb-1 shrink-0 cursor-grab"><div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" /></div>}
        <EditTaskCoverBanner coverColor={form.coverColor} coverAspectRatio={form.coverAspectRatio} isMobile={gesture.isMobile} onOpenCoverModal={() => setIsCoverModalOpen(true)} onRemoveCover={() => { form.setCoverColor(""); store.updateTask(task.id, { coverColor: "" }); }} />
        <div ref={gesture.scrollContentRef} className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-7 space-y-5">
          <div className="space-y-2">
            <EditTaskHeaderControls completed={task.completed} isStarred={form.isStarred} coverColor={form.coverColor} coverAspectRatio={form.coverAspectRatio} columnId={form.columnId} allTargetColumns={allTargetColumns} isMovePopoverOpen={isMovePopoverOpen} isCoverModalOpen={isCoverModalOpen} onToggleComplete={handleToggleComplete} onToggleStar={() => { form.setIsStarred(!form.isStarred); store.updateTask(task.id, { isStarred: !form.isStarred }); }} onToggleMovePopover={() => { setIsMovePopoverOpen(!isMovePopoverOpen); setIsCoverModalOpen(false); }} onToggleCoverModal={() => { setIsCoverModalOpen(!isCoverModalOpen); setIsMovePopoverOpen(false); }} onSelectRatio={(r) => { form.setCoverAspectRatio(r); store.updateTask(task.id, { coverAspectRatio: r }); }} onApplyCover={(c) => form.handleApplyCover(c)} onRemoveCover={() => { form.setCoverColor(""); store.updateTask(task.id, { coverColor: "" }); }} onMoveColumn={handleMoveColumn} onOpenExpandConfirm={() => setIsExpandConfirm(true)} onOpenDeleteConfirm={() => setIsDeleteConfirm(true)} onClose={gesture.handleCloseDrawer} />
            <EditTaskTitleInput title={form.title} onChange={form.setTitle} onBlur={() => form.handleSave()} />
            <div className="pt-0.5"><DateTimePicker value={form.dueDate} startDate={form.startDate} isAllDay={form.isAllDay} onChange={(d) => { form.setStartDate(d.startDate || null); form.setDueDate(d.dueDate); form.setIsAllDay(d.isAllDay); store.updateTask(task.id, { startDate: d.startDate || null, dueDate: d.dueDate, isAllDay: d.isAllDay }); }} align="left" placeholder="+ 設定到期日或活動時段" /></div>
            {task.link && <div className="pt-1"><EditTaskLinkSection link={task.link} /></div>}
          </div>
          {form.saveToast && <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span>變更已即時自動儲存！</span></div>}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            <div className="lg:col-span-7 space-y-6">
              <EditTaskChecklistSection taskId={task.id} checklist={task.checklist} onAddChecklistItem={store.addChecklistItem} onUpdateChecklistItem={store.updateChecklistItem} onToggleChecklistItem={store.toggleChecklistItem} onRemoveChecklistItem={store.removeChecklistItem} onReorderChecklistItems={store.reorderChecklistItems} />
              <MarkdownEditor value={form.description} onChange={(val) => { form.setDescription(val); store.updateTask(task.id, { description: val }); }} onSave={(val) => { form.setDescription(val); form.handleSave(val); }} title="說明 (Markdown & 圖片)" placeholder="輸入詳細說明，支援 Markdown 粗體、連結、清單..." />
            </div>
            <div className="lg:col-span-5 space-y-4">
              <EditTaskTagsSection tags={form.tags} onAddTag={(t) => { const u = [...form.tags, t]; form.setTags(u); store.updateTask(task.id, { tags: u }); }} onRemoveTag={(t) => { const u = form.tags.filter((x) => x !== t); form.setTags(u); store.updateTask(task.id, { tags: u }); }} />
              <EditTaskAttachmentsSection taskId={task.id} attachments={task.attachments} onAddAttachment={store.addAttachment} onRemoveAttachment={store.removeAttachment} onInsertToDescription={(att) => { const md = `\n![${att.name}](${att.url})\n`; const u = form.description ? `${form.description}\n${md}` : md; form.setDescription(u); store.updateTask(task.id, { description: u }); }} />
              <EditTaskCommentsSection activities={task.activities} userName={store.userSession.name} currentColumnTitle={currentColumn?.title} onAddComment={(text) => { const act = { id: `act-${Date.now()}`, user: store.userSession.name, text, createdAt: new Date().toISOString() }; store.updateTask(task.id, { activities: [...(task.activities || []), act] }); }} />
              <EditTaskExpandModal isExpandConfirm={isExpandConfirm} taskTitle={form.title || task.title} totalItems={task.checklist?.length || 0} onOpenConfirm={() => setIsExpandConfirm(true)} onCancelConfirm={() => setIsExpandConfirm(false)} onConfirmExpand={handleExpandToColumn} />
            </div>
          </div>
        </div>
      </div>
      <EditTaskDeleteModal isOpen={isDeleteConfirm} taskTitle={form.title || task.title} onClose={() => setIsDeleteConfirm(false)} onConfirmDelete={() => { store.deleteTask(task.id); setEditingTaskId(null); }} />
    </div>
  );
};
