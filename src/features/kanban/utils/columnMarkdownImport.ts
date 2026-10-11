import { ChecklistItem, Priority, Task, TaskLink } from "@/core/types/task";
import { detectPlatform } from "@/features/bookmarks/utils/linkParser";

/** 匯入時解析出的一張卡片；id、排序與建立者由 store 補上。 */
export type ImportedTaskDraft = Pick<
  Task,
  "title" | "description" | "tags" | "priority" | "isStarred" | "startDate" | "dueDate" | "isAllDay" | "completed" | "checklist" | "link"
>;

const PRIORITY_BY_LABEL: Record<string, Priority> = {
  高: "high", high: "high", 中: "medium", medium: "medium", 低: "low", low: "low",
};

const HEADING = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
const META_LINE = /^[-*]\s+\*\*(.+?)\*\*\s*[：:]\s*(.*)$/;
const CHECKLIST_MARKER = /^\*\*(子清單|子待辦清單)\*\*\s*[：:]?\s*$/;
const CHECKBOX = /^\s*[-*+]\s+\[([ xX])\]\s+(.*)$/;
const LIST_ITEM = /^([-*+]|\d+[.)])\s+(?:\[([ xX])\]\s+)?(.*)$/;
const SEPARATOR = /^\s*(-{3,}|\*{3,}|_{3,})\s*$/;

let checklistSeq = 0;
const newChecklistId = () => `chk-${Date.now()}-${checklistSeq++}`;

/** 「2026/10/13 14:08」「2026-10-13」或 ISO 字串 → ISO；沒寫時間就當整天。 */
function parseDate(raw: string): { iso: string; hasTime: boolean } | null {
  const m = raw.match(/(\d{4})[/.-](\d{1,2})[/.-](\d{1,2})(?:[\sT]+(\d{1,2}):(\d{2}))?/);
  if (!m) return null;
  const [, y, mo, d, h, mi] = m;
  const date = new Date(Number(y), Number(mo) - 1, Number(d), h ? Number(h) : 0, mi ? Number(mi) : 0);
  if (Number.isNaN(date.getTime())) return null;
  return { iso: date.toISOString(), hasTime: Boolean(h) };
}

/** 去掉匯出時加上的「3. 」編號與「~~標題~~ ✅」完成標記。 */
function parseTitle(raw: string): { title: string; completed: boolean } {
  let title = raw.trim().replace(/^\d+[.)、]\s+/, "");
  let completed = false;
  if (/\s*✅$/.test(title)) {
    completed = true;
    title = title.replace(/\s*✅$/, "");
  }
  const struck = title.match(/^~~(.+)~~$/);
  if (struck) {
    completed = true;
    title = struck[1];
  }
  title = title.replace(/^\*\*(.+)\*\*$/, "$1").trim();
  return { title, completed };
}

function emptyDraft(title: string, completed: boolean): ImportedTaskDraft {
  return {
    title, completed, description: "", tags: [], priority: "medium", isStarred: false,
    startDate: null, dueDate: null, isAllDay: false, checklist: [], link: null,
  };
}

