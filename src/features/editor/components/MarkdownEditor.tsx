"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  Image as ImageIcon,
  Check,
  Edit3,
  X,
  Code,
  Heading,
  Strikethrough,
  ExternalLink,
  Upload,
} from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  onSave?: () => void;
  placeholder?: string;
  className?: string;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  onSave,
  placeholder = "輸入詳細說明，支援 Markdown 粗體、連結、清單，並可點擊 🖼️ 插入圖片或直接貼上截圖...",
  className = "",
}) => {
  // Starts in Browse mode (false) by default
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(value);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync draftValue when prop value changes
  useEffect(() => {
    setDraftValue(value);
  }, [value]);

  // Focus textarea when entering edit mode
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
    onChange(draftValue);
    if (onSave) onSave();
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

  // Handle local image file upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size limit (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("圖片檔案過大，請上傳小於 10MB 的圖片！");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        insertText(`\n![${file.name}](${base64Url})\n`);
      };
      reader.readAsDataURL(file);
      // Reset input value so same file can be re-uploaded
      e.target.value = "";
    }
  };

  // Handle paste image from clipboard into textarea
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          if (file.size > 10 * 1024 * 1024) {
            alert("貼上的圖片過大，最大不能超過 10MB！");
            return;
          }
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

  // Safe inline text markdown formatter (links, bold, italic, code, del)
  const formatInlineMarkdown = (text: string): React.ReactNode => {
    // Regex for markdown links [text](url)
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
    // Process bold (**text**) -> italic (*text*) -> code (`text`) -> strikethrough (~~text~~)
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
          className="py-4 px-3 text-slate-400 dark:text-slate-500 text-xs italic rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 cursor-pointer hover:border-orange-300 dark:hover:border-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group"
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
                  className="max-h-72 max-w-full rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm object-contain bg-slate-900/5 dark:bg-slate-900/40"
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

          // 7. Regular paragraph with inline markdown formatting
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
    <div className={`rounded-2xl border border-slate-200/90 dark:border-slate-700/90 bg-white dark:bg-slate-800/90 shadow-xs overflow-hidden transition-all ${className}`}>
      {/* --- 1. EDIT MODE --- */}
      {isEditing ? (
        <div className="animate-in fade-in duration-150">
          {/* Markdown Toolbar */}
          <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 gap-2">
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
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-bold transition-colors flex items-center gap-1"
                title="上傳圖片或貼上截圖 (最大 10MB)"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">插入圖片</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Action Buttons: Save & Cancel */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors"
              >
                取消
              </button>

              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-3.5 py-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>完成</span>
              </button>
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
              // Ctrl+Enter or Cmd+Enter to quickly save
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
        /* --- 2. BROWSE / VIEW MODE --- */
        <div className="p-3.5 sm:p-4 relative group/view">
          {/* Top Right Edit Trigger Button */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800/80">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              說明內容預覽
            </span>
            <button
              type="button"
              onClick={handleStartEdit}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 text-xs font-bold hover:bg-orange-100 dark:hover:bg-orange-900/60 transition-all shadow-2xs hover:scale-102 active:scale-98"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>編輯說明</span>
            </button>
          </div>

          {/* Rendered Markdown Body */}
          <div className="min-h-[60px] max-h-96 overflow-y-auto custom-scrollbar">
            {renderMarkdown(value)}
          </div>
        </div>
      )}
    </div>
  );
};

