import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import { Board, Column, ColumnId, Priority, Task, TaskLink, ViewMode, DEFAULT_COLUMNS, ChecklistItem, TaskAttachment, BoardMember, CollaboratorRole } from "../types/task";
import { VoiceExtractResult, VoiceState, VoiceLanguage } from "../types/voice";
import { BYOKConfig } from "../types/user";
import { UserSession, SyncState, AuthProvider } from "../types/auth";
import { INITIAL_BOARDS, INITIAL_TASKS } from "../services/mockData";
import { generateOrderKeyBetween, initialOrderKey } from "../utils/lexorank";
import { GUEST_USER } from "../services/guestUser";
import { getUserRole, canUserEdit } from "@/features/collaboration/utils/roles";
import { NotificationItem, ActivityPayload, NotificationActionType } from "@/features/notifications/types";
import { notificationService } from "@/features/notifications/services/notificationService";
import { SharedLinkDraft } from "@/features/bookmarks/types";
import { PLATFORM_META, createCollectionBoard, findCollectionBoard } from "@/features/bookmarks/constants";
import { savePendingShare } from "@/features/bookmarks/services/pendingShareStorage";
import { fetchLinkPreview, needsThumbnailRehost, persistThumbnail } from "@/features/bookmarks/services/linkPreviewService";
import { detectPlatform, isBareUrl, normalizeSharedUrl, toCardTitle } from "@/features/bookmarks/utils/linkParser";
import { buildLinkDescription } from "@/features/bookmarks/utils/linkDescription";
import { ColumnTransferMode, canTransferColumn } from "@/features/kanban/utils/columnTransfer";

/**
 * Firebase Auth + Firestore is by far the heaviest dependency in the app, and nothing needs it
 * until after the first paint (auth/sync start inside an effect, collaboration only on a shared
 * board). Loading these three modules on demand keeps the SDK out of the first-paint bundle.
 * Everything the render path needs synchronously — GUEST_USER, role checks — is imported above
 * from Firebase-free modules.
 */
const loadAuth = () => import("../services/authService");
const loadSync = () => import("../services/syncService");
const loadCollab = () => import("@/features/collaboration/services/collaborationService");

interface KanbanStoreState {
  // Notifications
  notifications: NotificationItem[];
  isBrowserNotificationEnabled: boolean;
  setIsBrowserNotificationEnabled: (enabled: boolean) => void;
  activeToasts: NotificationItem[];
  addNotification: (activity: ActivityPayload) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;
  dismissToast: (id: string) => void;
  emitActivity: (
    actionType: NotificationActionType,
    data: {
      boardId: string;
      taskId?: string;
      taskTitle?: string;
      sourceColumnTitle?: string;
      targetColumnTitle?: string;
    }
  ) => void;

  // Authentication & Profile
  userSession: UserSession;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isBindModalOpen: boolean;
  setIsBindModalOpen: (open: boolean) => void;
  loginAsGuest: () => Promise<void>;
  bindGuestAccount: (
    provider: AuthProvider,
    email?: string,
    password?: string,
    displayName?: string,
    isRegister?: boolean
  ) => Promise<void>;
  login: (
    provider: AuthProvider,
    email?: string,
    password?: string,
    displayName?: string,
    isRegister?: boolean
  ) => Promise<void>;
  logout: () => Promise<void>;
  initAuthAndSync: () => () => void;

  // Cloud Sync & Offline Mode
  syncState: SyncState;
  triggerSync: () => Promise<void>;
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  pendingOfflineChanges: number;
  incrementPendingOfflineChanges: () => void;
  clearPendingOfflineChanges: () => void;
  isOfflineBannerDismissed: boolean;
  setIsOfflineBannerDismissed: (dismissed: boolean) => void;
  // Tombstones for tasks/boards deleted locally but not yet confirmed removed from
  // the cloud, so a merge-based sync doesn't resurrect them from a stale remote copy
  pendingDeletedTaskIds: Record<string, string>;
  pendingDeletedBoardIds: Record<string, string>;

  // View Mode (Kanban / Table / List / Calendar)
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Sidebar Inbox State
  isInboxSidebarOpen: boolean;
  setIsInboxSidebarOpen: (open: boolean) => void;
  inboxWidth: number;
  setInboxWidth: (width: number) => void;
  isDraggingSplitter: boolean;
  setIsDraggingSplitter: (isDragging: boolean) => void;
  addToInbox: (title: string, description?: string) => Task;

  // Boards & Dynamic Columns
  boards: Board[];
  activeBoardId: string;
  setActiveBoardId: (id: string) => void;
  createBoard: (name: string, icon?: string, description?: string) => void;
  updateBoard: (boardId: string, partial: Partial<Pick<Board, "name" | "icon" | "description" | "background">>) => void;
  deleteBoard: (boardId: string) => void;
  deletingBoardId: string | null;
  setDeletingBoardId: (id: string | null) => void;
  getActiveBoardColumns: () => Column[];
  addColumnToActiveBoard: (title: string, icon?: string, color?: string) => void;
  updateColumnInActiveBoard: (columnId: string, title?: string, icon?: string) => void;
  setColumnColor: (columnId: string, color: string) => void;
  deleteColumnFromActiveBoard: (columnId: string) => void;
  sortColumnTasks: (columnId: string, sortBy: "date" | "priority" | "title") => void;
  moveAllColumnTasks: (sourceColumnId: string, targetColumnId: string) => void;
  reorderBoardColumns: (boardId: string, orderedColumns: Column[]) => void;
  archiveColumn: (columnId: string) => void;
  expandTaskToColumn: (taskId: string) => void;
  aggregateColumnToTask: (columnId: string) => void;
  /** Moves or copies a column of the active board, with its cards, to another board. Resolves to the new column id, or null if not allowed. */
  transferColumnToBoard: (columnId: string, targetBoardId: string, mode: ColumnTransferMode) => Promise<string | null>;

  // Bookmarks (收藏): links shared in from IG / YouTube / Threads
  pendingShare: SharedLinkDraft | null;
  setPendingShare: (draft: SharedLinkDraft | null) => void;
  ensureCollectionBoard: () => Board;
  openCollectionBoard: () => void;
  saveLinkToCollection: (input: { title: string; note?: string; link: TaskLink }) => Task;
  /** Tasks whose URL title is being expanded into title / image / content (not persisted). */
  enrichingTaskIds: Record<string, true>;
  enrichTaskFromLink: (taskId: string) => Promise<void>;
  rehostTaskThumbnail: (taskId: string) => Promise<void>;

  // Board Manager Modal (workflow columns, general info, sharing, appearance tabs)
  isBoardManagerOpen: boolean;
  setIsBoardManagerOpen: (open: boolean) => void;

