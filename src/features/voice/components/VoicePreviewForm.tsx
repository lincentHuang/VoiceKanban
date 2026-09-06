import React from "react";
import { Volume2, Layers, Flag, Calendar, Tag, X } from "lucide-react";
import { Board, ColumnId, Priority, DEFAULT_COLUMNS } from "@/core/types/task";
import { VoiceExtractResult } from "@/core/types/voice";
import { DateTimePicker } from "@/components/common/DateTimePicker";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface VoicePreviewFormProps {
  extractedTask: VoiceExtractResult | null;
  editTitle: string;
  editBoardId: string;
  editColumnId: ColumnId;
  editPriority: Priority;
  editDueDate: string;
  editTags: string[];
  tagInput: string;
  boards: Board[];
  onTitleChange: (val: string) => void;
  onBoardChange: (val: string) => void;
  onColumnChange: (val: ColumnId) => void;
  onPriorityChange: (val: Priority) => void;
  onDueDateChange: (val: string) => void;
  onTagInputChange: (val: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
}

export const VoicePreviewForm: React.FC<VoicePreviewFormProps> = ({
  extractedTask, editTitle, editBoardId, editColumnId, editPriority, editDueDate,
  editTags, tagInput, boards, onTitleChange, onBoardChange, onColumnChange,
  onPriorityChange, onDueDateChange, onTagInputChange, onAddTag, onRemoveTag,
}) => {
  const currentBoard = boards.find((b) => b.id === editBoardId) || boards[0];
  const columns = currentBoard?.columns && currentBoard.columns.length > 0 ? currentBoard.columns : DEFAULT_COLUMNS;
  const availableColumns = [{ id: "inbox" as ColumnId, title: "靈感收件匣", icon: "📥" }, ...columns];

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3">
      {extractedTask?.transcript && (
        <div className="mb-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1"><Volume2 className="w-3.5 h-3.5" />口述逐字稿：</span>
          <p className="text-xs text-slate-700 dark:text-slate-200 italic leading-relaxed">&ldquo;{extractedTask.transcript}&rdquo;</p>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">任務標題</label>
        <input type="text" value={editTitle} onChange={(e) => onTitleChange(e.target.value)} className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-orange-500" />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1"><Layers className="w-3.5 h-3.5 text-slate-400" />目標看板</label>
          <Select value={editBoardId} onValueChange={onBoardChange}>
            <SelectTrigger className="w-full h-9 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"><SelectValue /></SelectTrigger>
            <SelectContent>{boards.map((b) => (<SelectItem key={b.id} value={b.id}>{b.icon} {b.name}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">目標欄位</label>
          <Select value={editColumnId} onValueChange={(v) => onColumnChange(v as ColumnId)}>
            <SelectTrigger className="w-full h-9 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"><SelectValue /></SelectTrigger>
            <SelectContent>{availableColumns.map((c) => (<SelectItem key={c.id} value={c.id}>{c.icon || "📋"} {c.title}</SelectItem>))}</SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1"><Flag className="w-3.5 h-3.5 text-slate-400" />優先等級</label>
        <Select value={editPriority} onValueChange={(v) => onPriorityChange(v as Priority)}>
          <SelectTrigger className="w-full h-9 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="high">🔴 高優先級 (High)</SelectItem><SelectItem value="medium">🟡 中優先級 (Medium)</SelectItem><SelectItem value="low">🟢 低優先級 (Low)</SelectItem></SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /><span>到期時間</span></label>
        <DateTimePicker value={editDueDate} onChange={(d) => onDueDateChange(d.dueDate || "")} placeholder="點擊選擇日期與時間..." align="left" />
      </div>

      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1"><Tag className="w-3.5 h-3.5 text-slate-400" />標籤 (點擊可移除，按 Enter 可新增)</label>
        <div className="flex flex-wrap gap-1.5 items-center">
          {editTags.map((t, idx) => (
            <span key={idx} onClick={() => onRemoveTag(t)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium cursor-pointer hover:bg-rose-100 hover:text-rose-700 transition-colors">
              <span>#{t}</span><X className="w-3 h-3" />
            </span>
          ))}
          <input type="text" value={tagInput} onChange={(e) => onTagInputChange(e.target.value)} onKeyDown={(e) => { if (!e.nativeEvent.isComposing && e.key === "Enter") { e.preventDefault(); onAddTag(); } }} placeholder="+ 標籤" className="w-20 px-2 py-0.5 text-xs rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-orange-500" />
        </div>
      </div>
    </div>
  );
};