/** 一段卡片內文：認得匯出格式的屬性列與子清單，其他全部留作備註。 */
function applyBody(draft: ImportedTaskDraft, bodyLines: string[]) {
  const descriptionLines: string[] = [];
  const checklist: ChecklistItem[] = [];
  let link: TaskLink | null = null;
  let linkSummary: string | null = null;
  let inChecklist = false;
  let inFence = false;
  let dueHasTime: boolean | null = null;

  for (const line of bodyLines) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    if (inFence || /^\s*```/.test(line)) {
      inChecklist = false;
      descriptionLines.push(line);
      continue;
    }

    if (CHECKLIST_MARKER.test(line.trim())) {
      inChecklist = true;
      continue;
    }
    const box = line.match(CHECKBOX);
    if (inChecklist && box) {
      checklist.push({ id: newChecklistId(), title: box[2].trim(), completed: box[1] !== " " });
      continue;
    }
    if (inChecklist && line.trim() === "") continue;
    inChecklist = false;

    const meta = line.match(META_LINE);
    if (meta) {
      const key = meta[1].trim();
      const value = meta[2].trim();
      let consumed = true;
      if (key === "重要") draft.isStarred = value.length > 0 && !/^(否|no|false)$/i.test(value);
      else if (key === "優先等級" || key === "優先") {
        const p = PRIORITY_BY_LABEL[value.toLowerCase()];
        if (p) draft.priority = p;
        else consumed = false;
      } else if (key === "標籤") {
        draft.tags = [...value.matchAll(/#?([^\s#,，、]+)/g)].map((t) => t[1]);
      } else if (key === "開始" || key === "到期" || key === "截止日期") {
        const parsed = parseDate(value);
        if (!parsed) consumed = false;
        else if (key === "開始") draft.startDate = parsed.iso;
        else {
          draft.dueDate = parsed.iso;
          dueHasTime = parsed.hasTime;
        }
      } else if (key === "連結") {
        const md = value.match(/\[(.*?)\]\((\S+?)\)/);
        const url = md ? md[2] : value.match(/https?:\/\/\S+/)?.[0];
        if (url) {
          const title = md && md[1] !== url ? md[1] : null;
          link = { url, platform: detectPlatform(url), title, savedAt: new Date().toISOString() };
        } else consumed = false;
      } else if (key === "連結摘要") linkSummary = value;
      else consumed = false;
      if (consumed) continue;
    }

    descriptionLines.push(line);
  }

  if (link && linkSummary) (link as TaskLink).description = linkSummary;
  draft.link = link;
  draft.checklist = checklist;
  if (dueHasTime !== null) draft.isAllDay = !dueHasTime;
  draft.description = descriptionLines
    .filter((l) => !SEPARATOR.test(l))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** 找出當作「一張卡片」的標題層級：H2～H6 裡最大的那層，H1 視為整份文件的標題。 */
function findCardHeadingLevel(lines: string[]): number | null {
  let inFence = false;
  let level: number | null = null;
  for (const line of lines) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    if (inFence) continue;
    const h = line.match(HEADING);
    if (h && h[1].length >= 2) level = level === null ? h[1].length : Math.min(level, h[1].length);
  }
  return level;
}

function parseByHeadings(lines: string[], level: number): ImportedTaskDraft[] {
  const drafts: ImportedTaskDraft[] = [];
  let current: { draft: ImportedTaskDraft; body: string[] } | null = null;
  let inFence = false;
  const flush = () => {
    if (current) {
      applyBody(current.draft, current.body);
      drafts.push(current.draft);
    }
    current = null;
  };

  for (const line of lines) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    const h = inFence ? null : line.match(HEADING);
    if (h && h[1].length <= level) {
      flush();
      if (h[1].length === level) {
        const { title, completed } = parseTitle(h[2]);
        if (title) current = { draft: emptyDraft(title, completed), body: [] };
      }
      continue;
    }
    current?.body.push(line);
  }
  flush();
  return drafts;
}

/** 沒有標題時（例如 AI 回一串清單），每個最外層清單項目就是一張卡片，縮排的內容當備註。 */
function parseByListItems(lines: string[]): ImportedTaskDraft[] {
  const drafts: ImportedTaskDraft[] = [];
  let current: { draft: ImportedTaskDraft; body: string[] } | null = null;
  const flush = () => {
    if (current) {
      applyBody(current.draft, current.body);
      drafts.push(current.draft);
    }
    current = null;
  };

  for (const line of lines) {
    const item = line.match(LIST_ITEM);
    if (item) {
      flush();
      const { title, completed } = parseTitle(item[3]);
      if (title) current = { draft: emptyDraft(title, completed || (item[2] ?? " ") !== " "), body: [] };
      continue;
    }
    if (current && /^\s+\S/.test(line)) current.body.push(line.replace(/^( {2,4}|\t)/, ""));
    else if (line.trim() !== "") flush();
  }
  flush();
  return drafts;
}

/**
 * 把 Markdown 拆成卡片。認得本 App 匯出的格式（可來回匯出匯入），也接受一般的
 * 「每個 ## 標題一張卡」或「每個清單項目一張卡」，方便直接貼 AI 整理好的結果。
 */
export function parseMarkdownToTasks(markdown: string): ImportedTaskDraft[] {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const level = findCardHeadingLevel(lines);
  if (level !== null) return parseByHeadings(lines, level);

  const fromList = parseByListItems(lines);
  if (fromList.length > 0) return fromList;

  return lines
    .map((l) => l.trim())
    .filter((l) => l && !HEADING.test(l) && !SEPARATOR.test(l) && !l.startsWith(">"))
    .map((l) => {
      const { title, completed } = parseTitle(l);
      return emptyDraft(title, completed);
    })
    .filter((d) => d.title);
}
