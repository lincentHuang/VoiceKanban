import React, { useRef } from "react";
import { Bold, Italic, Strikethrough, Heading, List, Table as TableIcon, Link as LinkIcon, Code, Image as ImageIcon, Loader2 } from "lucide-react";

interface EditorToolbarProps {
  isCompressing: boolean;
  onInsertText: (before: string, after?: string) => void;
  onImageFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  isCompressing,
  onInsertText,
  onImageFileChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 gap-2 flex-wrap">
      <div className="flex items-center gap-1 flex-wrap">
        <button type="button" onClick={() => onInsertText("**", "**")} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="粗體 (**文字**)">
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button type="button" onClick={() => onInsertText("*", "*")} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="斜體 (*文字*)">
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button type="button" onClick={() => onInsertText("~~", "~~")} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="刪除線 (~~文字~~)">
          <Strikethrough className="w-3.5 h-3.5" />
        </button>
        <button type="button" onClick={() => onInsertText("### ")} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="標題 (### 標題)">
          <Heading className="w-3.5 h-3.5" />
        </button>
        <button type="button" onClick={() => onInsertText("\n- ")} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="清單項目 (- 項目)">
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onInsertText("\n| 標題 1 | 標題 2 | 標題 3 |\n| :--- | :--- | :--- |\n| 內容 1 | 內容 2 | 內容 3 |\n")}
          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="插入表格"
        >
          <TableIcon className="w-3.5 h-3.5" />
        </button>
        <button type="button" onClick={() => onInsertText("[連結名稱](", ")")} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="插入連結">
          <LinkIcon className="w-3.5 h-3.5" />
        </button>
        <button type="button" onClick={() => onInsertText("`", "`")} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="行內代碼">
          <Code className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          disabled={isCompressing}
          onClick={() => fileInputRef.current?.click()}
          className="p-1.5 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-bold transition-colors flex items-center gap-1 disabled:opacity-50"
          title="上傳圖片或貼上截圖"
        >
          {isCompressing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
          <span className="text-[11px] hidden sm:inline">{isCompressing ? "處理中..." : "插入圖片"}</span>
        </button>
        <input type="file" ref={fileInputRef} onChange={onImageFileChange} accept="image/*" className="hidden" />
      </div>
    </div>
  );
};