  // Collaboration
  isShareBoardModalOpen: boolean;
  setIsShareBoardModalOpen: (open: boolean) => void;
  isJoinBoardModalOpen: boolean;
  setIsJoinBoardModalOpen: (open: boolean) => void;
  joinBoardInitialCode: string;
  setJoinBoardInitialCode: (code: string) => void;
  enableActiveBoardSharing: () => Promise<string>;
  joinBoardByInviteCode: (code: string, nickname?: string) => Promise<{ success: boolean; message?: string; board?: Board }>;
  updateMemberRole: (memberUid: string, role: CollaboratorRole) => Promise<void>;
  removeMemberFromBoard: (memberUid: string) => Promise<void>;
  getCurrentUserRole: (boardId?: string) => CollaboratorRole;
  canCurrentUserEdit: (boardId?: string) => boolean;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "orderKey"> & { orderKey?: string }) => Task;
  updateTask: (id: string, partial: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  archiveTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  toggleTaskStarred: (id: string) => void;
  moveTask: (taskId: string, targetColumnId: ColumnId, targetIndex: number, skipSync?: boolean) => void;
  reorderColumnTasks: (columnId: ColumnId, boardId: string, orderedTasks: Task[]) => void;

  // Checklist Actions
  addChecklistItem: (taskId: string, title: string) => void;
  updateChecklistItem: (taskId: string, itemId: string, newTitle: string) => void;
  toggleChecklistItem: (taskId: string, itemId: string) => void;
  removeChecklistItem: (taskId: string, itemId: string) => void;
  reorderChecklistItems: (taskId: string, newChecklist: ChecklistItem[]) => void;
  moveChecklistItem: (taskId: string, itemId: string, direction: "up" | "down") => void;

  // Attachment Actions
  addAttachment: (taskId: string, attachment: TaskAttachment) => void;
  removeAttachment: (taskId: string, attachmentId: string) => void;

  // Editing Task Detail Modal
  editingTaskId: string | null;
  setEditingTaskId: (id: string | null) => void;

  // Multi-Select & Batch Operations
  isMultiSelectMode: boolean;
  setIsMultiSelectMode: (mode: boolean) => void;
  selectedTaskIds: string[];
  toggleTaskSelection: (taskId: string) => void;
  selectAllTasksInBoard: () => void;
  selectAllTasksInInbox: () => void;
  clearSelection: () => void;
  batchMoveTasks: (targetColumnId: ColumnId) => void;
  batchDeleteTasks: () => void;
  batchToggleComplete: (completed: boolean) => void;
  batchSetPriority: (priority: Priority) => void;

  // Drag & Drop Live Placement
  activeDragTaskId: string | null;
  setActiveDragTaskId: (id: string | null) => void;
  dragOverLocation: { columnId: ColumnId | "inbox"; index: number } | null;
  setDragOverLocation: (loc: { columnId: ColumnId | "inbox"; index: number } | null) => void;

  // Filters & Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;
  priorityFilter: Priority | "all";
  setPriorityFilter: (priority: Priority | "all") => void;
  tagFilter: string | "all";
  setTagFilter: (tag: string | "all") => void;

  // Modals & UI States
  isVoiceOverlayOpen: boolean;
  setIsVoiceOverlayOpen: (open: boolean) => void;
  voiceState: VoiceState;
  setVoiceState: (state: VoiceState) => void;
  voiceLanguage: VoiceLanguage;
  setVoiceLanguage: (lang: VoiceLanguage) => void;
  voiceTargetColumnId: ColumnId | null;
  setVoiceTargetColumnId: (colId: ColumnId | null) => void;
  openVoiceForColumn: (columnId?: ColumnId) => void;
  extractedTask: VoiceExtractResult | null;
  setExtractedTask: (task: VoiceExtractResult | null) => void;

  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (open: boolean) => void;

  isAddTaskModalOpen: boolean;
  setIsAddTaskModalOpen: (open: boolean) => void;
  addTaskDefaultColumn: ColumnId;
  setAddTaskDefaultColumn: (col: ColumnId) => void;
  openAddTaskModal: (columnId?: ColumnId) => void;

  // BYOK Settings
  byokConfig: BYOKConfig;
  updateBYOKConfig: (partial: Partial<BYOKConfig>) => void;
}

const safeLocalStorage: StateStorage = {
  getItem: (name: string): string | null => {
    try {
      if (typeof window === "undefined") return null;
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      if (typeof window === "undefined") return;
      localStorage.setItem(name, value);
    } catch {
      try {
        localStorage.removeItem("voicekanban-storage-v1");
        localStorage.removeItem("voicekanban-storage-v2");
        localStorage.removeItem("voicekanban-storage-v3");
        localStorage.setItem(name, value);
      } catch {
        // Safely suppress QuotaExceededError
      }
    }
  },
  removeItem: (name: string): void => {
    try {
      if (typeof window === "undefined") return;
      localStorage.removeItem(name);
    } catch {}
  },
};

/** Resolves once the task is in the store, or undefined after the timeout (e.g. it was deleted). */
function waitForTask(taskId: string, timeoutMs = 15000): Promise<Task | undefined> {
  const existing = useKanbanStore.getState().tasks.find((t) => t.id === taskId);
  if (existing) return Promise.resolve(existing);
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      unsubscribe();
      resolve(undefined);
    }, timeoutMs);
    const unsubscribe = useKanbanStore.subscribe((state) => {
      const task = state.tasks.find((t) => t.id === taskId);
      if (task) {
        clearTimeout(timer);
        unsubscribe();
        resolve(task);
      }
    });
  });
}

