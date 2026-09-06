import React from "react";
import { ExternalLink } from "lucide-react";

export const renderTextDecorations = (str: string, key?: string | number): React.ReactNode => {
  const formatted = str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.*?)__/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/_(.*?)_/g, "<em>$1</em>")
    .replace(/~~(.*?)~~/g, "<del>$1</del>")
    .replace(/`([^`]+)`/g, "<code class='px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-orange-600 dark:text-orange-400 font-mono text-[11px] font-semibold'>$1</code>");
  return <span key={key} dangerouslySetInnerHTML={{ __html: formatted }} />;
};

export const formatInlineMarkdown = (text: string): React.ReactNode => {
  const linkRegex = /\[(.*?)\]\((https?:\/\/[^\s)]+|[^\s)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    const matchIndex = match.index;
    if (matchIndex > lastIndex) {
      parts.push(renderTextDecorations(text.substring(lastIndex, matchIndex), `text-${matchIndex}`));
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
        className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-semibold underline inline-flex items-center gap-0.5 mx-0.5 transition-colors"
      >
        <span>{linkLabel}</span>
        <ExternalLink className="w-3 h-3 inline shrink-0 opacity-70" />
      </a>
    );
    lastIndex = linkRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(renderTextDecorations(text.substring(lastIndex), `text-end-${lastIndex}`));
  }

  return parts.length > 0 ? parts : renderTextDecorations(text);
};
