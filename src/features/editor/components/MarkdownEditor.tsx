"use client";

import React from "react";
import { EditorHeader } from "./EditorHeader";
import { EditorToolbar } from "./EditorToolbar";
import { MarkdownPreview } from "./MarkdownPreview";
import { useMarkdownEditor } from "./useMarkdownEditor";

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  onSave?: (val: string) => void;
  title?: string;
  placeholder?: string;
  className?: string;
  maxPreviewHeight?: number;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  onSave,
  title = "說明 (Markdown & 圖片)",
  placeholder = "輸入詳細說明，支援 Markdown 粗體、連結、清單...",
  className = "",
  maxPreviewHeight = 500,
}) => {
  const editor = useMarkdownEditor(value, onChange, onSave);

  return (
    <div className={`space-y-2 ${className}`}>
      <EditorHeader
        title={title}
        isEditing={editor.isEditing}
        onStartEdit={() => { editor.setDraftValue(value); editor.setIsEditing(true); }}
        onCancelEdit={() => { editor.setDraftValue(value); editor.setIsEditing(false); }}
        onSaveEdit={editor.handleSaveEdit}
      />
      {editor.isEditing ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 shadow-xs overflow-hidden animate-in fade-in duration-150">
          <EditorToolbar isCompressing={editor.isCompressing} onInsertText={editor.insertText} onImageFileChange={editor.handleImageFileChange} />
          <textarea
            ref={editor.textareaRef}
            rows={6}
            value={editor.draftValue}
            onChange={(e) => editor.setDraftValue(e.target.value)}
            onPaste={editor.handlePaste}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); editor.handleSaveEdit(); }
              if (e.key === "Escape") { e.preventDefault(); editor.setDraftValue(value); editor.setIsEditing(false); }
            }}
            placeholder={placeholder}
            className="w-full p-3.5 bg-transparent border-none text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none leading-relaxed resize-y font-normal"
          />
          <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
            <span>支援 Markdown 語法、可直接貼上圖片截圖</span>
            <span>按 Ctrl+Enter 儲存 / Esc 取消</span>
          </div>
        </div>
      ) : (
        <MarkdownPreview value={value} maxPreviewHeight={maxPreviewHeight} onStartEdit={() => { editor.setDraftValue(value); editor.setIsEditing(true); }} />
      )}
    </div>
  );
};
