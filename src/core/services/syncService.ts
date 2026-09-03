import { doc, getDoc, setDoc, onSnapshot, Unsubscribe } from "firebase/firestore";
import { Task, Board } from "../types/task";
import { SyncStatus } from "../types/auth";
import { getFirebaseDb, isFirebaseConfigured } from "./firebase";

export interface SyncResult {
  status: SyncStatus;
  syncedAt: string;
  errorMessage?: string;
  isCloudConnected: boolean;
}

/**
 * Helper to ensure tasks are deserialized into an array regardless of whether
 * they were stored in Firestore as an array or a map (object)
 */
export function deserializeTasks(data: any): Task[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === "object") {
    return Object.values(data);
  }
  return [];
}

/**
 * Helper to ensure boards are deserialized into an array regardless of whether
 * they were stored in Firestore as an array or a map (object)
 */
export function deserializeBoards(data: any): Board[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === "object") {
    return Object.values(data);
  }
  return [];
}

/**
 * Converts array of tasks into a Firestore-safe map keyed by task ID
 * to prevent "Property array contains an invalid nested entity" errors caused by nested arrays (e.g. attachments, checklist).
 */
export function serializeTasks(tasks: Task[]): Record<string, Task> {
  const map: Record<string, Task> = {};
  if (Array.isArray(tasks)) {
    tasks.forEach((t) => {
      if (t && t.id) {
        map[t.id] = t;
      }
    });
  }
  return map;
}

/**
 * Converts array of boards into a Firestore-safe map keyed by board ID
 * to prevent "Property array contains an invalid nested entity" errors caused by nested arrays (e.g. columns).
 */
export function serializeBoards(boards: Board[]): Record<string, Board> {
  const map: Record<string, Board> = {};
  if (Array.isArray(boards)) {
    boards.forEach((b) => {
      if (b && b.id) {
        map[b.id] = b;
      }
    });
  }
  return map;
}

