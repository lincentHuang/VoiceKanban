"use client";

import React, { useState, useEffect, useRef } from "react";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { ColumnId, CoverAspectRatio, TRELLO_COLUMN_COLORS, TaskAttachment } from "@/core/types/task";
import { getDueDateStatus, isoToDateTimeLocal, dateTimeLocalToIso } from "@/core/utils/dateUtils";
import { MarkdownEditor } from "@/features/editor";
import { DateTimePicker } from "@/components/common/DateTimePicker";
import { useEscapeKey } from "@/core/hooks/useEscapeKey";
import { compressImage } from "@/core/utils/imageUtils";
import { uploadFile } from "@/core/utils/uploadUtils";
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
  Eye,
  Download,
  ExternalLink,
  Columns3,
  Loader2,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { SortableChecklistItem } from "./SortableChecklistItem";
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
    expandTaskToColumn,
    toggleTaskComplete,
    addChecklistItem,
    updateChecklistItem,
    toggleChecklistItem,
    removeChecklistItem,
    reorderChecklistItems,
    moveChecklistItem,
    addAttachment,
    removeAttachment,
    userSession,
  } = useKanbanStore();

  const checklistSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 500,
        tolerance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 500,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

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
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isMovePopoverOpen, setIsMovePopoverOpen] = useState(false);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const [isExpandConfirm, setIsExpandConfirm] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Mobile & Drawer Swipe-down States
  const [isMobile, setIsMobile] = useState(false);
  const [drawerDragY, setDrawerDragY] = useState(0);
  const [isDraggingDrawer, setIsDraggingDrawer] = useState(false);
  const [isClosingDrawer, setIsClosingDrawer] = useState(false);

  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const attachmentFileInputRef = useRef<HTMLInputElement>(null);
  const titleTextareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);
  const touchStartYRef = useRef<number>(0);
  const touchStartTimeRef = useRef<number>(0);
  const isPullingFromTopRef = useRef<boolean>(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const adjustTitleHeight = () => {
    if (titleTextareaRef.current) {
      titleTextareaRef.current.style.height = "auto";
      titleTextareaRef.current.style.height = `${titleTextareaRef.current.scrollHeight}px`;
    }
  };

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
      setIsExpandConfirm(false);
      setSaveToast(false);
      setIsMovePopoverOpen(false);
      setIsCoverModalOpen(false);
      setDrawerDragY(0);
      setIsDraggingDrawer(false);
      setIsClosingDrawer(false);
      setTimeout(adjustTitleHeight, 0);
    }
  }, [task]);

  const handleCloseDrawer = () => {
    if (isMobile) {
      setIsClosingDrawer(true);
      setTimeout(() => {
        setEditingTaskId(null);
      }, 200);
    } else {
      setEditingTaskId(null);
    }
  };

  // Touch handlers for pull-to-close drawer gesture
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    const clientY = e.touches[0].clientY;
    touchStartYRef.current = clientY;
    touchStartTimeRef.current = Date.now();

    // Check if scroll is at the very top
    const scrollTop = scrollContentRef.current ? scrollContentRef.current.scrollTop : 0;
    if (scrollTop <= 2) {
      isPullingFromTopRef.current = true;
    } else {
      isPullingFromTopRef.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || !isPullingFromTopRef.current) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartYRef.current;

    // Only allow downward drag
    if (deltaY > 0) {
      setIsDraggingDrawer(true);
      // Add slight resistance to dragging
      const dampedY = deltaY < 150 ? deltaY : 150 + (deltaY - 150) * 0.6;
      setDrawerDragY(dampedY);
    } else {
      setDrawerDragY(0);
      setIsDraggingDrawer(false);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isMobile || !isPullingFromTopRef.current) return;
    isPullingFromTopRef.current = false;
    setIsDraggingDrawer(false);

    const touchDuration = Date.now() - touchStartTimeRef.current;
    const velocity = drawerDragY / Math.max(touchDuration, 1);

    // If dragged more than 90px or fast swipe down
    if (drawerDragY > 90 || (drawerDragY > 40 && velocity > 0.4)) {
      if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate(15);
        } catch {}
      }
      handleCloseDrawer();
    } else {
      // Snap back to 0
      setDrawerDragY(0);
    }
  };

  useEscapeKey(() => {
    if (isCoverModalOpen) {
      setIsCoverModalOpen(false);
    } else if (isMovePopoverOpen) {
      setIsMovePopoverOpen(false);
    } else if (isExpandConfirm) {
      setIsExpandConfirm(false);
    } else if (editingTaskId) {
      handleCloseDrawer();
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
      completed: task.completed,
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

  const handleChecklistDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !task || !task.checklist) return;

    const oldIndex = task.checklist.findIndex((item) => item.id === active.id);
    const newIndex = task.checklist.findIndex((item) => item.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newChecklist = arrayMove(task.checklist, oldIndex, newIndex);
      reorderChecklistItems(task.id, newChecklist);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 25MB limit
    if (file.size > 25 * 1024 * 1024) {
      setAttachmentError("檔案大小超過 25MB 限制！請選擇小於 25MB 的檔案。");
      setTimeout(() => setAttachmentError(null), 3500);
      e.target.value = "";
      return;
    }

    try {
      setIsUploadingAttachment(true);
      const res = await uploadFile(file, file.name, "attachments");
      const newAttachment: TaskAttachment = {
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: res.name,
        size: res.size,
        type: res.type,
        url: res.url,
        createdAt: new Date().toISOString(),
      };
      addAttachment(task.id, newAttachment);
    } catch (err: any) {
      console.error("Attachment upload error:", err);
      setAttachmentError("檔案上傳失敗，請稍後重試");
      setTimeout(() => setAttachmentError(null), 3500);
    } finally {
      setIsUploadingAttachment(false);
      e.target.value = "";
    }
  };

  const handleInsertAttachmentToDescription = (att: TaskAttachment) => {
    const imgMarkdown = `\n![${att.name}](${att.url})\n`;
    const updated = description ? `${description}\n${imgMarkdown}` : imgMarkdown;
    setDescription(updated);
    updateTask(task.id, { description: updated });
  };

  const handleSave = (customDescOrEvent?: string | React.FormEvent) => {
    if (typeof customDescOrEvent === "object" && customDescOrEvent !== null && "preventDefault" in customDescOrEvent) {
      customDescOrEvent.preventDefault();
    }
    if (!title.trim()) return;

    const finalDescription = typeof customDescOrEvent === "string" ? customDescOrEvent : description;

    updateTask(task.id, {
      title: title.trim(),
      description: finalDescription.trim(),
      boardId,
      columnId,
      isStarred,
      tags,
      coverColor,
      coverAspectRatio,
      startDate: startDate || null,
      dueDate: dueDate || null,
      isAllDay,
      completed: task.completed,
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
      } catch { }
    }
    toggleTaskComplete(task.id);
  };

  const handleExpandToColumn = () => {
    if (!task) return;
    try {
      confetti({
        particleCount: 55,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#6366F1", "#3B82F6", "#F97316", "#10B981"],
      });
    } catch { }
    expandTaskToColumn(task.id);
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

  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsUploadingCover(true);
        const res = await uploadFile(file, file.name, "covers");
        handleApplyCover(res.url, "banner");
      } catch (err) {
        console.error("Cover upload error:", err);
      } finally {
        setIsUploadingCover(false);
        e.target.value = "";
      }
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
      onClick={handleCloseDrawer}
      className={`fixed inset-0 z-50 flex ${
        isMobile ? "items-end" : "items-center"
      } justify-center ${
        isMobile ? "p-0" : "p-3 sm:p-4"
      } bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-200 overflow-hidden`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: isMobile
            ? isClosingDrawer
              ? "translateY(100%)"
              : `translateY(${drawerDragY}px)`
            : undefined,
          transition: isDraggingDrawer
            ? "none"
            : "transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className={`w-full ${
          isMobile
            ? "max-h-[88dvh] h-[88dvh] rounded-t-[2rem] rounded-b-none border-t border-x border-white/80 dark:border-slate-800"
            : "max-w-4xl max-h-[calc(100dvh-2rem)] sm:max-h-[90vh] rounded-3xl border border-white/80 dark:border-slate-800"
        } flex flex-col backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 shadow-2xl relative text-slate-800 dark:text-slate-100 overflow-hidden`}
      >
        {/* Mobile Drag Handle */}
        {isMobile && (
          <div className="w-full flex items-center justify-center pt-2.5 pb-1 shrink-0 cursor-grab active:cursor-grabbing touch-none select-none">
            <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
          </div>
        )}

        {/* Top Cover Banner */}
        {coverColor && (
          <div
            style={{
              background: isImageCover ? `url(${coverColor}) center/cover no-repeat` : coverColor,
              backgroundColor: !isImageCover && !coverColor.startsWith("linear") ? coverColor : undefined,
            }}
            className={`w-full ${getModalCoverHeightClass()} ${
              isMobile ? "" : "rounded-t-3xl"
            } relative flex items-end justify-between px-4 pb-3 pt-6 group/cover transition-all duration-300 shadow-xs shrink-0`}
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
        <div ref={scrollContentRef} className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-7 space-y-5">
          {/* Header Bar */}
          <div className="space-y-2">
            {/* Top Toolbar Row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                {/* Complete Toggle (Direct Large Icon) */}
                <button
                  type="button"
                  onClick={handleToggleComplete}
                  className="p-1 rounded-lg transition-transform duration-150 hover:scale-115 active:scale-90 focus:outline-none"
                  title={task.completed ? "標記為未完成" : "標記為已完成"}
                  aria-label={task.completed ? "標記為未完成" : "標記為已完成"}
                >
                  <CheckCircle2
                    className={`w-6 h-6 transition-all duration-200 ${task.completed
                      ? "text-emerald-500 fill-emerald-100 dark:fill-emerald-950/60 drop-shadow-[0_2px_8px_rgba(16,185,129,0.35)] scale-105"
                      : "text-slate-300 dark:text-slate-600 hover:text-emerald-500 hover:fill-emerald-50 dark:hover:fill-emerald-950/30"
                      }`}
                  />
                </button>

                {/* Star Important Toggle (Direct Large Icon) */}
                <button
                  type="button"
                  onClick={handleToggleStar}
                  className="p-1 rounded-lg transition-transform duration-150 hover:scale-115 active:scale-90 focus:outline-none"
                  title={isStarred ? "取消重要標記" : "標記為重要事項"}
                  aria-label={isStarred ? "取消重要標記" : "標記為重要事項"}
                >
                  <Star
                    className={`w-6 h-6 transition-all duration-200 ${isStarred
                      ? "fill-amber-400 text-amber-500 drop-shadow-[0_2px_8px_rgba(245,158,11,0.45)] scale-105"
                      : "text-slate-300 dark:text-slate-600 hover:text-amber-400 hover:fill-amber-100 dark:hover:fill-amber-950/30"
                      }`}
                  />
                </button>


              </div>

              {/* Top Right Controls (Frameless Large Icons) */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Move Card Popover Button (Direct Large Icon) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMovePopoverOpen(!isMovePopoverOpen);
                      setIsCoverModalOpen(false);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-blue-500 transition-transform duration-150 hover:scale-115 active:scale-90 focus:outline-none"
                    title="移動卡片"
                    aria-label="移動卡片"
                  >
                    <MoveRight className="w-6 h-6" />
                  </button>

                  {isMovePopoverOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs sm:bg-transparent"
                        onClick={() => setIsMovePopoverOpen(false)}
                      />
                      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:translate-y-0 sm:inset-auto sm:right-0 sm:top-full mt-2 w-auto sm:w-56 max-h-[80vh] sm:max-h-none overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in space-y-1">
                        <div className="flex items-center justify-between pb-1 px-1 border-b border-slate-100 dark:border-slate-800 sm:border-0 sm:pb-0">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 sm:text-[10px] sm:text-slate-400">選取目標欄位</span>
                          <button
                            onClick={() => setIsMovePopoverOpen(false)}
                            className="text-slate-400 hover:text-slate-600 p-1 sm:hidden"
                          >
                            ✕
                          </button>
                        </div>
                        {allTargetColumns.map((col) => (
                          <button
                            key={col.id}
                            type="button"
                            onClick={() => handleMoveColumn(col.id)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-2 transition-colors ${columnId === col.id
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

                {/* Cover Setting Popover Button (Direct Large Icon) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCoverModalOpen(!isCoverModalOpen);
                      setIsMovePopoverOpen(false);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-orange-500 transition-transform duration-150 hover:scale-115 active:scale-90 focus:outline-none"
                    title="封面設定 (比例/色彩/圖片)"
                    aria-label="封面設定"
                  >
                    <Palette
                      className={`w-6 h-6 transition-colors ${coverColor ? "text-orange-500 drop-shadow-[0_2px_8px_rgba(249,115,22,0.35)]" : ""
                        }`}
                    />
                  </button>

                  {/* Comprehensive Cover Picker Popover */}
                  {isCoverModalOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs sm:bg-transparent"
                        onClick={() => setIsCoverModalOpen(false)}
                      />
                      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:translate-y-0 sm:inset-auto sm:right-0 sm:top-full mt-2 w-auto sm:w-80 max-w-[calc(100vw-2rem)] max-h-[85vh] sm:max-h-[380px] overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-3xl shadow-2xl p-4 z-50 animate-in fade-in space-y-3.5">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-100">設定卡片封面與比例</span>
                          <button
                            onClick={() => setIsCoverModalOpen(false)}
                            className="text-slate-400 hover:text-slate-600 p-1"
                          >
                            ✕
                          </button>
                        </div>

                        {/* Section 1: Aspect Ratio & Orientation */}
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
                                className={`p-2 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 border transition-all ${coverAspectRatio === ratio.id
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
                                className={`p-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 border transition-all ${coverAspectRatio === ratio.id
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

                        {/* Section 2: Solid Colors */}
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
                                className={`w-full h-7 rounded-xl shadow-2xs hover:scale-105 active:scale-95 transition-all border ${coverColor === c.hex
                                  ? "border-2 border-slate-900 dark:border-white shadow-sm"
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
                                className={`h-8 rounded-xl text-[10px] font-bold text-white shadow-2xs hover:scale-102 active:scale-98 transition-all flex items-center justify-center border ${coverColor === g.value
                                  ? "border-2 border-slate-900 dark:border-white shadow-sm"
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
                            disabled={isUploadingCover}
                            onClick={() => coverFileInputRef.current?.click()}
                            className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-300/80 dark:border-slate-700 hover:border-orange-400 disabled:opacity-50"
                          >
                            {isUploadingCover ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" />
                                <span>上傳至 R2 雲端中...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-3.5 h-3.5 text-orange-500" />
                                <span>挑選相片圖檔...</span>
                              </>
                            )}
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



                {/* Expand to Column Button (Direct Large Icon) */}
                <button
                  type="button"
                  onClick={() => {
                    setIsExpandConfirm(true);
                    setIsCoverModalOpen(false);
                    setIsMovePopoverOpen(false);
                    setIsDeleteConfirm(false);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-transform duration-150 hover:scale-115 active:scale-90 focus:outline-none"
                  title="展開為狀態欄位"
                  aria-label="展開為狀態欄位"
                >
                  <Columns3 className="w-6 h-6" />
                </button>

                {/* Delete Task Popover Button (Direct Large Icon in Top Toolbar) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDeleteConfirm(!isDeleteConfirm);
                      setIsCoverModalOpen(false);
                      setIsMovePopoverOpen(false);
                      setIsExpandConfirm(false);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-transform duration-150 hover:scale-115 active:scale-90 focus:outline-none"
                    title="刪除卡片"
                    aria-label="刪除卡片"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>

                  {isDeleteConfirm && (
                    <>
                      <div
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs sm:bg-transparent"
                        onClick={() => setIsDeleteConfirm(false)}
                      />
                      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:translate-y-0 sm:inset-auto sm:right-0 sm:top-full mt-2 w-auto sm:w-64 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-2xl shadow-2xl p-3.5 z-50 animate-in fade-in space-y-2.5">
                        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs">
                          <Trash2 className="w-4 h-4" />
                          <span>確定刪除此任務？</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          刪除後將無法復原「{title || task.title}」及其所有待辦紀錄。
                        </p>
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              deleteTask(task.id);
                              setEditingTaskId(null);
                            }}
                            className="flex-1 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs"
                          >
                            確認刪除
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsDeleteConfirm(false)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 transition-colors"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={handleCloseDrawer}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-transform duration-150 hover:scale-115 active:scale-90 focus:outline-none"
                  title="關閉"
                  aria-label="關閉"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Second Row: Full Width Multi-line Task Title */}
            <div className="w-full pt-1">
              <textarea
                ref={titleTextareaRef}
                rows={1}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  adjustTitleHeight();
                }}
                onBlur={() => handleSave()}
                className="w-full text-xl sm:text-2xl font-bold bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-orange-500 focus:outline-none py-1 transition-colors resize-none overflow-hidden leading-snug text-slate-800 dark:text-slate-100 block"
                placeholder="任務標題..."
              />
            </div>

            {/* Third Row: Due Date / Event Range directly below title */}
            <div className="pt-0.5">
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
                align="left"
                placeholder="+ 設定到期日或活動時段"
              />
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
                      className={`h-full transition-all duration-300 ${progressPercent === 100 ? "bg-emerald-500" : "bg-orange-500"
                        }`}
                    />
                  </div>
                )}

                {/* Checklist Items (支援 500ms 長按拖曳與 ▲ / ▼ 上下快速移動) */}
                {task.checklist && task.checklist.length > 0 && (
                  <DndContext
                    sensors={checklistSensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleChecklistDragEnd}
                  >
                    <SortableContext
                      items={task.checklist.map((item) => item.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-1.5 mb-3">
                        {task.checklist.map((item) => (
                          <SortableChecklistItem
                            key={item.id}
                            item={item}
                            taskId={task.id}
                            isEditing={editingChecklistId === item.id}
                            editingText={editingChecklistText}
                            onStartEdit={handleStartEditChecklist}
                            onSaveEdit={handleSaveEditChecklist}
                            onCancelEdit={handleCancelEditChecklist}
                            onEditTextChange={setEditingChecklistText}
                            onToggle={toggleChecklistItem}
                            onRemove={removeChecklistItem}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}

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

              {/* 2. Description (說明 - Markdown Editor) */}
              <div>
                <MarkdownEditor
                  value={description}
                  onChange={(val) => {
                    setDescription(val);
                    updateTask(task.id, { description: val });
                  }}
                  onSave={(val) => {
                    setDescription(val);
                    handleSave(val);
                  }}
                  title="說明 (Markdown & 圖片)"
                  placeholder="輸入詳細說明，支援 Markdown 粗體、連結、清單，並可點擊 🖼️ 插入圖片或直接貼上截圖..."
                />
              </div>


            </div>

            {/* Right Action Sidebar */}
            <div className="lg:col-span-5 space-y-4">

              {/* Action: Tags */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    標籤管理
                  </h4>
                </div>
                <div className="flex gap-1 mb-1.5">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.nativeEvent.isComposing || e.key === "Process") return;
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

              {/* Attachments Section (附件檔案 - 支援圖片/資料，最大不能超過10MB) */}
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
                    disabled={isUploadingAttachment}
                    onClick={() => attachmentFileInputRef.current?.click()}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    {isUploadingAttachment ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" />
                        <span>上傳中...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 text-orange-500" />
                        <span>上傳附件</span>
                      </>
                    )}
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
                    className="p-3 text-center rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 text-slate-400 text-xs cursor-pointer hover:border-orange-400 hover:bg-slate-50 transition-colors"
                  >
                    尚無附件檔案，點擊此處上傳圖片或資料檔案（最大 10MB）
                  </div>
                )}
              </div>

              {/* Activity & Comments (留言與活動紀錄) */}
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

              {/* Actions: Expand to Column */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                {/* 1. Expand to Column */}
                {isExpandConfirm ? (
                  <div className="p-3 rounded-2xl bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 space-y-2 animate-in fade-in">
                    <div className="flex items-start gap-2">
                      <Columns3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs text-indigo-900 dark:text-indigo-200 font-bold block">
                          確定將此任務展開為獨立狀態欄位？
                        </span>
                        <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80 mt-0.5 leading-relaxed">
                          {totalItems > 0
                            ? `將以「${title || task.title}」建立全新狀態欄，並將 ${totalItems} 個子待辦轉為獨立任務卡片。`
                            : `將以「${title || task.title}」在看板中建立全新獨立狀態欄位。`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleExpandToColumn}
                        className="flex-1 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-xs"
                      >
                        🚀 確認展開
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsExpandConfirm(false)}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsExpandConfirm(true)}
                    className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 hover:bg-indigo-100/90 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/50 border border-indigo-200/70 dark:border-indigo-800/60 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="將卡片升級為狀態欄位，子待辦化為獨立卡片"
                  >
                    <Columns3 className="w-3.5 h-3.5" />
                    <span>🚀 展開為狀態欄位</span>
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
