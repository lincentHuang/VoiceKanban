export type NotificationActionType =
  | "task_created"
  | "task_moved"
  | "task_completed"
  | "task_uncompleted"
  | "task_deleted"
  | "member_joined";

export interface ActivityPayload {
  id: string;
  boardId: string;
  boardName: string;
  actorId: string;
  actorName: string;
  actorAvatar?: string;
  actionType: NotificationActionType;
  title: string;
  message: string;
  taskId?: string;
  taskTitle?: string;
  sourceColumnTitle?: string;
  targetColumnTitle?: string;
  timestamp: string;
}

export interface NotificationItem extends ActivityPayload {
  read: boolean;
}

export interface NotificationFilter {
  type?: "all" | "unread" | "tasks" | "members";
  boardId?: string;
}
