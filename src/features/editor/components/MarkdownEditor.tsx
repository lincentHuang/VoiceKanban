"use client";

import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import {
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  Image as ImageIcon,
  Check,
  Edit3,
  Code,
  Heading,
  Strikethrough,
  ExternalLink,
  AlignLeft,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { compressImage } from "@/core/utils/imageUtils";

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  onSave?: (val: string) => void;
  title?: string;
  placeholder?: string;
  className?: string;
  maxPreviewHeight?: number; // default 500px
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  onSave,
  title = "說明 (Markdown & 圖片)",
  placeholder = "輸入詳細說明，支援 Markdown 粗體、連結、清單，並可點擊 🖼️ 插入圖片或直接貼上截圖...",
  className = "",
  maxPreviewHeight = 500,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(value);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewContentRef = useRef<HTMLDivElement>(null);

  // Sync draftValue when prop value changes from outside
  useEffect(() => {
    setDraftValue(value);
  }, [value]);

  // Measure preview content height to determine if gradient collapse is needed
  useLayoutEffect(() => {
    if (!isEditing && previewContentRef.current) {
      const height = previewContentRef.current.scrollHeight;
      setIsOverflowing(height > maxPreviewHeight);
    }
  }, [value, isEditing, maxPreviewHeight]);

  // Auto focus when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setDraftValue(value);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const finalVal = draftValue;
    onChange(finalVal);
    if (onSave) {
      onSave(finalVal);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setDraftValue(value);
    setIsEditing(false);
  };

  const insertText = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) {
      const newText = draftValue ? `${draftValue}\n${before}${after}` : `${before}${after}`;
      setDraftValue(newText);
      onChange(newText);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const previousText = textarea.value;
    const selectedText = previousText.substring(start, end);

    const replacement = `${before}${selectedText || ""}${after}`;
    const newText =
      previousText.substring(0, start) +
      replacement +
      previousText.substring(end);

    setDraftValue(newText);
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      const cursorTarget = start + before.length + (selectedText ? selectedText.length : 0);
      textarea.setSelectionRange(cursorTarget, cursorTarget);
    }, 0);
  };

  // Handle local image file upload with safe compression
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsCompressing(true);
        const compressedUrl = await compressImage(file, 1400, 1400, 0.82);
        insertText(`\n![${file.name.replace(/[\[\]]/g, "")}](${compressedUrl})\n`);
      } catch (err) {
        console.error("Image processing error:", err);
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64Url = event.target?.result as string;
          insertText(`\n![${file.name}](${base64Url})\n`);
        };
        reader.readAsDataURL(file);
      } finally {
        setIsCompressing(false);
        e.target.value = "";
      }
    }
  };

  // Handle paste image from clipboard into textarea with compression
  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          try {
            setIsCompressing(true);
            const compressedUrl = await compressImage(file, 1400, 1400, 0.82);
            insertText(`\n![貼上的截圖](${compressedUrl})\n`);
          } catch (err) {
            console.error("Paste image error:", err);
            const reader = new FileReader();
            reader.onload = (event) => {
              const base64Url = event.target?.result as string;
              insertText(`\n![貼上的截圖](${base64Url})\n`);
            };
            reader.readAsDataURL(file);
          } finally {
            setIsCompressing(false);
          }
          break;
        }
      }
    }
  };

  // Safe inline text markdown formatter
  const formatInlineMarkdown = (text: string): React.ReactNode => {
    const linkRegex = /\[(.*?)\]\((https?:\/\/[^\s)]+|[^\s)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        parts.push(renderTextDecorations(text.substring(lastIndex, matchIndex)));
      }
      const linkLabel = match[1] || match[2];
      const linkHref = match[2];
      parts.push(
        <a
          key={`link-${matchIndex}`}
          href={linkHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-semibold underline inline-flex items-center gap-0.5 mx-0.5 hover:underline transition-colors"
        >
          <span>{linkLabel}</span>
          <ExternalLink className="w-3 h-3 inline shrink-0 opacity-70" />
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(renderTextDecorations(text.substring(lastIndex)));
    }

    return parts.length > 0 ? parts : renderTextDecorations(text);
  };

  const renderTextDecorations = (str: string): React.ReactNode => {
    let formatted = str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/__(.*?)__/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/_(.*?)_/g, "<em>$1</em>")
      .replace(/~~(.*?)~~/g, "<del>$1</del>")
      .replace(/`([^`]+)`/g, "<code class='px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-orange-600 dark:text-orange-400 font-mono text-[11px] font-semibold'>$1</code>");

    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  // Full Markdown renderer for Browse / View mode
  const renderMarkdown = (text: string) => {
    if (!text || !text.trim()) {
      return (
        <div
          onClick={handleStartEdit}
          className="py-4 px-3 text-slate-400 dark:text-slate-500 text-xs italic rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 cursor-pointer hover:border-orange-400 dark:hover:border-orange-500/50 hover:bg-orange-50/20 dark:hover:bg-orange-950/10 transition-all flex items-center justify-center gap-2 group"
        >
          <Edit3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500 transition-colors" />
          <span>點擊此處新增說明內容或上傳圖片...</span>
        </div>
      );
    }

    const lines = text.split("\n");
    return (
      <div className="space-y-1.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed break-words">
        {lines.map((line, idx) => {
          const trimmed = line.trim();

          // 1. Image ![alt](src)
          const imgMatch = line.match(/!\[(.*?)\]\((.*?)\)/);
          if (imgMatch) {
            return (
              <div key={idx} className="my-2.5">
                <img
                  src={imgMatch[2]}
                  alt={imgMatch[1]}
                  loading="lazy"
                  className="max-h-80 max-w-full rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs object-contain bg-slate-900/5 dark:bg-slate-900/40"
                />
                {imgMatch[1] && (
                  <span className="text-[11px] text-slate-400 block mt-1">
                    📷 {imgMatch[1]}
                  </span>
                )}
              </div>
            );
          }

          // 2. Headings (# H1, ## H2, ### H3)
          if (trimmed.startsWith("### ")) {
            return (
              <h3 key={idx} className="text-sm font-bold text-slate-900 dark:text-white pt-1">
                {formatInlineMarkdown(trimmed.replace(/^###\s+/, ""))}
              </h3>
            );
          }
          if (trimmed.startsWith("## ")) {
            return (
              <h2 key={idx} className="text-base font-bold text-slate-900 dark:text-white pt-1.5 border-b border-slate-100 dark:border-slate-800 pb-1">
                {formatInlineMarkdown(trimmed.replace(/^##\s+/, ""))}
              </h2>
            );
          }
          if (trimmed.startsWith("# ")) {
            return (
              <h1 key={idx} className="text-lg font-bold text-slate-900 dark:text-white pt-2 border-b border-slate-200 dark:border-slate-700 pb-1">
                {formatInlineMarkdown(trimmed.replace(/^#\s+/, ""))}
              </h1>
            );
          }

          // 3. Bullet list item (- , * , • )
          if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-orange-500 font-bold text-sm leading-tight">•</span>
                <span className="flex-1 min-w-0">
                  {formatInlineMarkdown(trimmed.replace(/^[-*•]\s+/, ""))}
                </span>
              </div>
            );
          }

          // 4. Numbered list item (1. )
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="font-bold text-[11px] text-slate-400 min-w-4 text-right">
                  {numMatch[1]}.
                </span>
                <span className="flex-1 min-w-0">
                  {formatInlineMarkdown(numMatch[2])}
                </span>
              </div>
            );
          }

          // 5. Blockquote (> )
          if (trimmed.startsWith("> ")) {
            return (
              <div
                key={idx}
                className="border-l-3 border-orange-400 dark:border-orange-500 pl-3 py-1 my-1 bg-orange-50/40 dark:bg-orange-950/20 text-slate-700 dark:text-slate-300 rounded-r-lg text-xs"
              >
                {formatInlineMarkdown(trimmed.replace(/^>\s+/, ""))}
              </div>
            );
          }

          // 6. Empty line
          if (!trimmed) {
            return <div key={idx} className="h-1.5" />;
          }

          // 7. Regular paragraph
          return (
            <p key={idx} className="my-0.5">
              {formatInlineMarkdown(line)}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Title Row: Title & Action Button directly on the right */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlignLeft className="w-4 h-4 text-slate-400 shrink-0" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {title}
          </h4>
        </div>

        {/* Header Right Buttons */}
        {isEditing ? (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
            >
              取消
            </button>

            <button
              type="button"
              onClick={handleSaveEdit}
              className="px-3.5 py-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 hover:scale-102 active:scale-98"
            >
              <Check className="w-3.5 h-3.5" />
              <span>完成</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleStartEdit}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 text-xs font-bold hover:bg-orange-100 dark:hover:bg-orange-900/60 transition-all shadow-2xs hover:scale-102 active:scale-98 shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>編輯說明</span>
          </button>
        )}
      </div>

      {/* --- 1. EDIT MODE --- */}
      {isEditing ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 shadow-xs overflow-hidden animate-in fade-in duration-150">
          {/* Markdown Toolbar */}
          <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 gap-2 flex-wrap">
            <div className="flex items-center gap-1 flex-wrap">
              {/* Bold */}
              <button
                type="button"
                onClick={() => insertText("**", "**")}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                title="粗體 (**文字**)"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>

              {/* Italic */}
              <button
                type="button"
                onClick={() => insertText("*", "*")}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                title="斜體 (*文字*)"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>

              {/* Strikethrough */}
              <button
                type="button"
                onClick={() => insertText("~~", "~~")}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                title="刪除線 (~~文字~~)"
              >
                <Strikethrough className="w-3.5 h-3.5" />
              </button>

              {/* Heading */}
              <button
                type="button"
                onClick={() => insertText("### ")}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                title="標題 (### 標題)"
              >
                <Heading className="w-3.5 h-3.5" />
              </button>

              {/* List */}
              <button
                type="button"
                onClick={() => insertText("\n- ")}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                title="清單項目 (- 項目)"
              >
                <List className="w-3.5 h-3.5" />
              </button>

              {/* Link */}
              <button
                type="button"
                onClick={() => insertText("[連結名稱](", ")")}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                title="插入連結 ([名稱](網址))"
              >
                <LinkIcon className="w-3.5 h-3.5" />
              </button>

              {/* Code */}
              <button
                type="button"
                onClick={() => insertText("`", "`")}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                title="行內代碼 (`代碼`)"
              >
                <Code className="w-3.5 h-3.5" />
              </button>

              {/* Image Upload */}
              <button
                type="button"
                disabled={isCompressing}
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-bold transition-colors flex items-center gap-1 disabled:opacity-50"
                title="上傳圖片或貼上截圖 (自動智慧壓縮)"
              >
                {isCompressing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ImageIcon className="w-3.5 h-3.5" />
                )}
                <span className="text-[11px] hidden sm:inline">
                  {isCompressing ? "處理中..." : "插入圖片"}
                </span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          {/* Textarea Input */}
          <textarea
            ref={textareaRef}
            rows={6}
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
            onPaste={handlePaste}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                handleSaveEdit();
              }
              if (e.key === "Escape") {
                e.preventDefault();
                handleCancelEdit();
              }
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
        /* --- 2. BROWSE / VIEW MODE (No white container, no redundant header) --- */
        <div className="relative">
          <div
            ref={previewContentRef}
            className={`transition-all duration-300 ${
              isOverflowing && !isExpanded
                ? "max-h-[500px] overflow-hidden relative"
                : ""
            }`}
          >
            {renderMarkdown(value)}

            {/* Gradient fade to transparent when overflowing and collapsed */}
            {isOverflowing && !isExpanded && (
              <div className="pointer-events-none absolute bottom-0 inset-x-0 h-36 bg-gradient-to-t from-white dark:from-slate-900 via-white/90 dark:via-slate-900/90 to-transparent" />
            )}
          </div>

          {/* Expand / Collapse Button if content exceeds 500px */}
          {isOverflowing && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full py-2 px-3 rounded-xl bg-slate-100/90 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700/90 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:scale-101 active:scale-99 border border-slate-200/60 dark:border-slate-700/60"
              >
                {isExpanded ? (
                  <>
                    <span>收合說明內容</span>
                    <ChevronUp className="w-3.5 h-3.5 text-orange-500" />
                  </>
                ) : (
                  <>
                    <span>展開完整說明內容</span>
                    <ChevronDown className="w-3.5 h-3.5 text-orange-500" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