export const useKanbanStore = create<KanbanStoreState>()(
  persist(
    (set, get) => ({
      // Auth
      userSession: GUEST_USER,
      isAuthModalOpen: false,
      setIsAuthModalOpen: (isAuthModalOpen) => set({ isAuthModalOpen }),
      isBindModalOpen: false,
      setIsBindModalOpen: (isBindModalOpen) => set({ isBindModalOpen }),
      loginAsGuest: async () => {
        const { signInAsGuest } = await loadAuth();
        const existing = get().userSession;
        const currentId = existing?.isGuest && existing?.id ? existing.id : undefined;
        const guestSession = await signInAsGuest(currentId);
        set({ userSession: guestSession, isAuthModalOpen: false, isBindModalOpen: false });
      },
      bindGuestAccount: async (provider, email, password, displayName, isRegister) => {
        const [{ loginWithProvider }, { syncEngine }] = await Promise.all([loadAuth(), loadSync()]);
        const session = await loginWithProvider(provider, email, password, displayName, isRegister);
        const localTasks = get().tasks;
        const localBoards = get().boards;
        const currentBoardId = get().activeBoardId;

        if (session && session.provider !== "guest" && session.id !== "guest-user") {
          // Auto-merge guest data to cloud
          const merged = await syncEngine.mergeLocalDataToCloud(
            session.id,
            localTasks,
            localBoards,
            currentBoardId
          );
          set({
            userSession: session,
            isBindModalOpen: false,
            isAuthModalOpen: false,
            tasks: merged.tasks,
            boards: merged.boards,
            activeBoardId: merged.activeBoardId || currentBoardId,
          });

          // Attach real-time listener
          syncEngine.subscribeToUserData(session.id, (remoteData) => {
            if (remoteData) {
              set((state) => ({
                boards: remoteData.boards && remoteData.boards.length > 0 ? remoteData.boards : state.boards,
                tasks: remoteData.tasks || state.tasks,
                activeBoardId: remoteData.activeBoardId || state.activeBoardId,
                syncState: {
                  status: "synced",
                  lastSyncedAt: new Date().toISOString(),
                  isCloudConnected: true,
                },
              }));
            }
          });
        } else {
          set({ userSession: session, isBindModalOpen: false, isAuthModalOpen: false });
        }

        await get().triggerSync();
      },
      login: async (provider, email, password, displayName, isRegister) => {
        const [{ loginWithProvider }, { syncEngine }] = await Promise.all([loadAuth(), loadSync()]);
        const session = await loginWithProvider(provider, email, password, displayName, isRegister);
        set({ userSession: session, isAuthModalOpen: false, isBindModalOpen: false });

        if (session && session.provider !== "guest" && !session.id.startsWith("guest")) {
          // 資料庫為主 (Database is Source of Truth): 登入時直接拉回資料庫的全部最新資料
          const cloudData = await syncEngine.fetchUserDataFromCloud(session.id);

          if (cloudData) {
            // 雲端資料庫已有資料 -> 立即拉回並完全以資料庫最新資料覆蓋本地
            set({
              tasks: cloudData.tasks || [],
              boards: cloudData.boards && cloudData.boards.length > 0 ? cloudData.boards : INITIAL_BOARDS,
              activeBoardId: cloudData.activeBoardId || (cloudData.boards && cloudData.boards[0]?.id) || "board-work",
              syncState: {
                status: "synced",
                lastSyncedAt: new Date().toISOString(),
                isCloudConnected: syncEngine.isCloudAvailable(),
              },
            });
          } else {
            // 創建新帳號 (或首次使用無既有資料庫記錄) -> 完全乾淨、無任何一筆任務 (0 筆任務)
            const cleanTasks: Task[] = [];
            const cleanBoards: Board[] = INITIAL_BOARDS;
            const cleanActiveBoard = "board-work";

            set({
              tasks: cleanTasks,
              boards: cleanBoards,
              activeBoardId: cleanActiveBoard,
              syncState: {
                status: "synced",
                lastSyncedAt: new Date().toISOString(),
                isCloudConnected: syncEngine.isCloudAvailable(),
              },
            });

            await syncEngine.syncTasksToCloud(
              session.id,
              cleanTasks,
              cleanBoards,
              cleanActiveBoard
            );
          }

          // Attach Real-time Cross-device Listener
          syncEngine.subscribeToUserData(session.id, (remoteData) => {
            if (remoteData) {
              set((state) => ({
                boards: remoteData.boards && remoteData.boards.length > 0 ? remoteData.boards : state.boards,
                tasks: remoteData.tasks || [],
                activeBoardId: remoteData.activeBoardId || state.activeBoardId,
                syncState: {
                  status: "synced",
                  lastSyncedAt: new Date().toISOString(),
                  isCloudConnected: true,
                },
              }));
            }
          });
        }
      },
      logout: async () => {
        const [{ logoutUser }, { syncEngine }] = await Promise.all([loadAuth(), loadSync()]);
        syncEngine.unsubscribe();
        await logoutUser();
        set({
          userSession: { ...GUEST_USER, isAuthenticated: false, isGuest: false, name: "訪客" },
          isAuthModalOpen: false,
          isBindModalOpen: false,
          tasks: [],
          syncState: {
            status: "synced",
            lastSyncedAt: new Date().toISOString(),
            isCloudConnected: false,
          },
        });
      },
      initAuthAndSync: () => {
        // Dynamic Online / Offline Network Listeners
        const handleOnline = () => {
          set((state) => ({
            isOnline: true,
            isOfflineBannerDismissed: false,
            syncState: {
              ...state.syncState,
              status: "synced",
              lastSyncedAt: new Date().toISOString(),
              isCloudConnected: true,
            },
          }));
          get().triggerSync();
        };

        const handleOffline = () => {
          set((state) => ({
            isOnline: false,
            isOfflineBannerDismissed: false,
            syncState: {
              ...state.syncState,
              status: "offline",
              errorMessage: "偵測到本機網路已斷線",
              isCloudConnected: false,
            },
          }));
        };

        if (typeof window !== "undefined") {
          window.addEventListener("online", handleOnline);
          window.addEventListener("offline", handleOffline);
        }

        // Load persisted notifications on start (local storage only, no Firebase involved)
        const initialNotifications = notificationService.loadStoredNotifications();
        if (initialNotifications.length > 0) {
          set({ notifications: initialNotifications });
        }

        // The auth / sync / collaboration subscriptions below all need the Firebase SDK, which is
        // loaded on demand so it never blocks the first paint. The caller still gets a cleanup
        // function synchronously; `disposed` covers unmounting before the SDK finishes loading.
        let unsubscribeAuth: (() => void) | null = null;
        let unsubCollab: (() => void) | null = null;
        let disposed = false;

        void (async () => {
          const [{ subscribeToAuthState }, { syncEngine }, { collaborationService }] = await Promise.all([
            loadAuth(),
            loadSync(),
            loadCollab(),
          ]);
          if (disposed) return;

          unsubscribeAuth = subscribeToAuthState(async (session) => {
          if (session) {
            set({ userSession: session });

            // 資料庫為主：初次載入或重新整理時先拉取雲端最新資料（若在線）
            if (typeof navigator === "undefined" || navigator.onLine) {
              const cloudData = await syncEngine.fetchUserDataFromCloud(session.id);
              if (cloudData) {
                set({
                  boards: cloudData.boards && cloudData.boards.length > 0 ? cloudData.boards : INITIAL_BOARDS,
                  tasks: cloudData.tasks || [],
                  activeBoardId: cloudData.activeBoardId || (cloudData.boards && cloudData.boards[0]?.id) || get().activeBoardId,
                  syncState: {
                    status: "synced",
                    lastSyncedAt: new Date().toISOString(),
                    isCloudConnected: true,
                  },
                });
              }
            } else {
              set((s) => ({
                syncState: {
                  ...s.syncState,
                  status: "offline",
                  isCloudConnected: false,
                },
              }));
            }

            // Attach real-time cloud listener
            syncEngine.subscribeToUserData(session.id, (remoteData) => {
              if (remoteData) {
                set((state) => ({
                  boards: remoteData.boards && remoteData.boards.length > 0 ? remoteData.boards : state.boards,
                  tasks: remoteData.tasks || [],
                  activeBoardId: remoteData.activeBoardId || state.activeBoardId,
                  syncState: {
                    status: typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "synced",
                    lastSyncedAt: new Date().toISOString(),
                    isCloudConnected: true,
                  },
                }));
              }
            });
          }
        });

          // Cross-tab real-time sync for shared boards via BroadcastChannel
          unsubCollab = collaborationService.onCrossTabUpdate(({ type, boardId, data }) => {
          if (type === "ACTIVITY_EVENT" && data?.activity) {
            get().addNotification(data.activity);
          }

          if (type === "BOARD_UPDATED" && data) {
            set((state) => {
              let updatedBoards = state.boards;
              if (data.board) {
                const exists = updatedBoards.some((b) => b.id === boardId);
                if (exists) {
                  updatedBoards = updatedBoards.map((b) => (b.id === boardId ? { ...b, ...data.board } : b));
                } else {
                  updatedBoards = [...updatedBoards, data.board];
                }
              }
              let updatedTasks = state.tasks;
              if (data.tasks && Array.isArray(data.tasks)) {
                const otherTasks = state.tasks.filter((t) => t.boardId !== boardId);
                updatedTasks = [...otherTasks, ...data.tasks];
              }
              return {
                boards: updatedBoards,
                tasks: updatedTasks,
              };
            });

            if (data.recentActivities && Array.isArray(data.recentActivities)) {
              data.recentActivities.forEach((act: ActivityPayload) => {
                get().addNotification(act);
              });
            }
          }
          });
        })();

        return () => {
          disposed = true;
          if (typeof window !== "undefined") {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
          }
          unsubscribeAuth?.();
          unsubCollab?.();
          void loadSync().then(({ syncEngine }) => syncEngine.unsubscribe());
        };
      },

      // Cloud Sync & Offline State
      syncState: {
        status: typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "synced",
        lastSyncedAt: new Date().toISOString(),
        isCloudConnected: typeof navigator !== "undefined" ? navigator.onLine : true,
      },
      isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
      setIsOnline: (isOnline) => {
        set({ isOnline });
        if (isOnline) {
          get().triggerSync();
        }
      },
      pendingOfflineChanges: 0,
      incrementPendingOfflineChanges: () =>
        set((s) => ({ pendingOfflineChanges: s.pendingOfflineChanges + 1 })),
      clearPendingOfflineChanges: () => set({ pendingOfflineChanges: 0 }),
      isOfflineBannerDismissed: false,
      setIsOfflineBannerDismissed: (isOfflineBannerDismissed) => set({ isOfflineBannerDismissed }),
      pendingDeletedTaskIds: {},
      pendingDeletedBoardIds: {},

      triggerSync: async () => {
        const user = get().userSession;
        const isOffline = typeof navigator !== "undefined" && !navigator.onLine;

        if (isOffline) {
          set((s) => ({
            pendingOfflineChanges: s.pendingOfflineChanges + 1,
            syncState: {
              ...s.syncState,
              status: "offline",
              isCloudConnected: false,
            },
          }));
          return;
        }

        set((s) => ({ syncState: { ...s.syncState, status: "syncing" } }));
        const { syncEngine, reconcileSyncedTasks, reconcileSyncedBoards, withoutSyncedTombstones } = await loadSync();
        const currentActiveBoard = get().boards.find((b) => b.id === get().activeBoardId);
        if (currentActiveBoard?.isShared) {
          const { collaborationService } = await loadCollab();
          collaborationService.syncSharedBoardData(currentActiveBoard, get().tasks);
        }

        // Capture exactly what this sync sends, so edits made while it's in flight (e.g. a link
        // card's preview landing a second later) aren't overwritten when the result comes back.
        const sentTasks = get().tasks;
        const sentBoards = get().boards;
        const sentDeletedTaskIds = get().pendingDeletedTaskIds;
        const sentDeletedBoardIds = get().pendingDeletedBoardIds;
        const result = await syncEngine.syncTasksToCloud(
          user.id,
          sentTasks,
          sentBoards,
          get().activeBoardId,
          sentDeletedTaskIds,
          sentDeletedBoardIds
        );
        set((state) => ({
          // Adopt the server-merged result so any newer data pulled in during
          // the merge (e.g. tasks/boards written by another device) is reflected
          // locally too, instead of only living in Firestore until the next fetch.
          tasks: result.tasks
            ? reconcileSyncedTasks(result.tasks, sentTasks, state.tasks, state.pendingDeletedTaskIds)
            : state.tasks,
          boards:
            result.boards && result.boards.length > 0
              ? reconcileSyncedBoards(result.boards, sentBoards, state.boards, state.pendingDeletedBoardIds)
              : state.boards,
          activeBoardId: result.activeBoardId || state.activeBoardId,
          pendingOfflineChanges: result.status === "synced" ? 0 : state.pendingOfflineChanges,
          // Once synced, the sent deletions are recorded in the cloud's own tombstone list, so this
          // device no longer needs them — but deletions made during the sync still have to go out.
          pendingDeletedTaskIds:
            result.status === "synced"
              ? withoutSyncedTombstones(state.pendingDeletedTaskIds, sentDeletedTaskIds)
              : state.pendingDeletedTaskIds,
          pendingDeletedBoardIds:
            result.status === "synced"
              ? withoutSyncedTombstones(state.pendingDeletedBoardIds, sentDeletedBoardIds)
              : state.pendingDeletedBoardIds,
          syncState: {
            status: result.status,
            lastSyncedAt: result.syncedAt,
            errorMessage: result.errorMessage,
            isCloudConnected: result.isCloudConnected,
          },
        }));
      },

      // View Mode
      viewMode: "kanban",
      setViewMode: (viewMode) => set({ viewMode }),

      // Sidebar Inbox
      isInboxSidebarOpen: true,
      setIsInboxSidebarOpen: (isInboxSidebarOpen) => set({ isInboxSidebarOpen }),
      inboxWidth: 320,
      setInboxWidth: (inboxWidth) => set({ inboxWidth }),
      isDraggingSplitter: false,
      setIsDraggingSplitter: (isDraggingSplitter) => set({ isDraggingSplitter }),
      addToInbox: (title, description = "") => {
        return get().addTask({
          title,
          description,
          boardId: "global",
          columnId: "inbox",
          tags: [],
          dueDate: null,
          completed: false,
        });
      },

      // Boards & Dynamic Columns
      boards: INITIAL_BOARDS,
      activeBoardId: "board-work",
      setActiveBoardId: (id) => {
        set({ activeBoardId: id, selectedTaskIds: [] });
        const targetBoard = get().boards.find((b) => b.id === id);
        if (targetBoard?.isShared) {
          void loadCollab().then(({ collaborationService }) =>
            collaborationService.subscribeToSharedBoard(targetBoard.shareId || id, ({ board, tasks: remoteTasks }) => {
            set((state) => ({
              boards: state.boards.map((b) => (b.id === id ? { ...b, ...board } : b)),
              tasks: [
                ...state.tasks.filter((t) => t.boardId !== id),
                ...remoteTasks,
              ],
            }));
            })
          );
        }
      },
      createBoard: (name, icon = "📌", description = "") => {
        const newBoard: Board = {
          id: `board-${Date.now()}`,
          name,
          icon,
          description,
          columns: DEFAULT_COLUMNS,
        };
        set((state) => ({
          boards: [...state.boards, newBoard],
          activeBoardId: newBoard.id,
        }));
        get().triggerSync();
      },

      updateBoard: (boardId, partial) => {
        set((state) => ({
          boards: state.boards.map((b) =>
            b.id === boardId
              ? {
                  ...b,
                  name: partial.name !== undefined && partial.name.trim() ? partial.name.trim() : b.name,
                  icon: partial.icon !== undefined ? partial.icon : b.icon,
                  description: partial.description !== undefined ? partial.description : b.description,
                  background: partial.background !== undefined ? partial.background : b.background,
                }
              : b
          ),
        }));
        get().triggerSync();
      },

      deleteBoard: (boardId) => {
        const { boards, activeBoardId, tasks } = get();
        if (boards.length <= 1) return; // Must keep at least one board

        const remainingBoards = boards.filter((b) => b.id !== boardId);
        const newActiveBoardId = activeBoardId === boardId ? remainingBoards[0].id : activeBoardId;
        const removedTasks = tasks.filter((t) => t.boardId === boardId);
        const remainingTasks = tasks.filter((t) => t.boardId !== boardId);
        const now = new Date().toISOString();

        set((state) => ({
          boards: remainingBoards,
          activeBoardId: newActiveBoardId,
          tasks: remainingTasks,
          selectedTaskIds: [],
          pendingDeletedBoardIds: { ...state.pendingDeletedBoardIds, [boardId]: now },
          pendingDeletedTaskIds: removedTasks.reduce(
            (acc, t) => ({ ...acc, [t.id]: now }),
            state.pendingDeletedTaskIds
          ),
        }));
        get().triggerSync();
      },

      deletingBoardId: null,
      setDeletingBoardId: (deletingBoardId) => set({ deletingBoardId }),

      getActiveBoardColumns: () => {
        const { boards, activeBoardId } = get();
        const activeBoard = boards.find((b) => b.id === activeBoardId);
        const rawColumns =
          activeBoard?.columns && activeBoard.columns.length > 0
            ? activeBoard.columns
            : DEFAULT_COLUMNS;
        return rawColumns.filter((c) => !c.isArchived && c.id !== "inbox");
      },

      addColumnToActiveBoard: (title, icon = "✨", color = "#3b82f6") => {
        const { boards, activeBoardId } = get();
        const currentColumns = get().getActiveBoardColumns();
        const newColumn: Column = {
          id: `col-${Date.now()}`,
          title,
          icon,
          color,
          isCustom: true,
        };

        const updatedBoards = boards.map((b) =>
          b.id === activeBoardId ? { ...b, columns: [...currentColumns, newColumn] } : b
        );

        set({ boards: updatedBoards });
        get().triggerSync();
      },

      updateColumnInActiveBoard: (columnId, title, icon) => {
        const { boards, activeBoardId } = get();
        const currentColumns = get().getActiveBoardColumns();
        const updatedColumns = currentColumns.map((col) =>
          col.id === columnId
            ? {
                ...col,
                title: title !== undefined && title.trim() ? title.trim() : col.title,
                icon: icon !== undefined ? icon : col.icon,
              }
            : col
        );

        set({
          boards: boards.map((b) =>
            b.id === activeBoardId ? { ...b, columns: updatedColumns } : b
          ),
        });
        get().triggerSync();
      },

      setColumnColor: (columnId, color) => {
        const { boards, activeBoardId } = get();
        const currentColumns = get().getActiveBoardColumns();
        const updatedColumns = currentColumns.map((col) =>
          col.id === columnId ? { ...col, color } : col
        );

        set({
          boards: boards.map((b) =>
            b.id === activeBoardId ? { ...b, columns: updatedColumns } : b
          ),
        });
        get().triggerSync();
      },

      deleteColumnFromActiveBoard: (columnId) => {
        const { boards, activeBoardId, tasks } = get();
        const currentColumns = get().getActiveBoardColumns();
        if (currentColumns.length <= 1) return;

        const remainingColumns = currentColumns.filter((col) => col.id !== columnId);
        const fallbackColId = remainingColumns[0].id;

        const updatedTasks = tasks.map((t) =>
          t.boardId === activeBoardId && t.columnId === columnId
            ? { ...t, columnId: fallbackColId, updatedAt: new Date().toISOString() }
            : t
        );

        set({
          boards: boards.map((b) =>
            b.id === activeBoardId ? { ...b, columns: remainingColumns } : b
          ),
          tasks: updatedTasks,
        });
        get().triggerSync();
      },

      sortColumnTasks: (columnId, sortBy) => {
        const { tasks, activeBoardId } = get();
        const colTasks = tasks.filter((t) => t.boardId === activeBoardId && t.columnId === columnId);
        const otherTasks = tasks.filter((t) => !(t.boardId === activeBoardId && t.columnId === columnId));

        colTasks.sort((a, b) => {
          if (sortBy === "date") {
            const dA = a.dueDate ? new Date(a.dueDate).getTime() : 9999999999999;
            const dB = b.dueDate ? new Date(b.dueDate).getTime() : 9999999999999;
            return dA - dB;
          }
          if (sortBy === "priority") {
            const weight: Record<string, number> = { high: 3, medium: 2, low: 1 };
            const wa = a.isStarred ? 4 : (a.priority ? weight[a.priority] || 0 : 0);
            const wb = b.isStarred ? 4 : (b.priority ? weight[b.priority] || 0 : 0);
            return wb - wa;
          }
          return a.title.localeCompare(b.title);
        });

        // Reassign order keys using clean base36 Lexorank initial keys
        const sortedColTasks = colTasks.map((t, idx) => ({
          ...t,
          orderKey: initialOrderKey(idx),
        }));

        set({ tasks: [...otherTasks, ...sortedColTasks] });
        get().triggerSync();
      },

      moveAllColumnTasks: (sourceColumnId, targetColumnId) => {
        const { tasks, activeBoardId } = get();
        set({
          tasks: tasks.map((t) =>
            t.boardId === activeBoardId && t.columnId === sourceColumnId
              ? { ...t, columnId: targetColumnId, updatedAt: new Date().toISOString() }
              : t
          ),
        });
        get().triggerSync();
      },

      reorderBoardColumns: (boardId, orderedColumns) => {
        const { boards } = get();
        set({
          boards: boards.map((b) =>
            b.id === boardId ? { ...b, columns: orderedColumns } : b
          ),
        });
        get().triggerSync();
      },

      archiveColumn: (columnId) => {
        const { boards, activeBoardId } = get();
        const currentColumns = get().getActiveBoardColumns();
        const updatedColumns = currentColumns.map((col) =>
          col.id === columnId ? { ...col, isArchived: true } : col
        );

        set({
          boards: boards.map((b) =>
            b.id === activeBoardId ? { ...b, columns: updatedColumns } : b
          ),
        });
        get().triggerSync();
      },

      expandTaskToColumn: (taskId: string) => {
        const { tasks, activeBoardId, boards } = get();
        const task = tasks.find((t) => t.id === taskId);
        if (!task) return;

        const currentColumns = get().getActiveBoardColumns();
        const newColumnId = `col-${Date.now()}`;
        const newColumn: Column = {
          id: newColumnId,
          title: task.title.trim() || "未命名狀態欄",
          icon: "🚀",
          color: task.coverColor || "#fef3c7",
          isCustom: true,
        };

        const createdTasks: Task[] = (task.checklist || []).map((item, index) => ({
          id: `task-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
          title: item.title,
          description: "",
          boardId: activeBoardId,
          columnId: newColumnId,
          orderKey: initialOrderKey(index),
          priority: task.priority || "medium",
          isStarred: false,
          tags: [...(task.tags || [])],
          startDate: null,
          dueDate: null,
          isAllDay: true,
          completed: !!item.completed,
          checklist: [],
          coverColor: null,
          coverAspectRatio: null,
          attachments: [],
          attachmentsCount: 0,
          activities: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        const remainingTasks = tasks.filter((t) => t.id !== taskId);

        const updatedBoards = boards.map((b) =>
          b.id === activeBoardId ? { ...b, columns: [...currentColumns, newColumn] } : b
        );

        set({
          boards: updatedBoards,
          tasks: [...remainingTasks, ...createdTasks],
          editingTaskId: null,
        });
        get().triggerSync();
      },

      aggregateColumnToTask: (columnId: string) => {
        const { tasks, activeBoardId, boards } = get();
        const currentColumns = get().getActiveBoardColumns();
        const column = currentColumns.find((c) => c.id === columnId);
        if (!column) return;

        const colTasks = tasks.filter((t) => t.boardId === activeBoardId && t.columnId === columnId);

        const checklist: ChecklistItem[] = colTasks.map((t, idx) => ({
          id: `chk-${Date.now()}-${idx}`,
          title: t.title,
          completed: !!t.completed,
        }));

        const nowStr = new Date().toLocaleString("zh-TW", { hour12: false });
        const metaSections: string[] = [];

        colTasks.forEach((t, i) => {
          const details: string[] = [];
          if (t.priority) details.push(`- **優先等級**：${t.priority}`);
          if (t.dueDate) details.push(`- **截止日期**：${t.dueDate}`);
          if (t.tags && t.tags.length > 0) details.push(`- **標籤**：${t.tags.map((tag) => `#${tag}`).join(" ")}`);
          if (t.description && t.description.trim()) details.push(`- **原始備註**：\n${t.description.trim()}`);
          if (t.checklist && t.checklist.length > 0) {
            const subItems = t.checklist.map((c) => `  - [${c.completed ? "x" : " "}] ${c.title}`).join("\n");
            details.push(`- **子待辦清單**：\n${subItems}`);
          }

          if (details.length > 0) {
            metaSections.push(`#### ${i + 1}. ${t.title}\n${details.join("\n")}`);
          }
        });

        let aggregatedDescription = `> 📦 本任務聚合自狀態欄位 **「${column.title}」**（聚合時間：${nowStr}，共 ${colTasks.length} 項任務）\n\n`;
        if (metaSections.length > 0) {
          aggregatedDescription += `### 📋 原任務詳細備註與屬性彙整\n\n` + metaSections.join("\n\n");
        }

        const aggregatedTask: Task = {
          id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title: column.title,
          description: aggregatedDescription,
          boardId: "global",
          columnId: "inbox",
          orderKey: initialOrderKey(0),
          priority: "medium",
          isStarred: false,
          tags: [],
          dueDate: null,
          completed: colTasks.length > 0 && colTasks.every((t) => t.completed),
          checklist,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const remainingTasks = tasks.filter((t) => !(t.boardId === activeBoardId && t.columnId === columnId));
        const remainingColumns = currentColumns.filter((c) => c.id !== columnId);

        const updatedBoards = boards.map((b) =>
          b.id === activeBoardId ? { ...b, columns: remainingColumns } : b
        );

        set({
          boards: updatedBoards,
          tasks: [aggregatedTask, ...remainingTasks],
          isInboxSidebarOpen: true,
        });
        get().triggerSync();
      },

      transferColumnToBoard: async (columnId, targetBoardId, mode) => {
        const { boards, tasks, activeBoardId } = get();
        const sourceBoard = boards.find((b) => b.id === activeBoardId);
        const targetBoard = boards.find((b) => b.id === targetBoardId);
        if (!sourceBoard || !targetBoard || !canTransferColumn(sourceBoard, targetBoard, mode)) return null;
        if (!get().canCurrentUserEdit(targetBoardId)) return null;
        if (mode === "move" && !get().canCurrentUserEdit(sourceBoard.id)) return null;

        const sourceColumns = get().getActiveBoardColumns();
        const column = sourceColumns.find((c) => c.id === columnId);
        if (!column) return null;
        // 看板沒有欄位時會退回預設欄位，搬走最後一欄反而會讓「待辦／進行中／完成」冒出來
        if (mode === "move" && sourceColumns.length <= 1) return null;

        const now = new Date().toISOString();
        // 欄位 id 在各看板間會重複（預設欄位都叫 todo…），進到新看板一律換新 id
        const newColumn: Column = { ...column, id: `col-${Date.now()}`, isCustom: true };
        const columnTasks = tasks.filter((t) => t.boardId === sourceBoard.id && t.columnId === columnId);
        const transferredTasks: Task[] = columnTasks.map((t, index) =>
          mode === "move"
            ? { ...t, boardId: targetBoardId, columnId: newColumn.id, updatedAt: now }
            : {
                ...t,
                id: `task-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
                boardId: targetBoardId,
                columnId: newColumn.id,
                checklist: t.checklist?.map((item) => ({ ...item })),
                createdAt: now,
                updatedAt: now,
              }
        );
        const transferredIds = new Set(columnTasks.map((t) => t.id));

        const targetColumns =
          targetBoard.columns && targetBoard.columns.length > 0 ? targetBoard.columns : DEFAULT_COLUMNS;
        const updatedTargetBoard: Board = { ...targetBoard, columns: [...targetColumns, newColumn] };

        set((state) => ({
          boards: state.boards.map((b) => {
            if (b.id === targetBoardId) return updatedTargetBoard;
            if (mode === "move" && b.id === sourceBoard.id) {
              return { ...b, columns: sourceColumns.filter((c) => c.id !== columnId) };
            }
            return b;
          }),
          tasks:
            mode === "move"
              ? [...state.tasks.filter((t) => !transferredIds.has(t.id)), ...transferredTasks]
              : [...state.tasks, ...transferredTasks],
          selectedTaskIds: state.selectedTaskIds.filter((id) => !transferredIds.has(id)),
        }));

        if (updatedTargetBoard.isShared) {
          const { collaborationService } = await loadCollab();
          await collaborationService.appendColumnToSharedBoard(updatedTargetBoard, newColumn, transferredTasks);
        }
        get().triggerSync();
        return newColumn.id;
      },

      // Bookmarks (收藏)
      pendingShare: null,
      setPendingShare: (pendingShare) => {
        savePendingShare(pendingShare);
        set({ pendingShare });
      },
      ensureCollectionBoard: () => {
        const existing = findCollectionBoard(get().boards);
        if (existing) return existing;
        // Fresh id each time: a previously deleted collection board's id stays tombstoned in the cloud
        const board = createCollectionBoard(`board-collection-${Date.now()}`);
        set((state) => ({ boards: [...state.boards, board] }));
        return board;
      },
      openCollectionBoard: () => {
        const board = get().ensureCollectionBoard();
        get().setActiveBoardId(board.id);
        get().triggerSync();
      },
      saveLinkToCollection: ({ title, note, link }) => {
        const board = get().ensureCollectionBoard();
        const visibleColumns = (board.columns && board.columns.length > 0 ? board.columns : DEFAULT_COLUMNS).filter(
          (c) => !c.isArchived && c.id !== "inbox"
        );
        const targetColumn =
          visibleColumns.find((c) => c.id === PLATFORM_META[link.platform].columnId) ||
          visibleColumns[0] ||
          DEFAULT_COLUMNS[0];
        const task = get().addTask({
          title,
          description: buildLinkDescription(link, note),
          boardId: board.id,
          columnId: targetColumn.id,
          tags: [],
          dueDate: null,
          completed: false,
          link,
        });
        if (needsThumbnailRehost(link.thumbnailUrl)) void get().rehostTaskThumbnail(task.id);
        return task;
      },

      enrichingTaskIds: {},
      enrichTaskFromLink: async (taskId) => {
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task || !isBareUrl(task.title) || get().enrichingTaskIds[taskId]) return;

        const sourceTitle = task.title.trim();
        const url = normalizeSharedUrl(sourceTitle);
        set((state) => ({ enrichingTaskIds: { ...state.enrichingTaskIds, [taskId]: true } }));
        try {
          const preview = await fetchLinkPreview(url);
          const thumbnailUrl = preview?.thumbnailUrl ? await persistThumbnail(preview.thumbnailUrl) : null;
          // A cloud snapshot written just before this card existed can briefly drop it from local
          // state; wait for it to come back instead of silently skipping the expansion.
          const current = await waitForTask(taskId);
          if (!current) return;

          const link: TaskLink = {
            url,
            platform: detectPlatform(url),
            title: preview?.title ?? null,
            description: preview?.description ?? null,
            thumbnailUrl,
            author: preview?.author ?? null,
            siteName: preview?.siteName ?? null,
            savedAt: new Date().toISOString(),
          };
          const existing = (current.description || "").trim();
          const description = [buildLinkDescription(link), existing].filter(Boolean).join("\n\n---\n\n");
          // Don't clobber a title the user retyped while the preview was loading
          const cardTitle = current.title.trim() === sourceTitle ? toCardTitle(preview?.title) : "";

          get().updateTask(taskId, { link, description, ...(cardTitle ? { title: cardTitle } : {}) });
        } finally {
          set((state) => {
            const { [taskId]: _done, ...rest } = state.enrichingTaskIds;
            return { enrichingTaskIds: rest };
          });
        }
      },
      rehostTaskThumbnail: async (taskId) => {
        const original = get().tasks.find((t) => t.id === taskId)?.link?.thumbnailUrl;
        if (!original || !needsThumbnailRehost(original)) return;
        const stable = await persistThumbnail(original);
        const current = get().tasks.find((t) => t.id === taskId);
        if (stable === original || !current?.link) return;
        get().updateTask(taskId, {
          link: { ...current.link, thumbnailUrl: stable },
          description: (current.description || "").split(original).join(stable),
        });
      },

      // Board Manager Modal
      isBoardManagerOpen: false,
      setIsBoardManagerOpen: (isBoardManagerOpen) => set({ isBoardManagerOpen }),

      // Collaboration
      isShareBoardModalOpen: false,
      setIsShareBoardModalOpen: (isShareBoardModalOpen) => set({ isShareBoardModalOpen }),
      isJoinBoardModalOpen: false,
      setIsJoinBoardModalOpen: (isJoinBoardModalOpen) => set({ isJoinBoardModalOpen }),
      joinBoardInitialCode: "",
      setJoinBoardInitialCode: (joinBoardInitialCode) => set({ joinBoardInitialCode }),
      enableActiveBoardSharing: async () => {
        const { collaborationService } = await loadCollab();
        const { boards, activeBoardId, userSession, tasks } = get();
        const activeBoard = boards.find((b) => b.id === activeBoardId);
        if (!activeBoard) return "";

        const { inviteCode, board: updatedBoard } = await collaborationService.enableBoardSharing(
          activeBoard,
          userSession,
          tasks
        );

        set((state) => ({
          boards: state.boards.map((b) => (b.id === activeBoardId ? updatedBoard : b)),
        }));

        collaborationService.subscribeToSharedBoard(updatedBoard.shareId || updatedBoard.id, ({ board, tasks: remoteTasks }) => {
          set((state) => ({
            boards: state.boards.map((b) => (b.id === updatedBoard.id ? { ...b, ...board } : b)),
            tasks: [
              ...state.tasks.filter((t) => t.boardId !== updatedBoard.id),
              ...remoteTasks,
            ],
          }));
        });

        return inviteCode;
      },
      joinBoardByInviteCode: async (code, nickname) => {
        const { collaborationService } = await loadCollab();
        const { userSession } = get();
        const result = await collaborationService.joinBoardByInviteCode(
          code,
          userSession,
          nickname
        );

        if (result.success && result.board) {
          const joinedBoard = result.board;
          if (nickname && nickname.trim() && userSession.isGuest) {
            set((state) => ({
              userSession: {
                ...state.userSession,
                name: nickname.trim(),
                avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(nickname.trim())}`,
              },
            }));
          }

          set((state) => {
            const exists = state.boards.some((b) => b.id === joinedBoard.id);
            const newBoards = exists
              ? state.boards.map((b) => (b.id === joinedBoard.id ? joinedBoard : b))
              : [...state.boards, joinedBoard];
            return {
              boards: newBoards,
              activeBoardId: joinedBoard.id,
              isJoinBoardModalOpen: false,
            };
          });

          collaborationService.subscribeToSharedBoard(joinedBoard.shareId || joinedBoard.id, ({ board, tasks: remoteTasks, recentActivities }) => {
            set((state) => ({
              boards: state.boards.map((b) => (b.id === joinedBoard.id ? { ...b, ...board } : b)),
              tasks: [
                ...state.tasks.filter((t) => t.boardId !== joinedBoard.id),
                ...remoteTasks,
              ],
            }));

            if (recentActivities && Array.isArray(recentActivities)) {
              recentActivities.forEach((act: ActivityPayload) => {
                get().addNotification(act);
              });
            }
          });

          get().emitActivity("member_joined", {
            boardId: joinedBoard.id,
          });

          return { success: true, message: result.message, board: joinedBoard };
        }

        return { success: false, message: result.message || "加入失敗" };
      },
      updateMemberRole: async (memberUid, role) => {
        const { collaborationService } = await loadCollab();
        const { boards, activeBoardId } = get();
        const activeBoard = boards.find((b) => b.id === activeBoardId);
        if (!activeBoard || !activeBoard.isShared) return;

        const updatedBoard = await collaborationService.updateMemberRole(
          activeBoard.id,
          memberUid,
          role,
          activeBoard
        );

        set((state) => ({
          boards: state.boards.map((b) => (b.id === activeBoardId ? updatedBoard : b)),
        }));
      },
      removeMemberFromBoard: async (memberUid) => {
        const { collaborationService } = await loadCollab();
        const { boards, activeBoardId } = get();
        const activeBoard = boards.find((b) => b.id === activeBoardId);
        if (!activeBoard || !activeBoard.isShared) return;

        const updatedBoard = await collaborationService.removeMember(
          activeBoard.id,
          memberUid,
          activeBoard
        );

        set((state) => ({
          boards: state.boards.map((b) => (b.id === activeBoardId ? updatedBoard : b)),
        }));
      },
      getCurrentUserRole: (boardId) => {
        const { boards, activeBoardId, userSession } = get();
        const targetId = boardId || activeBoardId;
        const targetBoard = boards.find((b) => b.id === targetId);
        return getUserRole(targetBoard, userSession.id);
      },
      canCurrentUserEdit: (boardId) => {
        const { boards, activeBoardId, userSession } = get();
        const targetId = boardId || activeBoardId;
        const targetBoard = boards.find((b) => b.id === targetId);
        return canUserEdit(targetBoard, userSession.id);
      },

      // Notifications
      notifications: [],
      isBrowserNotificationEnabled:
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "granted",
      setIsBrowserNotificationEnabled: (enabled) => set({ isBrowserNotificationEnabled: enabled }),
      activeToasts: [],
      addNotification: (activity) => {
        const currentUserId = get().userSession.id;
        // Self-Action Exclusion Guard: Never notify own actions!
        if (activity.actorId && currentUserId && activity.actorId === currentUserId) return;

        set((state) => {
          // Prevent duplicates
          if (state.notifications.some((n) => n.id === activity.id)) {
            return state;
          }

          const newItem: NotificationItem = {
            ...activity,
            read: false,
          };

          const updatedNotifications = [newItem, ...state.notifications].slice(0, 50);
          notificationService.saveStoredNotifications(updatedNotifications);

          // Trigger native Web Notification if enabled & window hidden
          if (get().isBrowserNotificationEnabled) {
            notificationService.showNativeNotification(newItem);
          }

          return {
            notifications: updatedNotifications,
            activeToasts: [newItem, ...state.activeToasts.slice(0, 2)],
          };
        });
      },
      markNotificationAsRead: (id) => {
        set((state) => {
          const updated = state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          );
          notificationService.saveStoredNotifications(updated);
          return { notifications: updated };
        });
      },
      markAllNotificationsAsRead: () => {
        set((state) => {
          const updated = state.notifications.map((n) => ({ ...n, read: true }));
          notificationService.saveStoredNotifications(updated);
          return { notifications: updated };
        });
      },
      clearAllNotifications: () => {
        set({ notifications: [], activeToasts: [] });
        notificationService.saveStoredNotifications([]);
      },
      dismissToast: (id) => {
        set((state) => ({
          activeToasts: state.activeToasts.filter((t) => t.id !== id),
        }));
      },
      emitActivity: (actionType, data) => {
        const user = get().userSession;
        const board = get().boards.find((b) => b.id === data.boardId);
        if (!board || !board.isShared) return;

        const activity = notificationService.createActivity(actionType, {
          boardId: board.id,
          boardName: board.name,
          actorId: user.id,
          actorName: user.name || "協作成員",
          actorAvatar: user.avatarUrl,
          taskId: data.taskId,
          taskTitle: data.taskTitle,
          sourceColumnTitle: data.sourceColumnTitle,
          targetColumnTitle: data.targetColumnTitle,
        });

        // Sync to shared board & Broadcast
        void loadCollab().then(({ collaborationService }) =>
          collaborationService.syncSharedBoardData(board, get().tasks, activity)
        );
      },

      // Tasks
      tasks: INITIAL_TASKS,
      addTask: (taskData) => {
        const effectiveBoardId =
          taskData.columnId === "inbox" ? "global" : taskData.boardId || get().activeBoardId;

        const currentTasksInCol = get()
          .tasks.filter((t) =>
            taskData.columnId === "inbox"
              ? t.columnId === "inbox"
              : t.boardId === effectiveBoardId && t.columnId === taskData.columnId
          )
          .sort((a, b) => (a.orderKey > b.orderKey ? 1 : -1));

        const lastKey = currentTasksInCol.length > 0 ? currentTasksInCol[currentTasksInCol.length - 1].orderKey : null;
        const newOrderKey = taskData.orderKey || generateOrderKeyBetween(lastKey, null);

        const newTask: Task = {
          id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          title: taskData.title,
          description: taskData.description || "",
          boardId: effectiveBoardId,
          columnId: taskData.columnId,
          orderKey: newOrderKey,
          priority: taskData.priority || "medium",
          isStarred: taskData.isStarred || false,
          tags: taskData.tags || [],
          startDate: taskData.startDate || null,
          dueDate: taskData.dueDate || null,
          isAllDay: taskData.isAllDay || false,
          completed: taskData.completed || false,
          checklist: taskData.checklist || [],
          coverColor: taskData.coverColor || null,
          attachmentsCount: taskData.attachmentsCount || 0,
          link: taskData.link || null,
          // Always taken from the current session rather than the caller, so every entry point
          // (voice, quick add, inbox, share sheet) records the same thing.
          createdBy: {
            uid: get().userSession.id,
            name: get().userSession.name || "成員",
            avatarUrl: get().userSession.avatarUrl || null,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));

        if (effectiveBoardId !== "global") {
          const targetCol = get().getActiveBoardColumns().find((c) => c.id === taskData.columnId);
          get().emitActivity("task_created", {
            boardId: effectiveBoardId,
            taskId: newTask.id,
            taskTitle: newTask.title,
            targetColumnTitle: targetCol?.title || taskData.columnId,
          });
        }

        get().triggerSync();
        // A card titled with just a link gets its real title, image and content pulled in
        if (isBareUrl(newTask.title)) void get().enrichTaskFromLink(newTask.id);
        return newTask;
      },

      updateTask: (id, partial) => {
        const previousTitle = get().tasks.find((t) => t.id === id)?.title.trim();
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...partial, updatedAt: new Date().toISOString() } : t
          ),
        }));
        get().triggerSync();
        if (partial.title !== undefined && isBareUrl(partial.title) && partial.title.trim() !== previousTitle) {
          void get().enrichTaskFromLink(id);
        }
      },

      deleteTask: (id) => {
        const targetTask = get().tasks.find((t) => t.id === id);
        if (targetTask && targetTask.boardId && targetTask.boardId !== "global") {
          get().emitActivity("task_deleted", {
            boardId: targetTask.boardId,
            taskId: targetTask.id,
            taskTitle: targetTask.title,
          });
        }

        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
          selectedTaskIds: state.selectedTaskIds.filter((taskId) => taskId !== id),
          editingTaskId: state.editingTaskId === id ? null : state.editingTaskId,
          pendingDeletedTaskIds: { ...state.pendingDeletedTaskIds, [id]: new Date().toISOString() },
        }));
        get().triggerSync();
      },

      archiveTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, isArchived: true } : t)),
          editingTaskId: state.editingTaskId === id ? null : state.editingTaskId,
        }));
        get().triggerSync();
      },

      toggleTaskComplete: (id) => {
        const targetTask = get().tasks.find((t) => t.id === id);
        if (targetTask && targetTask.boardId && targetTask.boardId !== "global") {
          get().emitActivity(targetTask.completed ? "task_uncompleted" : "task_completed", {
            boardId: targetTask.boardId,
            taskId: targetTask.id,
            taskTitle: targetTask.title,
          });
        }

        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id === id) {
              const newCompleted = !t.completed;
              return {
                ...t,
                completed: newCompleted,
                updatedAt: new Date().toISOString(),
              };
            }
            return t;
          }),
        }));
        get().triggerSync();
      },

      toggleTaskStarred: (id) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, isStarred: !t.isStarred, updatedAt: new Date().toISOString() } : t
          ),
        }));
        get().triggerSync();
      },

      moveTask: (taskId, targetColumnId, targetIndex, skipSync = false) => {
        const { tasks, activeBoardId } = get();
        const taskToMove = tasks.find((t) => t.id === taskId);
        if (!taskToMove) return;

        // If target is inbox, it's global; if moving to board column, adopt activeBoardId
        const newBoardId = targetColumnId === "inbox" ? "global" : activeBoardId;

        const columnTasks = tasks
          .filter((t) =>
            targetColumnId === "inbox"
              ? t.columnId === "inbox" && t.id !== taskId
              : t.boardId === newBoardId && t.columnId === targetColumnId && t.id !== taskId
          )
          .sort((a, b) => (a.orderKey > b.orderKey ? 1 : -1));

        const clampedIndex = Math.max(0, Math.min(targetIndex, columnTasks.length));
        const prevTask = clampedIndex > 0 ? columnTasks[clampedIndex - 1] : null;
        const nextTask = clampedIndex < columnTasks.length ? columnTasks[clampedIndex] : null;

        const newOrderKey = generateOrderKeyBetween(prevTask?.orderKey, nextTask?.orderKey);

        if (taskToMove.columnId !== targetColumnId && newBoardId !== "global") {
          const targetCol = get().getActiveBoardColumns().find((c) => c.id === targetColumnId);
          get().emitActivity("task_moved", {
            boardId: newBoardId,
            taskId: taskToMove.id,
            taskTitle: taskToMove.title,
            targetColumnTitle: targetCol?.title || targetColumnId,
          });
        }

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  boardId: newBoardId,
                  columnId: targetColumnId,
                  orderKey: newOrderKey,
                  completed: taskToMove.completed,
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        }));

        if (!skipSync) {
          get().triggerSync();
        }
      },

      reorderColumnTasks: (columnId, boardId, orderedTasks) => {
        const tasksWithKeys = orderedTasks.map((task, index) => ({
          ...task,
          columnId,
          boardId: columnId === "inbox" ? "global" : boardId,
          orderKey: initialOrderKey(index),
          completed: task.completed,
          updatedAt: new Date().toISOString(),
        }));

        const otherTasks = get().tasks.filter((t) =>
          columnId === "inbox"
            ? t.columnId !== "inbox"
            : !(t.boardId === boardId && t.columnId === columnId)
        );

        set({ tasks: [...otherTasks, ...tasksWithKeys] });
        get().triggerSync();
      },

      // Checklist Actions
      addChecklistItem: (taskId, title) => {
        if (!title.trim()) return;
        const newItem: ChecklistItem = {
          id: `chk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title: title.trim(),
          completed: false,
        };

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  checklist: [...(t.checklist || []), newItem],
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        }));
        get().triggerSync();
      },

      toggleChecklistItem: (taskId, itemId) => {
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id !== taskId) return t;
            const updatedChecklist = (t.checklist || []).map((item) =>
              item.id === itemId ? { ...item, completed: !item.completed } : item
            );
            return {
              ...t,
              checklist: updatedChecklist,
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
        get().triggerSync();
      },

      updateChecklistItem: (taskId, itemId, newTitle) => {
        if (!newTitle.trim()) return;
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id !== taskId) return t;
            return {
              ...t,
              checklist: (t.checklist || []).map((item) =>
                item.id === itemId ? { ...item, title: newTitle.trim() } : item
              ),
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
        get().triggerSync();
      },

      removeChecklistItem: (taskId, itemId) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  checklist: (t.checklist || []).filter((item) => item.id !== itemId),
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        }));
        get().triggerSync();
      },

      reorderChecklistItems: (taskId, newChecklist) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  checklist: newChecklist,
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        }));
        get().triggerSync();
      },

      moveChecklistItem: (taskId, itemId, direction) => {
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task || !task.checklist) return;
        const list = [...task.checklist];
        const index = list.findIndex((item) => item.id === itemId);
        if (index === -1) return;
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= list.length) return;

        const [movedItem] = list.splice(index, 1);
        list.splice(targetIndex, 0, movedItem);

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  checklist: list,
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        }));
        get().triggerSync();
      },

      addAttachment: (taskId, attachment) => {
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id !== taskId) return t;
            const updatedAttachments = [...(t.attachments || []), attachment];
            return {
              ...t,
              attachments: updatedAttachments,
              attachmentsCount: updatedAttachments.length,
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
        get().triggerSync();
      },

      removeAttachment: (taskId, attachmentId) => {
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id !== taskId) return t;
            const updatedAttachments = (t.attachments || []).filter((a) => a.id !== attachmentId);
            return {
              ...t,
              attachments: updatedAttachments,
              attachmentsCount: updatedAttachments.length,
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
        get().triggerSync();
      },

      // Editing detail modal
      editingTaskId: null,
      setEditingTaskId: (editingTaskId) => set({ editingTaskId }),

      // Multi-Select & Batch
      isMultiSelectMode: false,
      setIsMultiSelectMode: (isMultiSelectMode) =>
        set({ isMultiSelectMode, selectedTaskIds: isMultiSelectMode ? get().selectedTaskIds : [] }),
      selectedTaskIds: [],
      toggleTaskSelection: (taskId) => {
        const { selectedTaskIds } = get();
        if (selectedTaskIds.includes(taskId)) {
          set({ selectedTaskIds: selectedTaskIds.filter((id) => id !== taskId) });
        } else {
          set({ selectedTaskIds: [...selectedTaskIds, taskId] });
        }
      },
      selectAllTasksInBoard: () => {
        const { tasks, activeBoardId } = get();
        const boardTaskIds = tasks.filter((t) => t.boardId === activeBoardId && t.columnId !== "inbox").map((t) => t.id);
        set({ selectedTaskIds: boardTaskIds });
      },
      selectAllTasksInInbox: () => {
        const { tasks } = get();
        const inboxTaskIds = tasks.filter((t) => t.columnId === "inbox").map((t) => t.id);
        set({ selectedTaskIds: inboxTaskIds });
      },
      clearSelection: () => set({ selectedTaskIds: [] }),

      batchMoveTasks: (targetColumnId) => {
        const { selectedTaskIds, tasks, activeBoardId } = get();
        if (selectedTaskIds.length === 0) return;

        const targetBoardId = targetColumnId === "inbox" ? "global" : activeBoardId;

        set({
          tasks: tasks.map((t) =>
            selectedTaskIds.includes(t.id)
              ? {
                  ...t,
                  boardId: targetBoardId,
                  columnId: targetColumnId,
                  completed: t.completed,
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
          selectedTaskIds: [],
        });
        get().triggerSync();
      },

      batchDeleteTasks: () => {
        const { selectedTaskIds, tasks } = get();
        if (selectedTaskIds.length === 0) return;
        const now = new Date().toISOString();

        set((state) => ({
          tasks: tasks.filter((t) => !selectedTaskIds.includes(t.id)),
          selectedTaskIds: [],
          pendingDeletedTaskIds: selectedTaskIds.reduce(
            (acc, id) => ({ ...acc, [id]: now }),
            state.pendingDeletedTaskIds
          ),
        }));
        get().triggerSync();
      },

      batchToggleComplete: (completed) => {
        const { selectedTaskIds, tasks } = get();
        if (selectedTaskIds.length === 0) return;

        set({
          tasks: tasks.map((t) =>
            selectedTaskIds.includes(t.id)
              ? {
                  ...t,
                  completed,
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
          selectedTaskIds: [],
        });
        get().triggerSync();
      },

      batchSetPriority: (priority) => {
        const { selectedTaskIds, tasks } = get();
        if (selectedTaskIds.length === 0) return;

        set({
          tasks: tasks.map((t) =>
            selectedTaskIds.includes(t.id)
              ? { ...t, priority, updatedAt: new Date().toISOString() }
              : t
          ),
          selectedTaskIds: [],
        });
        get().triggerSync();
      },

      // Drag & Drop Live Placement
      activeDragTaskId: null,
      setActiveDragTaskId: (activeDragTaskId) => set({ activeDragTaskId }),
      dragOverLocation: null,
      setDragOverLocation: (dragOverLocation) => set({ dragOverLocation }),

      // Filters
      searchQuery: "",
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      isSearchModalOpen: false,
      setIsSearchModalOpen: (isSearchModalOpen) => set({ isSearchModalOpen }),
      priorityFilter: "all",
      setPriorityFilter: (priorityFilter) => set({ priorityFilter }),
      tagFilter: "all",
      setTagFilter: (tagFilter) => set({ tagFilter }),

      // Voice modal & Learning Engine
      isVoiceOverlayOpen: false,
      setIsVoiceOverlayOpen: (isVoiceOverlayOpen) => set({ isVoiceOverlayOpen }),
      voiceState: "idle",
      setVoiceState: (voiceState) => set({ voiceState }),
      voiceLanguage: "auto",
      setVoiceLanguage: (voiceLanguage) => set({ voiceLanguage }),
      voiceTargetColumnId: null,
      setVoiceTargetColumnId: (voiceTargetColumnId) => set({ voiceTargetColumnId }),
      openVoiceForColumn: (columnId) => {
        set({
          voiceTargetColumnId: columnId || null,
          voiceState: "recording",
          isVoiceOverlayOpen: true,
        });
      },
      extractedTask: null,
      setExtractedTask: (extractedTask) => set({ extractedTask }),

      // Modals
      isSettingsModalOpen: false,
      setIsSettingsModalOpen: (isSettingsModalOpen) => set({ isSettingsModalOpen }),
      isAddTaskModalOpen: false,
      setIsAddTaskModalOpen: (isAddTaskModalOpen) => set({ isAddTaskModalOpen }),
      addTaskDefaultColumn: "todo",
      setAddTaskDefaultColumn: (addTaskDefaultColumn) => set({ addTaskDefaultColumn }),
      openAddTaskModal: (columnId) => {
        const activeCols = get().getActiveBoardColumns();
        const defaultCol = columnId || activeCols[0]?.id || "todo";
        set({ addTaskDefaultColumn: defaultCol, isAddTaskModalOpen: true });
      },

      // BYOK
      byokConfig: {
        apiKey: "",
        isCustomKeyActive: false,
        model: "gemini-3.6-flash",
        defaultBoardId: "board-work",
        isEncrypted: false,
        lastTestedAt: null,
      },
      updateBYOKConfig: (partial) =>
        set((state) => ({
          byokConfig: { ...state.byokConfig, ...partial },
        })),
    }),
    {
      name: "voicekanban-storage-v4",
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({
        boards: state.boards,
        activeBoardId: state.activeBoardId,
        tasks: state.tasks,
        inboxWidth: state.inboxWidth,
        byokConfig: state.byokConfig,
        userSession: state.userSession,
        viewMode: state.viewMode,
        isInboxSidebarOpen: state.isInboxSidebarOpen,
        pendingDeletedTaskIds: state.pendingDeletedTaskIds,
        pendingDeletedBoardIds: state.pendingDeletedBoardIds,
      }),
    }
  )
);
