"use client";

import React, { useState, useEffect, useRef } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { ColumnId, CoverAspectRatio, TRELLO_COLUMN_COLORS, TaskAttachment } from "@/core/types/task";
import { getDueDateStatus, isoToDateTimeLocal, dateTimeLocalToIso } from "@/core/utils/dateUtils";
import { MarkdownEditor } from "../editor/MarkdownEditor";
import { DateTimePicker } from "../common/DateTimePicker";
import { useEscapeKey } from "@/core/hooks/useEscapeKey";
import {
  X,
  Calendar,
  Tag,
  Trash2,
  CheckCircle2,
  AlignLeft,
  CheckSquare,
  MessageSquare,
  Palette,
  MoveRight,
  Plus,
  Square,
  ChevronDown,
  Star,
  Image as ImageIcon,
  Upload,
  RectangleHorizontal,
  RectangleVertical,
  Maximize2,
  Minus,
  Edit3,
  Check,
  Paperclip,
  FileText,
  Download,
  ExternalLink,
} from "lucide-react";
import confetti from "canvas-confetti";

const GRADIENT_COVERS = [
  { name: "日落暖陽", value: "linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)" },
  { name: "極光青綠", value: "linear-gradient(135deg, #bef264 0%, #10b981 100%)" },
  { name: "深邃海洋", value: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
  { name: "霓虹魅紫", value: "linear-gradient(135deg, #c471ed 0%, #f64f59 100%)" },
];

const ASPECT_RATIO_OPTIONS: { id: CoverAspectRatio; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "banner", label: "橫式 16:9", icon: <RectangleHorizontal className="w-4 h-4" />, desc: "橫幅寬度" },
  { id: "1:1", label: "正方形 1:1", icon: <Square className="w-3.5 h-3.5" />, desc: "正方等比" },
  { id: "3:4", label: "直式 3:4", icon: <RectangleVertical className="w-3.5 h-3.5" />, desc: "海報直式" },
  { id: "9:16", label: "長直 9:16", icon: <RectangleVertical className="w-4 h-4 scale-y-125" />, desc: "全螢幕長版" },
  { id: "bar", label: "極簡飾條", icon: <Minus className="w-4 h-4" />, desc: "頂部細線" },
];

