import React from "react";
import { formatInlineMarkdown } from "./markdownInline";

export const parseCells = (row: string): string[] => {
  let cleaned = row.trim();
  if (cleaned.startsWith("|")) cleaned = cleaned.slice(1);
  if (cleaned.endsWith("|")) cleaned = cleaned.slice(0, -1);
  return cleaned.split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, "|"));
};

export const isTableRow = (line: string): boolean => {
  const trimmed = line.trim();
  return trimmed.includes("|") && !trimmed.startsWith("#") && !trimmed.startsWith("```") && !trimmed.startsWith(">");
};

export const isTableDelimiter = (line: string): boolean => {
  const trimmed = line.trim();
  if (!trimmed.includes("|") || !trimmed.includes("-")) return false;
  const cells = parseCells(trimmed);
  return cells.length > 0 && cells.every((cell) => /^:?-{1,}:?$/.test(cell));
};

export const parseAlignments = (delimiterLine: string): ("left" | "center" | "right")[] => {
  return parseCells(delimiterLine).map((cell) => {
    if (cell.startsWith(":") && cell.endsWith(":")) return "center";
    if (cell.endsWith(":")) return "right";
    return "left";
  });
};

export const getAlignClass = (align?: "left" | "center" | "right"): string => {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
};

export const renderTableBlock = (
  headers: string[],
  alignments: ("left" | "center" | "right")[],
  rows: string[][],
  key: string
) => (
  <div key={key} className="my-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-850/50 shadow-2xs">
    <table className="min-w-full text-xs text-left divide-y divide-slate-200 dark:divide-slate-700 border-collapse">
      <thead className="bg-slate-100/90 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold">
        <tr>
          {headers.map((h, idx) => (
            <th key={idx} className={`px-3.5 py-2.5 border-r border-slate-200/60 dark:border-slate-700/60 last:border-r-0 tracking-wide font-semibold text-slate-900 dark:text-slate-100 ${getAlignClass(alignments[idx])}`}>
              {formatInlineMarkdown(h)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
        {rows.map((row, rIdx) => (
          <tr key={rIdx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors odd:bg-transparent even:bg-slate-50/40 dark:even:bg-slate-800/20">
            {headers.map((_, cIdx) => (
              <td key={cIdx} className={`px-3.5 py-2.5 border-r border-slate-100 dark:border-slate-800/80 last:border-r-0 text-slate-700 dark:text-slate-300 leading-relaxed ${getAlignClass(alignments[cIdx])}`}>
                {formatInlineMarkdown(row[cIdx] || "")}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
