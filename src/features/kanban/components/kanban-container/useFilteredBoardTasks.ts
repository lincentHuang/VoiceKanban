import { Task } from "@/core/types/task";
import { getDueDateStatus } from "@/core/utils/dateUtils";

export function useFilteredBoardTasks(
  tasks: Task[],
  activeBoardId: string,
  searchQuery: string,
  priorityFilter: string,
  tagFilter: string
) {
  return tasks.filter((task) => {
    if (task.columnId === "inbox") return false;
    if (task.boardId !== activeBoardId) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchTag = task.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTag) return false;
    }

    if (priorityFilter === "high" && !task.isStarred) return false;

    if (tagFilter !== "all") {
      const dateStatus = getDueDateStatus(task.dueDate, task.completed);
      const isOverdue = (tagFilter === "逾期" || tagFilter === "緊急") && dateStatus?.urgency === "overdue" && !task.completed;
      const isDueSoon = (tagFilter === "即將到期" || tagFilter === "緊急") && dateStatus?.urgency === "due-soon" && !task.completed;
      const hasTag = task.tags?.includes(tagFilter);
      if (!hasTag && !isOverdue && !isDueSoon) return false;
    }

    return true;
  });
}
