import { Task, Board } from "../types/task";
import { SyncStatus } from "../types/auth";

export class DatabaseSyncEngine {
  private static instance: DatabaseSyncEngine;
  private isOnline: boolean = true;

  private constructor() {
    if (typeof window !== "undefined") {
      this.isOnline = navigator.onLine;
      window.addEventListener("online", () => (this.isOnline = true));
      window.addEventListener("offline", () => (this.isOnline = false));
    }
  }

  public static getInstance(): DatabaseSyncEngine {
    if (!DatabaseSyncEngine.instance) {
      DatabaseSyncEngine.instance = new DatabaseSyncEngine();
    }
    return DatabaseSyncEngine.instance;
  }

  public async syncTasksToCloud(tasks: Task[], boards: Board[]): Promise<{ status: SyncStatus; syncedAt: string }> {
    // If offline, flag offline
    if (typeof window !== "undefined" && !navigator.onLine) {
      return { status: "offline", syncedAt: new Date().toISOString() };
    }

    // Simulate network write latency
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Return synced confirmation
    return {
      status: "synced",
      syncedAt: new Date().toISOString(),
    };
  }
}

export const syncEngine = DatabaseSyncEngine.getInstance();
