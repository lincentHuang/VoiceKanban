"use client";

import React, { useState, useRef } from "react";
import {
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  Image as ImageIcon,
  Eye,
  Edit2,
  Paperclip,
  Code,
  Sparkles,
} from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  onSave?: () => void;
  placeholder?: string;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  onSave,
  placeholder = "新增更詳細的說明（支援 Markdown 與貼上/上傳圖片）...",
}) => {
  const [isPreview, setIsPreview] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    setIsDirty(true);
  };

  const handleBlur = () => {
    setIsDirty(false);
    if (onSave) onSave();
  };

  const insertText = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previousText = textarea.value;
    const selectedText = previousText.substring(start, end);

    const replacement = `${before}${selectedText || "文字"}${after}`;
    const newText =
      previousText.substring(0, start) +
      replacement +
      previousText.substring(end);

    onChange(newText);
    setIsDirty(true);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + (selectedText.length || 2)
      );
    }, 0);
  };

  // Handle local image file upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        insertText(`\n![${file.name}](${base64Url})\n`);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle paste image from clipboard
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64Url = event.target?.result as string;
            insertText(`\n![貼上的截圖](${base64Url})\n`);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  // Simple Markdown renderer for preview
  const renderMarkdown = (text: string) => {
    if (!text.trim()) {
      return <span className="text-slate-400 italic">尚無說明內容</span>;
    }

    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Check image ![alt](src)
      const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
      if (imgMatch) {
        return (
          <div key={idx} className="my-2.5">
            <img
              src={imgMatch[2]}
              alt={imgMatch[1]}
              className="max-h-72 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md object-contain"
            />
            {imgMatch[1] && (
              <span className="text-[11px] text-slate-400 block mt-1">
                📷 {imgMatch[1]}
              </span>
            )}
          </div>
        );
      }

      // Check bullet list
      if (line.trim().startsWith("- ") || line.trim().startsWith("• ")) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs sm:text-sm my-0.5">
            {line.trim().replace(/^[-•]\s*/, "")}
          </li>
        );
      }

      // Format bold (**bold**)
      const formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

      return (
        <p
          key={idx}
          className="text-xs sm:text-sm leading-relaxed my-1"
          dangerouslySetInnerHTML={{ __html: formatted || "&nbsp;" }}
        />
      );
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-700/90 bg-white dark:bg-slate-800/90 shadow-xs overflow-hidden transition-all focus-within:ring-2 focus-within:ring-orange-500/20">
      {/* Markdown Toolbar (Matching Image 2) */}
      <div className="flex items-center justify-between p-2 bg-slate-50/80 dark:bg-slate-800 border-b border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-1 flex-wrap">
          {/* Bold */}
          <button
            type="button"
            onClick={() => insertText("**", "**")}
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            title="粗體 (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() => insertText("*", "*")}
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            title="斜體 (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          {/* List */}
          <button
            type="button"
            onClick={() => insertText("\n- ", "")}
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            title="無序清單"
          >
            <List className="w-3.5 h-3.5" />
          </button>

          {/* Link */}
          <button
            type="button"
            onClick={() => insertText("[連結名稱](", ")")}
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            title="插入超連結"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>

          {/* Image Upload */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-orange-600 dark:text-orange-400 font-bold transition-colors flex items-center gap-1"
            title="上傳圖片或貼上截圖"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Right Preview Toggle & Unsaved Status */}
        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
              未儲存的變更
            </span>
          )}

          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              isPreview
                ? "bg-orange-500 text-white shadow-2xs"
                : "bg-white dark:bg-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200"
            }`}
          >
            {isPreview ? <Edit2 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            <span>{isPreview ? "編輯" : "預覽"}</span>
          </button>
        </div>
      </div>

      {/* Editor Body / Preview Body */}
      {isPreview ? (
        <div className="p-4 min-h-[120px] max-h-80 overflow-y-auto text-slate-800 dark:text-slate-100 bg-white/50 dark:bg-slate-800/50">
          {renderMarkdown(value)}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          rows={4}
          value={value}
          onChange={handleTextChange}
          onBlur={handleBlur}
          onPaste={handlePaste}
          placeholder={placeholder}
          className="w-full p-3.5 bg-transparent border-none text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none leading-relaxed resize-y"
        />
      )}
    </div>
  );
};
