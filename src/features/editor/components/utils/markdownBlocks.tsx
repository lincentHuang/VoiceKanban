import React from "react";
import { Code, Edit3 } from "lucide-react";
import { formatInlineMarkdown } from "./markdownInline";
import { isTableRow, isTableDelimiter, parseCells, parseAlignments, renderTableBlock } from "./markdownTable";

export const renderMarkdownBlocks = (text: string, onStartEdit: () => void): React.ReactNode => {
  if (!text || !text.trim()) {
    return (
      <div onClick={onStartEdit} className="py-4 px-3 text-slate-400 dark:text-slate-500 text-xs italic rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 cursor-pointer hover:border-orange-400 hover:bg-orange-50/20 transition-all flex items-center justify-center gap-2 group">
        <Edit3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500 transition-colors" />
        <span>點擊此處新增說明內容或上傳圖片...</span>
      </div>
    );
  }

  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) { codeLines.push(lines[i]); i++; }
      if (i < lines.length) i++;
      blocks.push(
        <div key={`code-${i}`} className="my-2.5 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900 text-slate-100">
          {lang && <div className="px-3 py-1 bg-slate-800 text-[10px] text-slate-400 font-mono uppercase border-b border-slate-700/60 flex items-center justify-between"><span>{lang}</span><Code className="w-3 h-3 text-slate-500" /></div>}
          <pre className="p-3 text-xs font-mono overflow-x-auto leading-relaxed text-slate-200"><code>{codeLines.join("\n")}</code></pre>
        </div>
      );
      continue;
    }
    if (/^(\*{3,}|-{3,}|_{3,})$/.test(trimmed)) { blocks.push(<hr key={`hr-${i}`} className="my-3 border-t border-slate-200 dark:border-slate-700/80" />); i++; continue; }

    if (isTableRow(trimmed) && i + 1 < lines.length && isTableDelimiter(lines[i + 1])) {
      const headers = parseCells(trimmed);
      const alignments = parseAlignments(lines[i + 1].trim());
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && isTableRow(lines[i].trim()) && !isTableDelimiter(lines[i].trim())) { rows.push(parseCells(lines[i].trim())); i++; }
      const colCount = Math.max(headers.length, alignments.length, ...rows.map((r) => r.length));
      while (headers.length < colCount) headers.push("");
      while (alignments.length < colCount) alignments.push("left");
      blocks.push(renderTableBlock(headers, alignments, rows, `table-${i}`));
      continue;
    }

    const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      blocks.push(
        <div key={`img-${i}`} className="my-2.5">
          <img src={imgMatch[2]} alt={imgMatch[1]} loading="lazy" className="max-h-80 max-w-full rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs object-contain bg-slate-900/5 dark:bg-slate-900/40" />
          {imgMatch[1] && <span className="text-[11px] text-slate-400 block mt-1">📷 {imgMatch[1]}</span>}
        </div>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith("#")) {
      const level = trimmed.match(/^#+/)?.[0].length || 1;
      const cls = level === 1 ? "text-lg font-bold border-b pb-1" : level === 2 ? "text-base font-bold border-b pb-1" : level === 3 ? "text-sm font-bold" : "text-xs font-bold";
      blocks.push(<div key={`h-${i}`} className={`${cls} text-slate-900 dark:text-white pt-1`}>{formatInlineMarkdown(trimmed.replace(/^#+\s*/, ""))}</div>);
      i++;
      continue;
    }

    const checkMatch = trimmed.match(/^[-*•]\s+\[([ xX])\]\s+(.*)/);
    if (checkMatch) {
      const isChecked = checkMatch[1].toLowerCase() === "x";
      blocks.push(
        <div key={`check-${i}`} className="flex items-center gap-2 my-1 pl-2">
          <input type="checkbox" checked={isChecked} readOnly className="w-3.5 h-3.5 rounded text-orange-500 pointer-events-none" />
          <span className={`flex-1 min-w-0 text-xs sm:text-sm ${isChecked ? "line-through text-slate-400" : ""}`}>{formatInlineMarkdown(checkMatch[2])}</span>
        </div>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.startsWith("• ")) {
      blocks.push(<div key={`bullet-${i}`} className="flex items-start gap-2 pl-2"><span className="text-orange-500 font-bold text-sm">•</span><span className="flex-1 min-w-0">{formatInlineMarkdown(trimmed.replace(/^[-*•]\s+/, ""))}</span></div>);
      i++;
      continue;
    }

    if (!trimmed) { blocks.push(<div key={`empty-${i}`} className="h-1.5" />); i++; continue; }
    blocks.push(<p key={`p-${i}`} className="my-0.5">{formatInlineMarkdown(line)}</p>);
    i++;
  }
  return <div className="space-y-1.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed break-words">{blocks}</div>;
};
