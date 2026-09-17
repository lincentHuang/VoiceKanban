import React from "react";
import { GripVertical, SmilePlus, Pencil, CheckSquare } from "lucide-react";
import { Column, Task, getColumnColorConfig } from "@/core/types/task";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import { ColumnActionMenu } from "../ColumnActionMenu";
import { ColumnIconPicker } from "../ColumnIconPicker";

interface Props {
  column: Column;
  tasks: Task[];
  isEditingTitle: boolean;
  titleInput: string;
  titleInputRef: React.RefObject<HTMLInputElement | null>;
  onTitleInputChange: (val: string) => void;
  onTitleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSaveTitle: () => void;
  onStartEditTitle: () => void;
  onStartAddCard: () => void;
  /** False on phones and for read-only viewers: no grip icon, no drag affordance. */
  isDragEnabled: boolean;
  attributes: any;
  listeners: any;
}

export const KanbanColumnHeader: React.FC<Props> = ({
  column, tasks, isEditingTitle, titleInput, titleInputRef, onTitleInputChange,
  onTitleKeyDown, onSaveTitle, onStartEditTitle, onStartAddCard, isDragEnabled, attributes, listeners,
}) => {
const isMultiSelectMode = useKanbanStore((s) => s.isMultiSelectMode);
  const selectedTaskIds = useKanbanStore((s) => s.selectedTaskIds);
  const toggleTaskSelection = useKanbanStore((s) => s.toggleTaskSelection);
  const updateColumnInActiveBoard = useKanbanStore((s) => s.updateColumnInActiveBoard);
  const colorConfig = getColumnColorConfig(column.color);
  const uncompleted = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);

  const handleSelectAll = () => {
    tasks.forEach((t) => { if (!selectedTaskIds.includes(t.id)) toggleTaskSelection(t.id); });
  };

  return (
    <div {...attributes} {...listeners} data-column-header="true" className={`flex items-center justify-between px-1 py-1 shrink-0 select-none [-webkit-touch-callout:none] transition-colors rounded-xl ${isDragEnabled ? "cursor-grab active:cursor-grabbing hover:bg-black/5 dark:hover:bg-white/5" : ""}`} title={isDragEnabled ? "按住標頭可拖曳重新排列欄位順序" : undefined}>
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        {isDragEnabled && (
          <GripVertical className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover/col:text-slate-600 dark:group-hover/col:text-slate-300 transition-colors shrink-0 -ml-0.5" />
        )}
        <ColumnIconPicker value={column.icon || ""} onChange={(icon) => updateColumnInActiveBoard(column.id, undefined, icon)} variant="ghost">
          <span className="text-base shrink-0 cursor-pointer hover:scale-115 active:scale-95 transition-transform p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center" title="點擊更換欄位圖示">
            {column.icon ? column.icon : <SmilePlus className="w-3.5 h-3.5 text-slate-400" />}
          </span>
        </ColumnIconPicker>

        {isEditingTitle ? (
          <div className="flex-1 min-w-0 pr-1" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
            <input ref={titleInputRef} type="text" value={titleInput} onChange={(e) => onTitleInputChange(e.target.value)} onKeyDown={onTitleKeyDown} onBlur={onSaveTitle} className="w-full font-bold text-slate-800 dark:text-slate-100 text-sm tracking-tight px-1.5 py-0.5 rounded-lg border-2 border-orange-500 bg-white/95 dark:bg-slate-800/95 shadow-sm focus:outline-none min-w-0" maxLength={40} placeholder="欄位名稱" />
          </div>
        ) : (
          <div className="flex items-center gap-1 min-w-0 group/title cursor-pointer overflow-hidden" onDoubleClick={(e) => { e.stopPropagation(); onStartEditTitle(); }} title="雙擊直接編輯名稱">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-tight truncate hover:text-orange-600 dark:hover:text-orange-400 transition-colors">{column.title}</h3>
            <button type="button" onClick={(e) => { e.stopPropagation(); onStartEditTitle(); }} onPointerDown={(e) => e.stopPropagation()} className="opacity-0 group-hover/col:opacity-70 hover:!opacity-100 p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all rounded shrink-0 cursor-pointer" title="修改名稱">
              <Pencil className="w-3 h-3" />
            </button>
          </div>
        )}

        <span className={`ml-0.5 px-2 py-0.5 rounded-full font-bold text-xs shadow-2xs shrink-0 ${colorConfig.badgeClass}`} title={completed.length > 0 ? `待處理: ${uncompleted.length} / 已完成: ${completed.length}` : `共 ${uncompleted.length} 項`}>
          {uncompleted.length}
        </span>
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-1" onPointerDown={(e) => e.stopPropagation()}>
        {isMultiSelectMode && tasks.length > 0 && (
          <button onClick={handleSelectAll} className="p-1 rounded-lg bg-white/70 dark:bg-slate-800/80 hover:bg-orange-50 text-slate-500 hover:text-orange-600 transition-colors cursor-pointer border border-slate-200/50 dark:border-slate-700/50" title="全選此欄位">
            <CheckSquare className="w-3.5 h-3.5" />
          </button>
        )}
        <ColumnActionMenu column={column} onAddTask={onStartAddCard} onStartRename={onStartEditTitle} />
      </div>
    </div>
  );
};