export const EditTaskModal: React.FC = () => {
  const {
    editingTaskId,
    setEditingTaskId,
    tasks,
    activeBoardId,
    getActiveBoardColumns,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    addChecklistItem,
    updateChecklistItem,
    toggleChecklistItem,
    removeChecklistItem,
    addAttachment,
    removeAttachment,
    userSession,
  } = useKanbanStore();

  const task = tasks.find((t) => t.id === editingTaskId);
  const columns = getActiveBoardColumns();
  const allTargetColumns = [
    { id: "inbox" as ColumnId, title: "靈感收件匣", icon: "📥" },
    ...columns,
  ];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [boardId, setBoardId] = useState("");
  const [columnId, setColumnId] = useState<ColumnId>("inbox");
  const [isStarred, setIsStarred] = useState(false);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [isAllDay, setIsAllDay] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [coverColor, setCoverColor] = useState<string>("");
  const [coverAspectRatio, setCoverAspectRatio] = useState<CoverAspectRatio>("banner");
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [editingChecklistId, setEditingChecklistId] = useState<string | null>(null);
  const [editingChecklistText, setEditingChecklistText] = useState("");
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isMovePopoverOpen, setIsMovePopoverOpen] = useState(false);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const attachmentFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setBoardId(task.boardId);
      setColumnId(task.columnId);
      setIsStarred(!!task.isStarred);
      setDueDate(task.dueDate || null);
      setStartDate(task.startDate || null);
      setIsAllDay(!!task.isAllDay);
      setTags(task.tags || []);
      setCoverColor(task.coverColor || "");
      setCoverAspectRatio(task.coverAspectRatio || (task.coverColor?.startsWith("data:image") || task.coverColor?.startsWith("http") ? "banner" : "bar"));
      setIsDeleteConfirm(false);
      setSaveToast(false);
      setIsMovePopoverOpen(false);
      setIsCoverModalOpen(false);
    }
  }, [task]);

  useEscapeKey(() => {
    if (isCoverModalOpen) {
      setIsCoverModalOpen(false);
    } else if (isMovePopoverOpen) {
      setIsMovePopoverOpen(false);
    } else if (editingTaskId) {
      setEditingTaskId(null);
    }
  }, !!editingTaskId);

  if (!editingTaskId || !task) return null;

  const currentColumn =
    columnId === "inbox"
      ? { id: "inbox" as ColumnId, title: "靈感收件匣", icon: "📥" }
      : columns.find((c) => c.id === columnId) || columns[0] || { id: "todo" as ColumnId, title: "待辦清單", icon: "📋" };

  const handleMoveColumn = (targetColId: ColumnId) => {
    const newBoardId = targetColId === "inbox" ? "global" : (task.boardId === "global" ? activeBoardId : task.boardId || activeBoardId);
    setColumnId(targetColId);
    setBoardId(newBoardId);
    updateTask(task.id, {
      columnId: targetColId,
      boardId: newBoardId,
      completed: targetColId === "done" ? true : (task.columnId === "done" ? false : task.completed),
    });
    setIsMovePopoverOpen(false);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const updated = [...tags, tagInput.trim()];
      setTags(updated);
      setTagInput("");
      updateTask(task.id, { tags: updated });
    }
  };

  const handleRemoveTag = (tToRemove: string) => {
    const updated = tags.filter((t) => t !== tToRemove);
    setTags(updated);
    updateTask(task.id, { tags: updated });
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistTitle.trim()) return;
    addChecklistItem(task.id, newChecklistTitle.trim());
    setNewChecklistTitle("");
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const newActivity = {
      id: `act-${Date.now()}`,
      user: userSession.name,
      text: newComment.trim(),
      createdAt: new Date().toISOString(),
    };
    updateTask(task.id, {
      activities: [...(task.activities || []), newActivity],
    });
    setNewComment("");
  };

  const handleToggleStar = () => {
    const newStarred = !isStarred;
    setIsStarred(newStarred);
    updateTask(task.id, { isStarred: newStarred });
  };

  const handleStartEditChecklist = (itemId: string, currentTitle: string) => {
    setEditingChecklistId(itemId);
    setEditingChecklistText(currentTitle);
  };

  const handleSaveEditChecklist = (itemId: string) => {
    if (editingChecklistText.trim()) {
      updateChecklistItem(task.id, itemId, editingChecklistText.trim());
    }
    setEditingChecklistId(null);
    setEditingChecklistText("");
  };

  const handleCancelEditChecklist = () => {
    setEditingChecklistId(null);
    setEditingChecklistText("");
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 10MB limit (10 * 1024 * 1024 bytes)
    if (file.size > 10 * 1024 * 1024) {
      setAttachmentError("檔案大小超過 10MB 限制！請選擇小於 10MB 的檔案。");
      setTimeout(() => setAttachmentError(null), 3500);
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      const newAttachment: TaskAttachment = {
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
        url: base64Url,
        createdAt: new Date().toISOString(),
      };
      addAttachment(task.id, newAttachment);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleInsertAttachmentToDescription = (att: TaskAttachment) => {
    const imgMarkdown = `\n![${att.name}](${att.url})\n`;
    const updated = description ? `${description}\n${imgMarkdown}` : imgMarkdown;
    setDescription(updated);
    updateTask(task.id, { description: updated });
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    updateTask(task.id, {
      title: title.trim(),
      description: description.trim(),
      boardId,
      columnId,
      isStarred,
      tags,
      coverColor,
      coverAspectRatio,
      startDate: startDate || null,
      dueDate: dueDate || null,
      isAllDay,
      completed: columnId === "done" ? true : task.completed,
    });

    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
    }, 1500);
  };

  const handleToggleComplete = () => {
    if (!task.completed) {
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#BEF264", "#F97316", "#10B981"],
        });
      } catch {}
    }
    toggleTaskComplete(task.id);
  };

  const handleRemoveDueDate = () => {
    setDueDate(null);
    updateTask(task.id, { dueDate: null });
  };

  const handleApplyCover = (val: string, ratio?: CoverAspectRatio) => {
    const newRatio = ratio || coverAspectRatio || (val.startsWith("data:image") || val.startsWith("http") ? "banner" : "bar");
    setCoverColor(val);
    setCoverAspectRatio(newRatio);
    updateTask(task.id, { coverColor: val, coverAspectRatio: newRatio });
  };

  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        handleApplyCover(base64Url, "banner");
      };
      reader.readAsDataURL(file);
    }
  };

  const isImageCover = coverColor?.startsWith("data:image") || coverColor?.startsWith("http");

  const totalItems = task.checklist ? task.checklist.length : 0;
  const completedItems = task.checklist ? task.checklist.filter((i) => i.completed).length : 0;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const dueDateStatus = getDueDateStatus(dueDate ? dateTimeLocalToIso(dueDate) : task.dueDate, task.completed);

  // Modal Cover Height styles based on coverAspectRatio
  const getModalCoverHeightClass = () => {
    if (!coverColor) return "h-0";
    if (coverAspectRatio === "bar") return "min-h-[44px] h-12";
    if (coverAspectRatio === "1:1") return "min-h-[200px] h-56 sm:h-64";
    if (coverAspectRatio === "3:4") return "min-h-[240px] h-64 sm:h-72";
    if (coverAspectRatio === "9:16") return "min-h-[280px] h-72 sm:h-80";
    return "min-h-[120px] h-32 sm:h-40"; // banner 16:9
  };

  return (
    <div
      onClick={() => setEditingTaskId(null)}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl my-auto backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 border border-white/80 dark:border-slate-800 rounded-3xl shadow-2xl relative text-slate-800 dark:text-slate-100"
      >
        {/* Top Cover Banner */}
        {coverColor && (
          <div
            style={{
              background: isImageCover ? `url(${coverColor}) center/cover no-repeat` : coverColor,
              backgroundColor: !isImageCover && !coverColor.startsWith("linear") ? coverColor : undefined,
            }}
            className={`w-full ${getModalCoverHeightClass()} rounded-t-3xl relative flex items-end justify-between px-4 pb-3 pt-6 group/cover transition-all duration-300 shadow-xs`}
          >
            {/* Aspect Ratio Badge Indicator */}
            <span className="text-[10px] bg-black/60 text-white px-2.5 py-1 rounded-lg backdrop-blur-md uppercase font-bold tracking-wider shadow-xs">
              {coverAspectRatio === "banner" ? "16:9 橫式" : coverAspectRatio === "1:1" ? "1:1 正方形" : coverAspectRatio === "3:4" ? "3:4 直式" : coverAspectRatio === "9:16" ? "9:16 長版" : "飾條"}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCoverModalOpen(true)}
                className="text-xs bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 rounded-xl backdrop-blur-md font-semibold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shadow-xs"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>變更比例與樣式</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCoverColor("");
                  updateTask(task.id, { coverColor: "" });
                }}
                className="text-xs bg-black/60 hover:bg-rose-600 text-white px-3 py-1.5 rounded-xl backdrop-blur-md font-semibold transition-all hover:scale-105 active:scale-95 shadow-xs"
              >
                ✕ 移除
              </button>
            </div>
          </div>
        )}

        {/* Modal Content */}
        <div className="p-5 sm:p-7 space-y-5">
          {/* Header Bar */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Title input */}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => handleSave()}
                className="w-full text-lg sm:text-xl font-bold bg-transparent border-b border-transparent hover:border-slate-300 focus:border-orange-500 focus:outline-none py-1 transition-colors"
                placeholder="任務標題..."
              />
            </div>

            {/* Top Right Controls */}
            <div className="flex items-center gap-2">
              {/* Star Important Toggle */}
              <button
                type="button"
                onClick={handleToggleStar}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  isStarred
                    ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700 shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-amber-600 border-slate-200 hover:border-amber-400"
                }`}
                title={isStarred ? "取消重要標記" : "標記為重要事項"}
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    isStarred ? "fill-amber-500 text-amber-500" : "text-slate-400"
                  }`}
                />
                <span>{isStarred ? "重要" : "設為重要"}</span>
              </button>

              {/* Complete Toggle */}
              <button
                onClick={handleToggleComplete}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  task.completed
                    ? "bg-emerald-500 text-white border-emerald-500 shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 hover:border-emerald-500"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{task.completed ? "已完成" : "標記完成"}</span>
              </button>

              <button
                onClick={() => setEditingTaskId(null)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Toast feedback */}
          {saveToast && (
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>變更已即時自動儲存！</span>
            </div>
          )}

          {/* Main Grid: Left Details (7/12) + Right Actions (5/12) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            {/* Left Column: Checklist (First) -> Description (Second) -> Attachments (Third) -> Comments */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1. Checklist (待辦清單 - 移至最上方並支援點擊編輯修改) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-orange-500" />
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">待辦清單</h4>
                  </div>
                  {totalItems > 0 && (
                    <span className="text-xs font-bold text-slate-500 font-mono">
                      {progressPercent}%
                    </span>
                  )}
                </div>

                {/* Progress Bar */}
                {totalItems > 0 && (
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mb-3 overflow-hidden">
                    <div
                      style={{ width: `${progressPercent}%` }}
                      className={`h-full transition-all duration-300 ${
                        progressPercent === 100 ? "bg-emerald-500" : "bg-orange-500"
                      }`}
                    />
                  </div>
                )}

                {/* Checklist Items */}
                <div className="space-y-1.5 mb-3">
                  {task.checklist &&
                    task.checklist.map((item) => (
                      <div
                        key={item.id}
                        className="group flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-200/60 transition-colors"
                      >
                        {editingChecklistId === item.id ? (
                          /* Inline Edit Mode */
                          <div className="flex items-center gap-2 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              autoFocus
                              value={editingChecklistText}
                              onChange={(e) => setEditingChecklistText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleSaveEditChecklist(item.id);
                                }
                                if (e.key === "Escape") {
                                  e.preventDefault();
                                  handleCancelEditChecklist();
                                }
                              }}
                              className="flex-1 px-2.5 py-1 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-orange-500 rounded-lg focus:outline-none shadow-xs text-slate-800 dark:text-slate-100"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEditChecklist(item.id)}
                              className="p-1 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-xs"
                              title="儲存修改"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEditChecklist}
                              className="p-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 transition-colors"
                              title="取消"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          /* Normal Display Mode */
                          <>
                            <div
                              onClick={() => toggleChecklistItem(task.id, item.id)}
                              className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer select-none"
                            >
                              {item.completed ? (
                                <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                              )}
                              <span
                                className={`text-xs sm:text-sm break-words flex-1 ${
                                  item.completed
                                    ? "line-through text-slate-400 dark:text-slate-500"
                                    : "text-slate-700 dark:text-slate-200"
                                }`}
                              >
                                {item.title}
                              </span>
                            </div>

                            {/* Hover Actions: Edit Pencil & Delete Trash */}
                            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0 ml-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartEditChecklist(item.id, item.title);
                                }}
                                className="p-1 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors"
                                title="編輯項目名稱"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeChecklistItem(task.id, item.id);
                                }}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors"
                                title="刪除項目"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                </div>

                {/* Add Checklist Item Form */}
                <form onSubmit={handleAddChecklist} className="flex gap-2">
                  <input
                    type="text"
                    value={newChecklistTitle}
                    onChange={(e) => setNewChecklistTitle(e.target.value)}
                    placeholder="+ 新增子任務項目..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                  />
                  <button
                    type="submit"
                    disabled={!newChecklistTitle.trim()}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold disabled:opacity-40 hover:bg-slate-700 transition-colors"
                  >
                    新增
                  </button>
                </form>
              </div>

              {/* 2. Description (說明 - Markdown Editor 移至待辦清單後) */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlignLeft className="w-4 h-4 text-slate-400" />
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">說明 (Markdown & 圖片)</h4>
                </div>

                <MarkdownEditor
                  value={description}
                  onChange={(val) => {
                    setDescription(val);
                    updateTask(task.id, { description: val });
                  }}
                  onSave={() => handleSave()}
                  placeholder="輸入詳細說明，支援 Markdown 粗體、連結、清單，並可點擊 🖼️ 插入圖片或直接貼上截圖..."
                />
              </div>

              {/* 3. Attachments Section (附件檔案 - 支援圖片/資料，最大不能超過10MB) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-slate-400" />
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      附件檔案 <span className="text-xs font-normal text-slate-400">(最大 10MB)</span>
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => attachmentFileInputRef.current?.click()}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-orange-500" />
                    <span>上傳附件</span>
                  </button>

                  <input
                    type="file"
                    ref={attachmentFileInputRef}
                    onChange={handleAttachmentUpload}
                    className="hidden"
                  />
                </div>

                {/* Attachment Size Error Alert */}
                {attachmentError && (
                  <div className="mb-2 p-2.5 rounded-xl bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 text-xs font-semibold flex items-center justify-between animate-in fade-in">
                    <span>⚠️ {attachmentError}</span>
                    <button type="button" onClick={() => setAttachmentError(null)} className="text-rose-500 hover:text-rose-700">✕</button>
                  </div>
                )}

                {/* Attachments List */}
                {task.attachments && task.attachments.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {task.attachments.map((att) => {
                      const isImg = att.type.startsWith("image/") || att.url.startsWith("data:image");
                      return (
                        <div
                          key={att.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 hover:border-orange-300 transition-all group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            {isImg ? (
                              <img
                                src={att.url}
                                alt={att.name}
                                className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0 bg-white"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-950/50 text-orange-600 flex items-center justify-center shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate" title={att.name}>
                                {att.name}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                {formatFileSize(att.size)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-1">
                            {/* Insert image into Markdown description */}
                            {isImg && (
                              <button
                                type="button"
                                onClick={() => handleInsertAttachmentToDescription(att)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors"
                                title="插入到說明中"
                              >
                                <ImageIcon className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Download / Open File */}
                            <a
                              href={att.url}
                              download={att.name}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
                              title="下載/開啟檔案"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>

                            {/* Delete Attachment */}
                            <button
                              type="button"
                              onClick={() => removeAttachment(task.id, att.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors"
                              title="刪除附件"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    onClick={() => attachmentFileInputRef.current?.click()}
                    className="p-3 text-center rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-slate-400 text-xs cursor-pointer hover:border-orange-300 hover:bg-slate-50 transition-colors"
                  >
                    尚無附件檔案，點擊此處上傳圖片或資料檔案（最大 10MB）
                  </div>
                )}
              </div>

              {/* 4. Activity & Comments (留言與活動紀錄) */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    留言與活動紀錄
                  </h4>
                </div>

                <form onSubmit={handleAddComment} className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="撰寫評論或進度筆記..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="px-3.5 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold shadow-xs disabled:opacity-40 hover:bg-orange-600 transition-colors"
                  >
                    送出
                  </button>
                </form>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                  {task.activities && task.activities.length > 0 ? (
                    task.activities.map((act) => (
                      <div
                        key={act.id}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs border border-slate-100 dark:border-slate-800"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {act.user}
                          </span>
                          <span>{new Date(act.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">{act.text}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 italic p-2">
                      {userSession.name} 已將這張卡片加入「{currentColumn?.title}」
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Action Sidebar */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                卡片屬性與動作
              </span>

              {/* Action 1: Move Card */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMovePopoverOpen(!isMovePopoverOpen)}
                  className="w-full text-left px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <MoveRight className="w-3.5 h-3.5 text-blue-500" />
                    <span>移動卡片</span>
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isMovePopoverOpen ? "rotate-180" : ""}`} />
                </button>

                {isMovePopoverOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsMovePopoverOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 px-2 py-1 block">選取目標欄位</span>
                      {allTargetColumns.map((col) => (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => handleMoveColumn(col.id)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-colors ${
                            columnId === col.id
                              ? "bg-orange-500 text-white font-bold"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <span>{col.icon}</span>
                          <span>{col.title}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Action 2: Cover Customization & Aspect Ratio Button */}
              <div className="relative">
                <button
                  onClick={() => setIsCoverModalOpen(!isCoverModalOpen)}
                  className="w-full text-left px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Palette className="w-3.5 h-3.5 text-orange-500" />
                    <span>封面設定 (比例/色彩/圖)</span>
                  </span>
                  <span className="flex items-center gap-1">
                    {coverColor && (
                      <span
                        style={{
                          background: isImageCover ? `url(${coverColor}) center/cover` : coverColor,
                          backgroundColor: !isImageCover && !coverColor.startsWith("linear") ? coverColor : undefined,
                        }}
                        className="w-4 h-4 rounded-full border border-white shadow-2xs inline-block"
                      />
                    )}
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </span>
                </button>

                {/* Comprehensive Cover Picker Popover */}
                {isCoverModalOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsCoverModalOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-80 max-h-[380px] overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-3xl shadow-2xl p-4 z-50 animate-in fade-in space-y-3.5">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">設定卡片封面與比例</span>
                      <button
                        onClick={() => setIsCoverModalOpen(false)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Section 1: Aspect Ratio & Orientation (1:1, 3:4, 9:16, 16:9, bar) */}
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                        封面比例與版型
                      </span>
                      <div className="grid grid-cols-3 gap-1.5 mb-1.5">
                        {ASPECT_RATIO_OPTIONS.slice(0, 3).map((ratio) => (
                          <button
                            key={ratio.id}
                            onClick={() => {
                              setCoverAspectRatio(ratio.id);
                              updateTask(task.id, { coverAspectRatio: ratio.id });
                            }}
                            className={`p-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 border transition-all ${
                              coverAspectRatio === ratio.id
                                ? "bg-orange-500 text-white border-orange-500 shadow-xs"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                            }`}
                          >
                            {ratio.icon}
                            <span>{ratio.label}</span>
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        {ASPECT_RATIO_OPTIONS.slice(3).map((ratio) => (
                          <button
                            key={ratio.id}
                            onClick={() => {
                              setCoverAspectRatio(ratio.id);
                              updateTask(task.id, { coverAspectRatio: ratio.id });
                            }}
                            className={`p-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 border transition-all ${
                              coverAspectRatio === ratio.id
                                ? "bg-orange-500 text-white border-orange-500 shadow-xs"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                            }`}
                          >
                            {ratio.icon}
                            <span>{ratio.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Section 2: Solid Colors (10 Trello Colors) */}
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                        經典主題色彩
                      </span>
                      <div className="grid grid-cols-5 gap-1.5">
                        {TRELLO_COLUMN_COLORS.map((c) => (
                          <button
                            key={c.hex}
                            onClick={() => handleApplyCover(c.hex)}
                            style={{ backgroundColor: c.hex }}
                            className={`w-11 h-7 rounded-xl shadow-2xs hover:scale-105 active:scale-95 transition-all border ${
                              coverColor === c.hex
                                ? "ring-2 ring-orange-500 ring-offset-2 border-white"
                                : "border-transparent"
                            }`}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Section 3: Gradients */}
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                        極光漸層風格
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {GRADIENT_COVERS.map((g) => (
                          <button
                            key={g.name}
                            onClick={() => handleApplyCover(g.value)}
                            style={{ background: g.value }}
                            className={`h-8 rounded-xl text-[10px] font-bold text-white shadow-2xs hover:scale-102 active:scale-98 transition-all flex items-center justify-center border ${
                              coverColor === g.value
                                ? "ring-2 ring-orange-500 ring-offset-1 border-white"
                                : "border-transparent"
                            }`}
                          >
                            {g.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Section 4: Image Upload */}
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                        上傳本機圖片封面
                      </span>
                      <button
                        type="button"
                        onClick={() => coverFileInputRef.current?.click()}
                        className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-dashed border-slate-300 dark:border-slate-700"
                      >
                        <Upload className="w-3.5 h-3.5 text-orange-500" />
                        <span>挑選相片圖檔...</span>
                      </button>
                      <input
                        type="file"
                        ref={coverFileInputRef}
                        onChange={handleCoverFileUpload}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>

                    {/* Section 5: Clear Cover */}
                    {coverColor && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => {
                            setCoverColor("");
                            updateTask(task.id, { coverColor: "" });
                            setIsCoverModalOpen(false);
                          }}
                          className="w-full py-1.5 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl font-semibold transition-colors"
                        >
                          ✕ 移除當前封面
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

              {/* Action 3: Star / Important Toggle */}
              <div>
                <button
                  type="button"
                  onClick={handleToggleStar}
                  className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                    isStarred
                      ? "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Star
                      className={`w-4 h-4 ${
                        isStarred ? "fill-amber-500 text-amber-500" : "text-slate-400"
                      }`}
                    />
                    <span>重要性標記</span>
                  </span>
                  <span className="text-[11px] font-bold">
                    {isStarred ? "⭐ 重要" : "一般"}
                  </span>
                </button>
              </div>

              {/* Action 4: Optional Due Date / Event Range */}
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                  到期日 / 活動時段
                </label>
                <DateTimePicker
                  value={dueDate}
                  startDate={startDate}
                  isAllDay={isAllDay}
                  onChange={(dates) => {
                    setStartDate(dates.startDate || null);
                    setDueDate(dates.dueDate);
                    setIsAllDay(dates.isAllDay);
                    updateTask(task.id, {
                      startDate: dates.startDate || null,
                      dueDate: dates.dueDate,
                      isAllDay: dates.isAllDay,
                    });
                  }}
                  align="right"
                  placeholder="+ 設定到期日或活動時段"
                />
              </div>

              {/* Action 5: Tags */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  標籤管理
                </label>
                <div className="flex gap-1 mb-1.5">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="輸入標籤按 Enter..."
                    className="flex-1 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>

                <div className="flex flex-wrap gap-1">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium flex items-center gap-1"
                    >
                      #{t}
                      <button
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-rose-500 text-slate-400 text-xs"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Delete / Archive */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                {isDeleteConfirm ? (
                  <div className="space-y-1.5">
                    <span className="text-xs text-rose-600 font-bold block">確定刪除此卡片？</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => {
                          deleteTask(task.id);
                          setEditingTaskId(null);
                        }}
                        className="flex-1 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold"
                      >
                        確認刪除
                      </button>
                      <button
                        onClick={() => setIsDeleteConfirm(false)}
                        className="px-2 py-1.5 rounded-lg bg-slate-100 text-xs"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsDeleteConfirm(true)}
                    className="w-full py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>刪除卡片</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
