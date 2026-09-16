import { doc, getDoc, setDoc, onSnapshot, runTransaction, Unsubscribe } from "firebase/firestore";
import { Task, Board } from "../types/task";
import { SyncStatus } from "../types/auth";
import { getFirebaseDb, isFirebaseConfigured } from "./firebase";

export interface SyncResult {
  status: SyncStatus;
  syncedAt: string;
  errorMessage?: string;
  isCloudConnected: boolean;
  boards?: Board[];
  tasks?: Task[];
  activeBoardId?: string;
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

/**
 * Merges two task lists by ID, keeping whichever copy of each task has the
 * newer `updatedAt` timestamp. Tasks that only exist on one side are kept as-is.
 */
export function mergeTasksByUpdatedAt(remoteTasks: Task[], localTasks: Task[]): Task[] {
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
  return Array.from(taskMap.values());
}

/**
 * Merges two board lists by ID for a regular (non-bind) sync push. Boards have
 * no `updatedAt` field, so we can't tell which copy is newer — the local copy is
 * assumed authoritative since it reflects the edits the active device just made,
 * and any remote-only boards (e.g. created on another device) are kept too.
 */
export function mergeBoardsPreferLocal(remoteBoards: Board[], localBoards: Board[]): Board[] {
  const boardMap = new Map<string, Board>();
  remoteBoards.forEach((b) => boardMap.set(b.id, b));
  localBoards.forEach((b) => boardMap.set(b.id, b));
  return Array.from(boardMap.values());
}

/**
 * Applies a sync's server-merged `result` without losing local work done while that sync was in
 * flight. `sent` is the exact array the sync pushed: any local task that isn't one of those objects
 * was created or edited since (store updates always produce new objects) and is merged in by
 * `updatedAt`; any sent task that's gone locally, or tombstoned, was deleted since and stays gone.
 */
export function reconcileSyncedTasks(
  resultTasks: Task[],
  sentTasks: Task[],
  localTasks: Task[],
  localDeletedIds: Record<string, string>
): Task[] {
  const sentRefs = new Set(sentTasks);
  const sentIds = new Set(sentTasks.map((t) => t.id));
  const localIds = new Set(localTasks.map((t) => t.id));
  const fromResult = resultTasks.filter(
    (t) => !localDeletedIds[t.id] && (localIds.has(t.id) || !sentIds.has(t.id))
  );
  return mergeTasksByUpdatedAt(fromResult, localTasks.filter((t) => !sentRefs.has(t)));
}

/** Board counterpart of reconcileSyncedTasks; boards have no `updatedAt`, so local edits win. */
export function reconcileSyncedBoards(
  resultBoards: Board[],
  sentBoards: Board[],
  localBoards: Board[],
  localDeletedIds: Record<string, string>
): Board[] {
  const sentRefs = new Set(sentBoards);
  const sentIds = new Set(sentBoards.map((b) => b.id));
  const localIds = new Set(localBoards.map((b) => b.id));
  const fromResult = resultBoards.filter(
    (b) => !localDeletedIds[b.id] && (localIds.has(b.id) || !sentIds.has(b.id))
  );
  return mergeBoardsPreferLocal(fromResult, localBoards.filter((b) => !sentRefs.has(b)));
}

/** Drops only the tombstones a sync actually sent, keeping ones recorded while it was in flight. */
export function withoutSyncedTombstones(
  current: Record<string, string>,
  sent: Record<string, string>
): Record<string, string> {
  return Object.fromEntries(Object.entries(current).filter(([id]) => !(id in sent)));
}

export class DatabaseSyncEngine {

  private static instance: DatabaseSyncEngine;
  private isOnline: boolean = true;
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

  public isOfflineMode(): boolean {
    return !this.isOnline;
  }

  public isCloudAvailable(): boolean {
    return isFirebaseConfigured() && this.isOnline;
  }

  /**
   * Save user boards and tasks to Firestore
   */
  public async syncTasksToCloud(
    userId: string,
    tasks: Task[],
    boards: Board[],
    activeBoardId?: string,
    deletedTaskIds: Record<string, string> = {},
    deletedBoardIds: Record<string, string> = {}
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

      // Read-merge-write inside a transaction: a blind setDoc here would let a
      // stale local snapshot (e.g. reloaded from an old localStorage cache right
      // as the device reconnects) clobber newer data another device already
      // wrote to Firestore. Merging by per-task `updatedAt` keeps whichever
      // copy is actually newest instead of unconditionally trusting local state.
      const merged = await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(userDocRef);
        const remoteData = snapshot.exists() ? snapshot.data() : null;
        const remoteBoards = remoteData ? deserializeBoards(remoteData.boards) : [];
        const remoteTasks = remoteData ? deserializeTasks(remoteData.tasks) : [];

        // Tombstones from both sides: a task/board absent from `tasks`/`boards`
        // just means this device doesn't know about it (could be new from
        // another device) unless its ID is tombstoned here, in which case it was
        // deliberately deleted and must not be resurrected by the ID union below.
        const mergedDeletedTaskIds = { ...(remoteData?.deletedTaskIds || {}), ...deletedTaskIds };
        const mergedDeletedBoardIds = { ...(remoteData?.deletedBoardIds || {}), ...deletedBoardIds };

        const mergedTasks = mergeTasksByUpdatedAt(remoteTasks, tasks).filter(
          (t) => !mergedDeletedTaskIds[t.id]
        );
        const mergedBoards = mergeBoardsPreferLocal(remoteBoards, boards).filter(
          (b) => !mergedDeletedBoardIds[b.id]
        );
        const mergedActiveBoardId =
          activeBoardId || remoteData?.activeBoardId || mergedBoards[0]?.id || "board-work";

        transaction.set(
          userDocRef,
          sanitizeForFirestore({
            userId,
            boards: serializeBoards(mergedBoards),
            tasks: serializeTasks(mergedTasks),
            activeBoardId: mergedActiveBoardId,
            deletedTaskIds: mergedDeletedTaskIds,
            deletedBoardIds: mergedDeletedBoardIds,
            updatedAt: now,
          })
        );

        return { boards: mergedBoards, tasks: mergedTasks, activeBoardId: mergedActiveBoardId };
      });

      // Also update local cloud cache
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(
            `vk_cloud_user_${userId}`,
            JSON.stringify({ userId, ...merged, updatedAt: now })
          );
        } catch {}
      }

      return {
        status: "synced",
        syncedAt: now,
        isCloudConnected: true,
        boards: merged.boards,
        tasks: merged.tasks,
        activeBoardId: merged.activeBoardId,
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
      const mergedTasks = mergeTasksByUpdatedAt(remoteTasks, localTasks);

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
        })
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
