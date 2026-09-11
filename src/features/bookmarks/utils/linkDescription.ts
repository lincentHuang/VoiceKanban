import { TaskLink } from "@/core/types/task";
import { PLATFORM_META } from "../constants";

const MAX_CONTENT_LENGTH = 4000;

function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Detail body for a saved link, rendered by the editor's Markdown preview: image, title, content
 * and the user's note. The URL itself is left out — EditTaskLinkSection already shows it with an open button.
 */
export function buildLinkDescription(link: TaskLink, note?: string | null): string {
  const sections: string[] = [];

  if (link.thumbnailUrl) {
    // `[`, `]`, `(`, `)` in the caption would break the preview's `![alt](src)` line match
    const caption = [link.siteName || PLATFORM_META[link.platform].label, link.author]
      .filter(Boolean)
      .join(" · ")
      .replace(/[[\]()\n]/g, " ")
      .trim();
    sections.push(`![${caption}](${link.thumbnailUrl})`);
  }

  const content = (link.description || "").trim();
  const title = collapseWhitespace(link.title || "");
  // IG / Threads "titles" are the caption itself, so only add the title when the content doesn't repeat it
  if (title && !collapseWhitespace(content).startsWith(title)) sections.push(`**${title}**`);

  if (content) {
    sections.push(content.length > MAX_CONTENT_LENGTH ? `${content.slice(0, MAX_CONTENT_LENGTH).trimEnd()}…` : content);
  }
  if (note?.trim()) sections.push(`📝 ${note.trim()}`);

  return sections.join("\n\n");
}
