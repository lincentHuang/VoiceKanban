import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import { Board, Column, ColumnId, Priority, Task, ViewMode, DEFAULT_COLUMNS, ChecklistItem } from "../types/task";
import { VoiceExtractResult, VoiceState } from "../types/voice";
import { BYOKConfig } from "../types/user";
import { UserSession, SyncState, AuthProvider } from "../types/auth";
import { INITIAL_BOARDS, INITIAL_TASKS } from "../services/mockData";
import { generateOrderKeyBetween, initialOrderKey } from "../utils/lexorank";
import { GUEST_USER, createGuestSession, loginWithProvider, logoutUser, subscribeToAuthState } from "../services/authService";
import { syncEngine } from "../services/syncService";

interface KanbanStoreState {
  // Authentication & Profile
  userSession: UserSession;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isBindModalOpen: boolean;
  setIsBindModalOpen: (open: boolean) => void;
  loginAsGuest: () => void;
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

  // Cloud Sync State
  syncState: SyncState;
  triggerSync: () => Promise<void>;

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
  getActiveBoardColumns: () => Column[];
  addColumnToActiveBoard: (title: string, icon?: string, color?: string) => void;
  updateColumnInActiveBoard: (columnId: string, title: string, icon?: string) => void;
  setColumnColor: (columnId: string, color: string) => void;
  deleteColumnFromActiveBoard: (columnId: string) => void;
  sortColumnTasks: (columnId: string, sortBy: "date" | "priority" | "title") => void;
  moveAllColumnTasks: (sourceColumnId: string, targetColumnId: string) => void;
  archiveColumn: (columnId: string) => void;

  // Column Manager Modal
  isColumnManagerOpen: boolean;
  setIsColumnManagerOpen: (open: boolean) => void;

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
  toggleChecklistItem: (taskId: string, itemId: string) => void;
  removeChecklistItem: (taskId: string, itemId: string) => void;

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
  priorityFilter: Priority | "all";
  setPriorityFilter: (priority: Priority | "all") => void;
  tagFilter: string | "all";
  setTagFilter: (tag: string | "all") => void;

  // Modals & UI States
  isVoiceOverlayOpen: boolean;
  setIsVoiceOverlayOpen: (open: boolean) => void;
  voiceState: VoiceState;
  setVoiceState: (state: VoiceState) => void;
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

export const useKanbanStore = create<KanbanStoreState>()(
  persist(
    (set, get) => ({
      // Auth
      userSession: GUEST_USER,
      isAuthModalOpen: false,
      setIsAuthModalOpen: (isAuthModalOpen) => set({ isAuthModalOpen }),
      isBindModalOpen: false,
      setIsBindModalOpen: (isBindModalOpen) => set({ isBindModalOpen }),
      loginAsGuest: () => {
        const existing = get().userSession;
        const currentId = existing?.isGuest && existing?.id ? existing.id : undefined;
        const guestSession = createGuestSession(currentId);
        set({ userSession: guestSession, isAuthModalOpen: false, isBindModalOpen: false });
      },
      bindGuestAccount: async (provider, email, password, displayName, isRegister) => {
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

        const unsubscribeAuth = subscribeToAuthState(async (session) => {
          if (session) {
            set({ userSession: session });

            // 資料庫為主：初次載入或重新整理時先拉取雲端最新資料
            const cloudData = await syncEngine.fetchUserDataFromCloud(session.id);
            if (cloudData) {
              set({
                boards: cloudData.boards && cloudData.boards.length > 0 ? cloudData.boards : INITIAL_BOARDS,
                tasks: cloudData.tasks || [],
                activeBoardId: cloudData.activeBoardId || (cloudData.boards && cloudData.boards[0]?.id) || get().activeBoardId,
                syncState: {
                  status: typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "synced",
                  lastSyncedAt: new Date().toISOString(),
                  isCloudConnected: true,
                },
              });
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

        return () => {
          if (typeof window !== "undefined") {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
          }
          unsubscribeAuth();
          syncEngine.unsubscribe();
        };
      },

      // Sync
      syncState: {
        status: "synced",
        lastSyncedAt: new Date().toISOString(),
        isCloudConnected: true,
      },
      triggerSync: async () => {
        const user = get().userSession;
        set((s) => ({ syncState: { ...s.syncState, status: "syncing" } }));
        const result = await syncEngine.syncTasksToCloud(
          user.id,
          get().tasks,
          get().boards,
          get().activeBoardId
        );
        set({
          syncState: {
            status: result.status,
            lastSyncedAt: result.syncedAt,
            errorMessage: result.errorMessage,
            isCloudConnected: result.isCloudConnected,
          },
        });
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
      setActiveBoardId: (id) => set({ activeBoardId: id, selectedTaskIds: [] }),
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

      updateColumnInActiveBoard: (columnId, title, icon = "✨") => {
        const { boards, activeBoardId } = get();
        const currentColumns = get().getActiveBoardColumns();
        const updatedColumns = currentColumns.map((col) =>
          col.id === columnId ? { ...col, title, icon } : col
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

        // Reassign order keys
        const sortedColTasks = colTasks.map((t, idx) => ({
          ...t,
          orderKey: `sort-${idx.toString().padStart(4, "0")}`,
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

      // Column Manager Modal
      isColumnManagerOpen: false,
      setIsColumnManagerOpen: (isColumnManagerOpen) => set({ isColumnManagerOpen }),

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
          dueDate: taskData.dueDate || null,
          completed: taskData.completed || false,
          checklist: taskData.checklist || [],
          coverColor: taskData.coverColor || null,
          attachmentsCount: taskData.attachmentsCount || 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));

        get().triggerSync();
        return newTask;
      },

      updateTask: (id, partial) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...partial, updatedAt: new Date().toISOString() } : t
          ),
        }));
        get().triggerSync();
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
          selectedTaskIds: state.selectedTaskIds.filter((taskId) => taskId !== id),
          editingTaskId: state.editingTaskId === id ? null : state.editingTaskId,
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
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id === id) {
              const newCompleted = !t.completed;
              return {
                ...t,
                completed: newCompleted,
                columnId: newCompleted ? "done" : t.columnId === "done" ? "todo" : t.columnId,
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

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  boardId: newBoardId,
                  columnId: targetColumnId,
                  orderKey: newOrderKey,
                  completed: targetColumnId === "done",
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
          orderKey: `k_${(index + 1) * 1000}`,
          completed: columnId === "done",
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
                  completed: targetColumnId === "done",
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

        set({
          tasks: tasks.filter((t) => !selectedTaskIds.includes(t.id)),
          selectedTaskIds: [],
        });
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
                  columnId: completed ? "done" : t.columnId === "done" ? "todo" : t.columnId,
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
      priorityFilter: "all",
      setPriorityFilter: (priorityFilter) => set({ priorityFilter }),
      tagFilter: "all",
      setTagFilter: (tagFilter) => set({ tagFilter }),

      // Voice modal
      isVoiceOverlayOpen: false,
      setIsVoiceOverlayOpen: (isVoiceOverlayOpen) => set({ isVoiceOverlayOpen }),
      voiceState: "idle",
      setVoiceState: (voiceState) => set({ voiceState }),
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
        model: "gemini-2.0-flash",
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
      }),
    }
  )
);
