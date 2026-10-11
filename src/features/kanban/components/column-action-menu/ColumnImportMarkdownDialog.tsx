"use client";

import React, { useMemo, useRef, useState } from "react";
import { FileUp } from "lucide-react";
import { Column } from "@/core/types/task";
import { useKanbanStore } from "@/core/stores/useKanbanStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { parseMarkdownToTasks } from "../../utils/columnMarkdownImport";

type ImportMode = "append" | "replace";

interface ColumnImportMarkdownDialogProps {
  column: Column;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PREVIEW_LIMIT = 6;

export const ColumnImportMarkdownDialog: React.FC<ColumnImportMarkdownDialogProps> = ({
  column,
  open,
  onOpenChange,
}) => {
  const { tasks, activeBoardId, importTasksToColumn } = useKanbanStore();
  const [markdown, setMarkdown] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [mode, setMode] = useState<ImportMode>("append");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const drafts = useMemo(() => parseMarkdownToTasks(markdown), [markdown]);
  const existingCount = tasks.filter(
    (t) => t.boardId === activeBoardId && t.columnId === column.id && !t.isArchived
  ).length;

  const reset = () => {
    setMarkdown("");
    setFileName(null);
    setMode("append");
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setFileName(file.name);
    setMarkdown(await file.text());
  };

  const handleImport = () => {
    importTasksToColumn(column.id, drafts, mode);
    handleOpenChange(false);
  };

  const modeOptions: { value: ImportMode; label: string; hint: string }[] = [
    { value: "append", label: "加入", hint: "接在列表最後，現有卡片不動" },
    {
      value: "replace",
      label: "直接覆蓋",
      hint: existingCount > 0 ? `會刪除列表裡現有的 ${existingCount} 張卡片` : "列表目前是空的",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-md"
        // 中文輸入法選字時按 Esc 只是取消選字，不能把整個視窗關掉
        onEscapeKeyDown={(e) => {
          if (e.isComposing) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>從 Markdown 匯入</DialogTitle>
          <DialogDescription>
            匯入到「{column.title}」。每個 ## 標題（或每個清單項目）會變成一張卡片。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown,.txt,text/markdown,text/plain"
            className="hidden"
            onChange={(e) => {
              void handleFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <FileUp className="w-4 h-4 text-slate-400" />
            {fileName ? `已選擇：${fileName}` : "選擇 .md 檔案"}
          </button>
          <textarea
            value={markdown}
            onChange={(e) => {
              setMarkdown(e.target.value);
              setFileName(null);
            }}
            placeholder="或直接貼上 Markdown（例如 AI 整理好的結果）"
            rows={6}
            className="w-full resize-y rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-950/40 px-3 py-2 text-xs font-mono text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50"
          />
        </div>

        {markdown.trim() && (
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-xs">
            <div className="font-bold text-slate-700 dark:text-slate-200 mb-1">
              {drafts.length > 0 ? `解析出 ${drafts.length} 張卡片` : "找不到可以匯入的卡片"}
            </div>
            <ul className="space-y-0.5 text-slate-500 dark:text-slate-400">
              {drafts.slice(0, PREVIEW_LIMIT).map((d, i) => (
                <li key={i} className="truncate">
                  {d.completed ? "✅ " : "• "}
                  {d.title}
                </li>
              ))}
              {drafts.length > PREVIEW_LIMIT && <li>…還有 {drafts.length - PREVIEW_LIMIT} 張</li>}
            </ul>
          </div>
        )}

        <div role="radiogroup" aria-label="匯入方式" className="grid grid-cols-2 gap-2">
          {modeOptions.map((opt) => {
            const selected = mode === opt.value;
            const danger = opt.value === "replace";
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setMode(opt.value)}
                className={`rounded-2xl border px-3 py-2 text-left transition-colors cursor-pointer ${
                  selected
                    ? danger
                      ? "border-rose-400 bg-rose-50 dark:bg-rose-950/30"
                      : "border-orange-400 bg-orange-50 dark:bg-orange-950/30"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                }`}
              >
                <div
                  className={`text-sm font-bold ${
                    selected && danger ? "text-rose-600 dark:text-rose-400" : "text-slate-800 dark:text-slate-100"
                  }`}
                >
                  {opt.label}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{opt.hint}</div>
              </button>
            );
          })}
        </div>

        <DialogFooter className="gap-2">
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            disabled={drafts.length === 0}
            onClick={handleImport}
            className={`rounded-xl px-4 py-2 text-sm font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
              mode === "replace" ? "bg-rose-500 hover:bg-rose-600" : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {mode === "replace" ? `覆蓋為 ${drafts.length} 張卡片` : `匯入 ${drafts.length} 張卡片`}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
