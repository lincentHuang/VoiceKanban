import { ActivityPayload, NotificationActionType, NotificationItem } from "../types";

const NOTIFICATIONS_STORAGE_KEY = "vk_notifications_list";
const MAX_NOTIFICATIONS = 50;

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Check if Web Notification API is supported in the current environment
   */
  public isWebNotificationSupported(): boolean {
    return typeof window !== "undefined" && "Notification" in window;
  }

  /**
   * Get current Web Notification permission status
   */
  public getPermissionStatus(): NotificationPermission {
    if (!this.isWebNotificationSupported()) return "denied";
    return Notification.permission;
  }

  /**
   * Request Web Notification permission from user
   */
  public async requestPermission(): Promise<boolean> {
    if (!this.isWebNotificationSupported()) return false;
    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (e) {
      console.warn("Failed to request notification permission:", e);
      return false;
    }
  }

  /**
   * Show native desktop Web Notification if permitted and window is not active/focused
   */
  public showNativeNotification(item: NotificationItem): void {
    if (!this.isWebNotificationSupported()) return;
    if (Notification.permission !== "granted") return;

    try {
      const notification = new Notification(item.title, {
        body: item.message,
        icon: item.actorAvatar || "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        tag: item.id,
      });

      notification.onclick = () => {
        if (typeof window !== "undefined") {
          window.focus();
        }
        notification.close();
      };
    } catch (e) {
      console.warn("Failed to trigger native notification:", e);
    }
  }

  /**
   * Generates a structured ActivityPayload from actions
   */
  public createActivity(
    actionType: NotificationActionType,
    params: {
      boardId: string;
      boardName: string;
      actorId: string;
      actorName: string;
      actorAvatar?: string;
      taskId?: string;
      taskTitle?: string;
      sourceColumnTitle?: string;
      targetColumnTitle?: string;
    }
  ): ActivityPayload {
    const id = `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const actor = params.actorName || "協作成員";

    let title = `${actor} 更新了看板`;
    let message = "";

    switch (actionType) {
      case "task_created":
        title = `${actor} 新增了任務`;
        message = params.targetColumnTitle
          ? `在 [${params.targetColumnTitle}] 新增了「${params.taskTitle || "新任務"}」`
          : `新增了任務「${params.taskTitle || "新任務"}」`;
        break;

      case "task_moved":
        title = `${actor} 移動了任務`;
        message = params.targetColumnTitle
          ? `將「${params.taskTitle || "任務"}」移至 [${params.targetColumnTitle}]`
          : `移動了「${params.taskTitle || "任務"}」`;
        break;

      case "task_completed":
        title = `${actor} 完成了任務`;
        message = `完成了任務「${params.taskTitle || "任務"}」`;
        break;

      case "task_uncompleted":
        title = `${actor} 重新開啟了任務`;
        message = `將任務「${params.taskTitle || "任務"}」標為未完成`;
        break;

      case "task_deleted":
        title = `${actor} 刪除了任務`;
        message = `刪除了任務「${params.taskTitle || "任務"}」`;
        break;

      case "member_joined":
        title = `新成員加入協作`;
        message = `${actor} 加入了「${params.boardName}」協作看板`;
        break;
    }

    return {
      id,
      boardId: params.boardId,
      boardName: params.boardName,
      actorId: params.actorId,
      actorName: actor,
      actorAvatar: params.actorAvatar,
      actionType,
      title,
      message,
      taskId: params.taskId,
      taskTitle: params.taskTitle,
      sourceColumnTitle: params.sourceColumnTitle,
      targetColumnTitle: params.targetColumnTitle,
      timestamp: now,
    };
  }

  /**
   * Load stored notifications from LocalStorage
   */
  public loadStoredNotifications(): NotificationItem[] {
    if (typeof window === "undefined" || typeof localStorage === "undefined") return [];
    try {
      const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (!raw) return [];
      const items = JSON.parse(raw);
      return Array.isArray(items) ? items : [];
    } catch {
      return [];
    }
  }

  /**
   * Save notifications to LocalStorage (retaining up to MAX_NOTIFICATIONS)
   */
  public saveStoredNotifications(items: NotificationItem[]): void {
    if (typeof window === "undefined" || typeof localStorage === "undefined") return;
    try {
      const trimmed = items.slice(0, MAX_NOTIFICATIONS);
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.warn("Failed to persist notifications:", e);
    }
  }
}

export const notificationService = NotificationService.getInstance();
