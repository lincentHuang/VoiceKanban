import { Column, Priority, Task } from "@/core/types/task";

const PRIORITY_LABEL: Record<Priority, string> = { high: "高", medium: "中", low: "低" };

function formatDate(value: string, isAllDay?: boolean): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...(isAllDay ? {} : { hour: "2-digit", minute: "2-digit", hour12: false }),
  });
}

function taskToMarkdown(task: Task, index: number): string {
  const lines: string[] = [`## ${index + 1}. ${task.completed ? "~~" + task.title + "~~ ✅" : task.title}`];

  const meta: string[] = [];
  if (task.isStarred) meta.push("- **重要**：⭐");
  if (task.priority) meta.push(`- **優先等級**：${PRIORITY_LABEL[task.priority] ?? task.priority}`);
  if (task.tags.length > 0) meta.push(`- **標籤**：${task.tags.map((tag) => `#${tag}`).join(" ")}`);
  if (task.startDate) meta.push(`- **開始**：${formatDate(task.startDate, task.isAllDay)}`);
  if (task.dueDate) meta.push(`- **到期**：${formatDate(task.dueDate, task.isAllDay)}`);
  if (task.link?.url) {
    const linkTitle = task.link.title || task.link.siteName || task.link.url;
    meta.push(`- **連結**：[${linkTitle}](${task.link.url})`);
    if (task.link.description?.trim()) meta.push(`- **連結摘要**：${task.link.description.trim()}`);
  }
  if (meta.length > 0) lines.push("", ...meta);

  if (task.description?.trim()) lines.push("", task.description.trim());

  if (task.checklist && task.checklist.length > 0) {
    lines.push("", "**子清單**", ...task.checklist.map((c) => `- [${c.completed ? "x" : " "}] ${c.title}`));
  }

  return lines.join("\n");
}

/** 把一個列表的卡片轉成一份 Markdown，順序與畫面上一致，方便整包貼給 AI 評估。 */
export function columnToMarkdown(column: Column, tasks: Task[]): string {
  const sorted = [...tasks].sort((a, b) => (a.orderKey > b.orderKey ? 1 : -1));
  const exportedAt = new Date().toLocaleString("zh-TW", { hour12: false });
  const doneCount = sorted.filter((t) => t.completed).length;

  const header = [
    `# ${column.icon ? column.icon + " " : ""}${column.title}`,
    "",
    `> 匯出時間：${exportedAt}｜共 ${sorted.length} 張卡片${doneCount > 0 ? `（已完成 ${doneCount}）` : ""}`,
  ];
  if (column.description?.trim()) header.push("", column.description.trim());

  return [header.join("\n"), ...sorted.map(taskToMarkdown)].join("\n\n---\n\n") + "\n";
}

export function downloadMarkdown(filename: string, markdown: string) {
  const safeName = filename.replace(/[\\/:*?"<>|]+/g, "_").trim() || "列表";
  const url = URL.createObjectURL(new Blob([markdown], { type: "text/markdown;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeName}.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
