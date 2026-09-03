"use client";

import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  Modifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { useEscapeKey } from "@/core/hooks/useEscapeKey";
import { Column } from "@/core/types/task";
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Check,
  SlidersHorizontal,
  GripVertical,
  SmilePlus,
  Ban,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/core/utils/cn";

const EMOJI_CATEGORIES = [
  {
    name: "常用狀態",
    emojis: ["✨", "📥", "📋", "⚡", "⏳", "✅", "🧪", "🎨", "🚀", "💡", "📌", "🔍", "🔥", "🎯", "📦"],
  },
  {
    name: "專案與管理",
    emojis: ["💼", "🛠️", "🚩", "💬", "📊", "📝", "🔔", "🌟", "🚧", "🏆", "☕", "📅", "🏷️", "🔒", "📈", "🤖"],
  },
];

interface ColumnIconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  size?: "sm" | "md";
}

const ColumnIconPicker: React.FC<ColumnIconPickerProps> = ({
  value,
  onChange,
  size = "md",
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center justify-center rounded-xl border transition-all cursor-pointer select-none shrink-0 focus:outline-none focus:border-orange-500",
            size === "sm" ? "w-8 h-8 text-sm" : "w-9 h-9 text-base",
            value
              ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-500 hover:bg-orange-50/40 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100"
              : "bg-slate-100/90 dark:bg-slate-800/60 border-dashed border-slate-300 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:border-slate-400"
          )}
          title={value ? `目前圖示：${value} (點擊更換)` : "選擇圖示 (點擊開啟)"}
          aria-label="選擇欄位圖示"
        >
          {value ? (
            <span>{value}</span>
          ) : (
            <SmilePlus className="w-4 h-4 opacity-70" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-64 p-3 shadow-2xl rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl z-[9999]"
      >
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
          <span className="font-bold text-slate-800 dark:text-slate-200">選擇欄位圖示</span>
          {value ? (
            <span className="text-[11px] text-slate-400">目前：{value}</span>
          ) : (
            <span className="text-[11px] text-slate-400">目前：無圖示</span>
          )}
        </div>

        {/* Option: No Icon */}
        <button
          type="button"
          onClick={() => {
            onChange("");
            setOpen(false);
          }}
          className={cn(
            "w-full flex items-center justify-center gap-1.5 py-1.5 px-2 mb-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer",
            !value
              ? "bg-orange-50 dark:bg-orange-950/50 border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 font-bold"
              : "bg-slate-50 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          )}
        >
          <Ban className="w-3.5 h-3.5" />
          <span>不使用圖示 (純文字)</span>
        </button>

        {/* Emoji Grid */}
        <div className="space-y-2.5 max-h-48 overflow-y-auto custom-scrollbar pr-0.5">
          {EMOJI_CATEGORIES.map((cat) => (
            <div key={cat.name}>
              <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-1 px-0.5">
                {cat.name}
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {cat.emojis.map((em) => {
                  const isSelected = value === em;
                  return (
                    <button
                      key={em}
                      type="button"
                      onClick={() => {
                        onChange(em);
                        setOpen(false);
                      }}
                      className={cn(
                        "w-8 h-8 rounded-lg text-base flex items-center justify-center transition-transform hover:scale-115 active:scale-95 cursor-pointer",
                        isSelected
                          ? "bg-orange-100 dark:bg-orange-950/60 border-2 border-orange-500 font-bold"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800"
                      )}
                    >
                      {em}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Sortable Row Component for Drag and Drop
interface SortableColumnRowProps {
  col: Column;
  isEditing: boolean;
  editTitle: string;
  editIcon: string;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditTitleChange: (val: string) => void;
  onEditIconChange: (val: string) => void;
  onDelete: () => void;
  canDelete: boolean;
}

const SortableColumnRow: React.FC<SortableColumnRowProps> = ({
  col,
  isEditing,
  editTitle,
  editIcon,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditTitleChange,
  onEditIconChange,
  onDelete,
  canDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: col.id,
    disabled: isEditing,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    position: "relative",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border select-none transition-all duration-75",
        isDragging
          ? "scale-105 rotate-1 shadow-2xl rounded-2xl border-2 border-orange-500 bg-white/98 dark:bg-slate-800/98 cursor-grabbing z-50 opacity-100"
          : "bg-slate-50/80 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100/70 dark:hover:bg-slate-800/80"
      )}
    >
      {/* Drag Handle */}
      {!isEditing && (
        <div
          {...attributes}
          {...listeners}
          className="p-1 -ml-1 mr-1 text-slate-400 hover:text-orange-500 cursor-grab active:cursor-grabbing rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors shrink-0 touch-none"
          title="按住拖曳調整欄位順序"
        >
          <GripVertical className="w-4 h-4" />
        </div>
      )}

      {isEditing ? (
        <div className="flex items-center gap-2 flex-1 mr-1 min-w-0">
          <ColumnIconPicker
            value={editIcon}
            onChange={onEditIconChange}
            size="sm"
          />
          <input
            type="text"
            value={editTitle}
            onChange={(e) => onEditTitleChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSaveEdit();
              if (e.key === "Escape") onCancelEdit();
            }}
            placeholder="欄位名稱"
            className="flex-1 min-w-0 text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 font-semibold focus:outline-none focus:border-orange-500"
            autoFocus
          />
          <button
            onClick={onSaveEdit}
            className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-2xs shrink-0 cursor-pointer"
            title="儲存"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onCancelEdit}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0 cursor-pointer"
            title="取消"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {col.icon ? (
            <span className="text-lg shrink-0 select-none">{col.icon}</span>
          ) : (
            <span className="w-6 h-6 rounded-lg bg-slate-200/60 dark:bg-slate-700/60 flex items-center justify-center text-[10px] font-mono font-bold text-slate-400 shrink-0 select-none">
              Aa
            </span>
          )}
          <div className="min-w-0 flex items-center gap-1.5">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
              {col.title}
            </span>
            {col.isCustom && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-semibold shrink-0">
                自訂
              </span>
            )}
          </div>
        </div>
      )}

      {!isEditing && (
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button
            onClick={onStartEdit}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="編輯名稱與圖示"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          {canDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="刪除此欄位 (內部任務將自動移轉)"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const restrictToVerticalAxis: Modifier = ({ transform }) => {
  return {
    ...transform,
    x: 0,
  };
};

export const ColumnManagerModal: React.FC = () => {
  const {
    isColumnManagerOpen,
    setIsColumnManagerOpen,
    getActiveBoardColumns,
    deleteColumnFromActiveBoard,
    reorderBoardColumns,
    boards,
    activeBoardId,
  } = useKanbanStore();

  useEscapeKey(() => {
    if (isColumnManagerOpen) {
      setIsColumnManagerOpen(false);
    }
  }, isColumnManagerOpen);

  const activeBoard = boards.find((b) => b.id === activeBoardId);

  // Local staged columns: changes will only apply to board when user clicks "完成"
  const [localColumns, setLocalColumns] = React.useState<Column[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newIcon, setNewIcon] = useState("✨");
  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editIcon, setEditIcon] = useState("✨");

  // Sync initial columns when modal opens
  React.useEffect(() => {
    if (isColumnManagerOpen) {
      setLocalColumns(getActiveBoardColumns());
      setEditingColId(null);
      setNewTitle("");
      setNewIcon("✨");
    }
  }, [isColumnManagerOpen, activeBoardId]);

  // Dnd sensors
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    })
  );

  if (!isColumnManagerOpen) return null;

  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newCol: Column = {
      id: `col-${Date.now()}`,
      title: newTitle.trim(),
      icon: newIcon,
      color: "#3b82f6",
      isCustom: true,
    };
    setLocalColumns((prev) => [...prev, newCol]);
    setNewTitle("");
    setNewIcon("✨");
  };

  const handleStartEdit = (colId: string, title: string, icon: string) => {
    setEditingColId(colId);
    setEditTitle(title);
    setEditIcon(icon || "");
  };

  const handleSaveEdit = (colId: string) => {
    if (!editTitle.trim()) return;
    setLocalColumns((prev) =>
      prev.map((c) =>
        c.id === colId ? { ...c, title: editTitle.trim(), icon: editIcon } : c
      )
    );
    setEditingColId(null);
  };

  const handleDeleteColumn = (colId: string) => {
    if (localColumns.length <= 1) return;
    setLocalColumns((prev) => prev.filter((c) => c.id !== colId));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localColumns.findIndex((c) => c.id === active.id);
      const newIndex = localColumns.findIndex((c) => c.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(localColumns, oldIndex, newIndex);
        setLocalColumns(reordered);
      }
    }
  };

  // Only apply to the board when clicking "完成"
  const handleConfirmFinish = () => {
    const currentStoreCols = getActiveBoardColumns();
    const deletedColIds = currentStoreCols
      .map((c) => c.id)
      .filter((id) => !localColumns.some((lc) => lc.id === id));

    // Handle deleted columns task migration
    deletedColIds.forEach((id) => {
      deleteColumnFromActiveBoard(id);
    });

    // Commit final column order and items
    reorderBoardColumns(activeBoardId, localColumns);
    setIsColumnManagerOpen(false);
  };

  return (
    <div
      onClick={() => setIsColumnManagerOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-200 overflow-hidden"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[calc(100dvh-2rem)] sm:max-h-[90vh] flex flex-col backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 border border-white/80 dark:border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 relative overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                狀態流程管理 (Workflow)
              </h3>
              <p className="text-xs text-slate-500">
                看板「{activeBoard?.name}」的欄位拖曳排序、增減與命名
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsColumnManagerOpen(false)}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar my-4 pr-1 space-y-4">
          {/* Existing Columns List (Drag & Drop Sortable) */}
          <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              現有狀態欄位 ({localColumns.length})
            </label>
            <span className="text-[11px] text-slate-400">
              按住左側 ⋮⋮ 拖曳調整順序 (點擊完成後生效)
            </span>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localColumns.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {localColumns.map((col) => (
                  <SortableColumnRow
                    key={col.id}
                    col={col}
                    isEditing={editingColId === col.id}
                    editTitle={editTitle}
                    editIcon={editIcon}
                    onStartEdit={() => handleStartEdit(col.id, col.title, col.icon)}
                    onSaveEdit={() => handleSaveEdit(col.id)}
                    onCancelEdit={() => setEditingColId(null)}
                    onEditTitleChange={setEditTitle}
                    onEditIconChange={setEditIcon}
                    onDelete={() => handleDeleteColumn(col.id)}
                    canDelete={localColumns.length > 1}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Add New Column Form */}
        <form onSubmit={handleAddColumn} className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
            + 新增自訂狀態欄位
          </label>

          <div className="flex items-center gap-2">
            <ColumnIconPicker
              value={newIcon}
              onChange={setNewIcon}
              size="md"
            />

            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="輸入新欄位名稱 (例如：測試驗收、設計審查...)"
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium focus:outline-none focus:border-orange-500"
            />

            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="px-4 py-2 rounded-xl bg-base44-orange hover:bg-base44-orangeHover text-white text-xs font-bold shadow-xs disabled:opacity-50 transition-all cursor-pointer"
            >
              新增
            </button>
          </div>
        </form>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsColumnManagerOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleConfirmFinish}
            className="px-5 py-2 rounded-xl bg-base44-orange hover:bg-base44-orangeHover text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
