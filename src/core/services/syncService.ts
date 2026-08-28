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
    activeBoardId?: string
  ): Promise<SyncResult> {
    const isCloud = isFirebaseConfigured();
    const now = new Date().toISOString();

    if (typeof window !== "undefined" && !navigator.onLine) {
      return {
        status: "offline",
        syncedAt: now,
        isCloudConnected: isCloud,
      };
    }

    if (!isCloud || !userId || userId === "guest-user") {
      // Local simulated mode
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        status: "synced",
        syncedAt: now,
        isCloudConnected: false,
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
        {
          userId,
          boards,
          tasks,
          activeBoardId: activeBoardId || "board-work",
          updatedAt: now,
        },
        { merge: true }
      );

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
   * Auto-Merge local guest tasks and boards with remote cloud data upon login
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
        await setDoc(userDocRef, {
          userId,
          boards: localBoards,
          tasks: localTasks,
          activeBoardId: localActiveBoardId || "board-work",
          updatedAt: new Date().toISOString(),
        });
        return {
          boards: localBoards,
          tasks: localTasks,
          activeBoardId: localActiveBoardId,
        };
      }

      const remoteData = snapshot.data();
      const remoteBoards: Board[] = remoteData.boards || [];
      const remoteTasks: Task[] = remoteData.tasks || [];

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
        {
          userId,
          boards: mergedBoards,
          tasks: mergedTasks,
          activeBoardId,
          updatedAt: new Date().toISOString(),
        },
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
            boards: data.boards || [],
            tasks: data.tasks || [],
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