/**
 * Recursively replaces `undefined` with `null` or safe defaults to ensure 100% compliance with Firestore serialization
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined) {
    return null as any;
  }
  if (data === null || typeof data !== "object") {
    return data;
  }
  if (data instanceof Date) {
    return data.toISOString() as any;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as any;
  }
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data as Record<string, any>)) {
    if (value !== undefined) {
      result[key] = sanitizeForFirestore(value);
    } else {
      result[key] = null;
    }
  }
  return result as T;
}

export class DatabaseSyncEngine {

  private static instance: DatabaseSyncEngine;
  private isOnline: boolean = true;
  private isManualOffline: boolean = false;
  private unsubscribeSnapshot: Unsubscribe | null = null;
  private activeUserId: string | null = null;

  private constructor() {
    if (typeof window !== "undefined") {
      this.isOnline = navigator.onLine;
      window.addEventListener("online", () => {
        this.isOnline = true;
      });
      window.addEventListener("offline", () => {
        this.isOnline = false;
      });
    }
  }

  public static getInstance(): DatabaseSyncEngine {
    if (!DatabaseSyncEngine.instance) {
      DatabaseSyncEngine.instance = new DatabaseSyncEngine();
    }
    return DatabaseSyncEngine.instance;
  }

  public setManualOffline(offline: boolean): void {
    this.isManualOffline = offline;
  }

  public isOfflineMode(): boolean {
    return this.isManualOffline || !this.isOnline;
  }

  public isCloudAvailable(): boolean {
    return isFirebaseConfigured() && this.isOnline && !this.isManualOffline;
  }

  /**
   * Save user boards and tasks to Firestore
   */
  public async syncTasksToCloud(
    userId: string,
    tasks: Task[],
    boards: Board[],
    activeBoardId?: string
  ): Promise<SyncResult> {
    const isCloud = isFirebaseConfigured();
    const now = new Date().toISOString();

    if (this.isOfflineMode() || (typeof window !== "undefined" && !navigator.onLine)) {
      return {
        status: "offline",
        syncedAt: now,
        isCloudConnected: false,
      };
    }

    if (!isCloud || !userId || userId.startsWith("guest-") || userId.startsWith("guest_")) {
      // Local simulated mock cloud persistence
      if (typeof window !== "undefined" && userId && !userId.startsWith("guest")) {
        try {
          localStorage.setItem(
            `vk_cloud_user_${userId}`,
            JSON.stringify({ userId, boards, tasks, activeBoardId, updatedAt: now })
          );
        } catch {}
      }
      await new Promise((resolve) => setTimeout(resolve, 150));
      const isActuallyOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
      return {
        status: isActuallyOnline ? "synced" : "offline",
        syncedAt: now,
        isCloudConnected: isActuallyOnline,
      };
    }

    try {
      const db = getFirebaseDb();
      if (!db) {
        throw new Error("Firestore instance not initialized");
      }

      const userDocRef = doc(db, "users", userId);
      await setDoc(
        userDocRef,
        sanitizeForFirestore({
          userId,
          boards: serializeBoards(boards),
          tasks: serializeTasks(tasks),
          activeBoardId: activeBoardId || "board-work",
          updatedAt: now,
        }),
        { merge: true }
      );

      // Also update local cloud cache
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(
            `vk_cloud_user_${userId}`,
            JSON.stringify({ userId, boards, tasks, activeBoardId, updatedAt: now })
          );
        } catch {}
      }

      return {
        status: "synced",
        syncedAt: now,
        isCloudConnected: true,
      };
    } catch (error: any) {
      console.error("Firestore sync error:", error);
      return {
        status: "error",
        syncedAt: now,
        errorMessage: error.message || "雲端同步失敗",
        isCloudConnected: true,
      };
    }
  }

  /**
   * Fetch authoritative user data directly from Firestore or Cloud Storage (Database is source of truth)
   */
  public async fetchUserDataFromCloud(
    userId: string
  ): Promise<{ boards: Board[]; tasks: Task[]; activeBoardId?: string } | null> {
    if (!userId || userId.startsWith("guest-") || userId.startsWith("guest_")) {
      return null;
    }

    // 1. Try Firebase Firestore
    if (isFirebaseConfigured()) {
      try {
        const db = getFirebaseDb();
        if (db) {
          const userDocRef = doc(db, "users", userId);
          const snapshot = await getDoc(userDocRef);

          if (snapshot.exists()) {
            const data = snapshot.data();
            const boards = deserializeBoards(data.boards);
            const tasks = deserializeTasks(data.tasks);
            return {
              boards,
              tasks,
              activeBoardId: data.activeBoardId || (boards && boards[0]?.id) || "board-work",
            };
          }
        }
      } catch (error) {
        console.warn("Failed to fetch authoritative user data from Firestore, checking cache:", error);
      }
    }

    // 2. Fallback / Mock Storage for simulated accounts
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(`vk_cloud_user_${userId}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          return {
            boards: deserializeBoards(parsed.boards),
            tasks: deserializeTasks(parsed.tasks),
            activeBoardId: parsed.activeBoardId || "board-work",
          };
        }
      } catch {}
    }

    return null;
  }

  /**
   * Auto-Merge local guest tasks and boards with remote cloud data upon explicit guest binding
   */
  public async mergeLocalDataToCloud(
    userId: string,
    localTasks: Task[],
    localBoards: Board[],
    localActiveBoardId?: string
  ): Promise<{ boards: Board[]; tasks: Task[]; activeBoardId?: string }> {
    if (!isFirebaseConfigured() || !userId || userId === "guest-user") {
      return {
        boards: localBoards,
        tasks: localTasks,
        activeBoardId: localActiveBoardId,
      };
    }

    try {
      const db = getFirebaseDb();
      if (!db) {
        return {
          boards: localBoards,
          tasks: localTasks,
          activeBoardId: localActiveBoardId,
        };
      }

      const userDocRef = doc(db, "users", userId);
      const snapshot = await getDoc(userDocRef);

      if (!snapshot.exists()) {
        // No remote data yet -> initial upload of local data
        await setDoc(
          userDocRef,
          sanitizeForFirestore({
            userId,
            boards: serializeBoards(localBoards),
            tasks: serializeTasks(localTasks),
            activeBoardId: localActiveBoardId || "board-work",
            updatedAt: new Date().toISOString(),
          })
        );
        return {
          boards: localBoards,
          tasks: localTasks,
          activeBoardId: localActiveBoardId,
        };
      }

      const remoteData = snapshot.data();
      const remoteBoards: Board[] = deserializeBoards(remoteData.boards);
      const remoteTasks: Task[] = deserializeTasks(remoteData.tasks);

      // Merge Boards by ID
      const boardMap = new Map<string, Board>();
      remoteBoards.forEach((b) => boardMap.set(b.id, b));
      localBoards.forEach((b) => {
        if (!boardMap.has(b.id)) {
          boardMap.set(b.id, b);
        }
      });
      const mergedBoards = Array.from(boardMap.values());

      // Merge Tasks by ID (latest updatedAt wins)
      const taskMap = new Map<string, Task>();
      remoteTasks.forEach((t) => taskMap.set(t.id, t));
      localTasks.forEach((localTask) => {
        const existing = taskMap.get(localTask.id);
        if (!existing) {
          taskMap.set(localTask.id, localTask);
        } else {
          const remoteTime = new Date(existing.updatedAt || 0).getTime();
          const localTime = new Date(localTask.updatedAt || 0).getTime();
          if (localTime >= remoteTime) {
            taskMap.set(localTask.id, localTask);
          }
        }
      });
      const mergedTasks = Array.from(taskMap.values());

      const activeBoardId =
        remoteData.activeBoardId || localActiveBoardId || mergedBoards[0]?.id || "board-work";

      // Save merged copy to Cloud
      await setDoc(
        userDocRef,
        sanitizeForFirestore({
          userId,
          boards: serializeBoards(mergedBoards),
          tasks: serializeTasks(mergedTasks),
          activeBoardId,
          updatedAt: new Date().toISOString(),
        }),
        { merge: true }
      );

      return {
        boards: mergedBoards,
        tasks: mergedTasks,
        activeBoardId,
      };
    } catch (error) {
      console.warn("Auto-merge failed, falling back to local:", error);
      return {
        boards: localBoards,
        tasks: localTasks,
        activeBoardId: localActiveBoardId,
      };
    }
  }

  /**
   * Subscribe to real-time updates from Cloud Firestore for cross-device sync
   */
  public subscribeToUserData(
    userId: string,
    onUpdate: (data: { boards: Board[]; tasks: Task[]; activeBoardId?: string }) => void,
    onError?: (error: any) => void
  ): () => void {
    // Unsubscribe existing listener if any
    this.unsubscribe();

    if (!isFirebaseConfigured() || !userId || userId === "guest-user") {
      return () => {};
    }

    const db = getFirebaseDb();
    if (!db) return () => {};

    this.activeUserId = userId;
    const userDocRef = doc(db, "users", userId);

    this.unsubscribeSnapshot = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          onUpdate({
            boards: deserializeBoards(data.boards),
            tasks: deserializeTasks(data.tasks),
            activeBoardId: data.activeBoardId,
          });
        }
      },
      (error) => {
        console.error("Firestore real-time subscription error:", error);
        if (onError) onError(error);
      }
    );

    return () => this.unsubscribe();
  }

  /**
   * Unsubscribe listener
   */
  public unsubscribe(): void {
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
      this.unsubscribeSnapshot = null;
    }
    this.activeUserId = null;
  }
}

export const syncEngine = DatabaseSyncEngine.getInstance();
