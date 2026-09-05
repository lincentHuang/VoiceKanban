import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb, isFirebaseConfigured } from "@/core/services/firebase";
import { Board, Task, BoardMember, CollaboratorRole } from "@/core/types/task";
import { UserSession } from "@/core/types/auth";
import { sanitizeForFirestore, serializeTasks, deserializeTasks } from "@/core/services/syncService";
import { JoinBoardResult, SharedBoardData } from "../types";

const COLLAB_CHANNEL_NAME = "vk_collaboration_channel";

const memoryStorage = new Map<string, string>();

function safeGetItem(key: string): string | null {
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    try {
      const val = localStorage.getItem(key);
      if (val !== null) return val;
    } catch {}
  }
  return memoryStorage.get(key) || null;
}

function safeSetItem(key: string, value: string): void {
  memoryStorage.set(key, value);
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    try {
      localStorage.setItem(key, value);
    } catch {}
  }
}

export class CollaborationService {
  private static instance: CollaborationService;
  private channel: BroadcastChannel | null = null;
  private activeSubscriptions = new Map<string, Unsubscribe>();

  private constructor() {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        this.channel = new BroadcastChannel(COLLAB_CHANNEL_NAME);
      } catch (err) {
        console.warn("BroadcastChannel not supported or failed to initialize:", err);
      }
    }
  }

  public static getInstance(): CollaborationService {
    if (!CollaborationService.instance) {
      CollaborationService.instance = new CollaborationService();
    }
    return CollaborationService.instance;
  }

  /**
   * Generates a 6-character clean uppercase invite code, prefixed with VK-
   * e.g., VK-8X4B
   */
  public generateInviteCode(): string {
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // excludes 0, 1, I, O to prevent confusion
    let code = "";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `VK-${code}`;
  }

  /**
   * Listen to cross-tab updates via BroadcastChannel
   */
  public onCrossTabUpdate(
    callback: (message: { type: string; boardId: string; data?: any }) => void
  ): () => void {
    if (!this.channel) return () => {};

    const handler = (event: MessageEvent) => {
      if (event.data && event.data.type) {
        callback(event.data);
      }
    };

    this.channel.addEventListener("message", handler);
    return () => {
      this.channel?.removeEventListener("message", handler);
    };
  }

  /**
   * Broadcast an update to other browser tabs
   */
  public broadcastUpdate(type: string, boardId: string, data?: any): void {
    if (this.channel) {
      try {
        this.channel.postMessage({ type, boardId, data });
      } catch (e) {
        console.warn("Failed to broadcast message:", e);
      }
    }
  }

  /**
   * Enables sharing on an existing board, generating an invite code and setting the current user as Owner.
   */
  public async enableBoardSharing(
    board: Board,
    currentUser: UserSession,
    existingTasks: Task[]
  ): Promise<{ inviteCode: string; board: Board }> {
    const inviteCode = board.inviteCode || this.generateInviteCode();
    const now = new Date().toISOString();

    const ownerMember: BoardMember = {
      uid: currentUser.id,
      name: currentUser.name || "擁有者",
      email: currentUser.email,
      avatarUrl: currentUser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.id}`,
      role: "owner",
      joinedAt: now,
      isOnline: true,
      lastActiveAt: now,
    };

    // Ensure owner is included in members
    const members: BoardMember[] = [ownerMember];
    if (board.members && Array.isArray(board.members)) {
      board.members.forEach((m) => {
        if (m.uid !== currentUser.id) {
          members.push(m);
        }
      });
    }

    const updatedBoard: Board = {
      ...board,
      isShared: true,
      inviteCode,
      ownerId: board.ownerId || currentUser.id,
      members,
    };

    const boardTasks = existingTasks.filter((t) => t.boardId === board.id);

    // 1. Save to local storage / memory cache
    safeSetItem(
      `vk_shared_board_${board.id}`,
      JSON.stringify({
        ...updatedBoard,
        tasks: serializeTasks(boardTasks),
        updatedAt: now,
      })
    );
    safeSetItem(
      `vk_invite_code_${inviteCode}`,
      JSON.stringify({
        code: inviteCode,
        boardId: board.id,
        ownerId: updatedBoard.ownerId,
        createdAt: now,
      })
    );

    // 2. Save to Firestore if available
    if (isFirebaseConfigured() && typeof navigator !== "undefined" && navigator.onLine) {
      try {
        const db = getFirebaseDb();
        if (db) {
          const boardDocRef = doc(db, "shared_boards", board.id);
          const inviteDocRef = doc(db, "invite_codes", inviteCode);

          await Promise.all([
            setDoc(boardDocRef, sanitizeForFirestore({
              id: updatedBoard.id,
              name: updatedBoard.name,
              description: updatedBoard.description || "",
              icon: updatedBoard.icon || "💼",
              columns: updatedBoard.columns || [],
              inviteCode,
              ownerId: updatedBoard.ownerId,
              members: updatedBoard.members,
              tasks: serializeTasks(boardTasks),
              updatedAt: now,
            })),
            setDoc(inviteDocRef, sanitizeForFirestore({
              code: inviteCode,
              boardId: updatedBoard.id,
              ownerId: updatedBoard.ownerId,
              createdAt: now,
            })),
          ]);
        }
      } catch (err) {
        console.warn("Firestore enableBoardSharing error:", err);
      }
    }

    this.broadcastUpdate("BOARD_UPDATED", board.id, { board: updatedBoard, tasks: boardTasks });
    return { inviteCode, board: updatedBoard };
  }

  /**
   * Joins a board using an invite code (supports guests with nickname).
   */
  public async joinBoardByInviteCode(
    rawCode: string,
    currentUser: UserSession,
    guestNickname?: string
  ): Promise<JoinBoardResult> {
    const code = rawCode.trim().toUpperCase();
    if (!code) {
      return { success: false, message: "請輸入有效的邀請代碼" };
    }

    let boardId: string | null = null;
    let sharedData: SharedBoardData | null = null;

    // 1. Try Firestore lookup
    if (isFirebaseConfigured() && typeof navigator !== "undefined" && navigator.onLine) {
      try {
        const db = getFirebaseDb();
        if (db) {
          const inviteDoc = await getDoc(doc(db, "invite_codes", code));
          if (inviteDoc.exists()) {
            boardId = inviteDoc.data().boardId;
            const boardDoc = await getDoc(doc(db, "shared_boards", boardId!));
            if (boardDoc.exists()) {
              sharedData = boardDoc.data() as SharedBoardData;
            }
          }
        }
      } catch (err) {
        console.warn("Firestore join lookup error:", err);
      }
    }

    // 2. Fallback to local storage / memory cache
    if (!sharedData) {
      try {
        const rawInvite = safeGetItem(`vk_invite_code_${code}`);
        if (rawInvite) {
          const parsedInvite = JSON.parse(rawInvite);
          boardId = parsedInvite.boardId;
          const rawBoard = safeGetItem(`vk_shared_board_${boardId}`);
          if (rawBoard) {
            sharedData = JSON.parse(rawBoard);
          }
        }
      } catch {}
    }

    if (!sharedData || !boardId) {
      return {
        success: false,
        message: `查無此邀請代碼「${code}」，請確認代碼是否輸入正確或已失效。`,
      };
    }

    // Prepare member info
    const now = new Date().toISOString();
    const effectiveName =
      (guestNickname && guestNickname.trim()) ||
      currentUser.name ||
      "協作成員";
    const effectiveUid = currentUser.id || `guest_${Date.now().toString(36)}`;
    const effectiveAvatar =
      currentUser.avatarUrl ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(effectiveName)}`;

    const existingMembers: BoardMember[] = Array.isArray(sharedData.members)
      ? [...sharedData.members]
      : [];

    const memberIndex = existingMembers.findIndex(
      (m) => m.uid === effectiveUid || (currentUser.email && m.email === currentUser.email)
    );

    let userRole: CollaboratorRole = "editor";

    if (memberIndex >= 0) {
      // Already a member - update display name & active timestamp
      userRole = existingMembers[memberIndex].role;
      existingMembers[memberIndex] = {
        ...existingMembers[memberIndex],
        name: effectiveName,
        avatarUrl: effectiveAvatar,
        isOnline: true,
        lastActiveAt: now,
      };
    } else {
      // New member joins as editor
      const newMember: BoardMember = {
        uid: effectiveUid,
        name: effectiveName,
        email: currentUser.email,
        avatarUrl: effectiveAvatar,
        role: "editor",
        joinedAt: now,
        isOnline: true,
        lastActiveAt: now,
      };
      existingMembers.push(newMember);
    }

    // Update shared board document
    const updatedBoard: Board = {
      id: sharedData.id,
      name: sharedData.name,
      description: sharedData.description,
      icon: sharedData.icon || "💼",
      columns: sharedData.columns || [],
      isShared: true,
      inviteCode: sharedData.inviteCode,
      ownerId: sharedData.ownerId,
      members: existingMembers,
    };

    const deserializedTasks = deserializeTasks(sharedData.tasks);

    // Save to local cache
    safeSetItem(
      `vk_shared_board_${boardId}`,
      JSON.stringify({
        ...updatedBoard,
        tasks: sharedData.tasks,
        updatedAt: now,
      })
    );

    // Save to Firestore
    if (isFirebaseConfigured() && typeof navigator !== "undefined" && navigator.onLine) {
      try {
        const db = getFirebaseDb();
        if (db) {
          const boardDocRef = doc(db, "shared_boards", boardId);
          await updateDoc(boardDocRef, sanitizeForFirestore({
            members: existingMembers,
            updatedAt: now,
          }));
        }
      } catch (err) {
        console.warn("Firestore member update error:", err);
      }
    }

    this.broadcastUpdate("BOARD_UPDATED", boardId, {
      board: updatedBoard,
      tasks: deserializedTasks,
    });

    return {
      success: true,
      board: updatedBoard,
      message: `成功加入協作看板「${updatedBoard.name}」！`,
    };
  }

  /**
   * Update a member's role (Owner only)
   */
  public async updateMemberRole(
    boardId: string,
    memberUid: string,
    newRole: CollaboratorRole,
    currentBoard: Board
  ): Promise<Board> {
    const updatedMembers = (currentBoard.members || []).map((m) => {
      if (m.uid === memberUid) {
        return { ...m, role: newRole };
      }
      return m;
    });

    const updatedBoard: Board = {
      ...currentBoard,
      members: updatedMembers,
    };

    const now = new Date().toISOString();

    const raw = safeGetItem(`vk_shared_board_${boardId}`);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        parsed.members = updatedMembers;
        parsed.updatedAt = now;
        safeSetItem(`vk_shared_board_${boardId}`, JSON.stringify(parsed));
      } catch {}
    }

    if (isFirebaseConfigured() && typeof navigator !== "undefined" && navigator.onLine) {
      try {
        const db = getFirebaseDb();
        if (db) {
          await updateDoc(doc(db, "shared_boards", boardId), sanitizeForFirestore({
            members: updatedMembers,
            updatedAt: now,
          }));
        }
      } catch (err) {
        console.warn("Failed to update member role in Firestore:", err);
      }
    }

    this.broadcastUpdate("BOARD_UPDATED", boardId, { board: updatedBoard });
    return updatedBoard;
  }

  /**
   * Remove a member from the board (Owner only)
   */
  public async removeMember(
    boardId: string,
    memberUid: string,
    currentBoard: Board
  ): Promise<Board> {
    const updatedMembers = (currentBoard.members || []).filter((m) => m.uid !== memberUid);

    const updatedBoard: Board = {
      ...currentBoard,
      members: updatedMembers,
    };

    const now = new Date().toISOString();

    const raw = safeGetItem(`vk_shared_board_${boardId}`);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        parsed.members = updatedMembers;
        parsed.updatedAt = now;
        safeSetItem(`vk_shared_board_${boardId}`, JSON.stringify(parsed));
      } catch {}
    }

    if (isFirebaseConfigured() && typeof navigator !== "undefined" && navigator.onLine) {
      try {
        const db = getFirebaseDb();
        if (db) {
          await updateDoc(doc(db, "shared_boards", boardId), sanitizeForFirestore({
            members: updatedMembers,
            updatedAt: now,
          }));
        }
      } catch (err) {
        console.warn("Failed to remove member in Firestore:", err);
      }
    }

    this.broadcastUpdate("BOARD_UPDATED", boardId, { board: updatedBoard });
    return updatedBoard;
  }

  /**
   * Sync shared board tasks in real time
   */
  public async syncSharedBoardData(
    board: Board,
    tasks: Task[]
  ): Promise<void> {
    if (!board.isShared) return;

    const boardTasks = tasks.filter((t) => t.boardId === board.id);
    const now = new Date().toISOString();

    // 1. LocalStorage / Memory cache
    safeSetItem(
      `vk_shared_board_${board.id}`,
      JSON.stringify({
        ...board,
        tasks: serializeTasks(boardTasks),
        updatedAt: now,
      })
    );

    // 2. BroadcastChannel
    this.broadcastUpdate("BOARD_UPDATED", board.id, {
      board,
      tasks: boardTasks,
    });

    // 3. Firestore
    if (isFirebaseConfigured() && typeof navigator !== "undefined" && navigator.onLine) {
      try {
        const db = getFirebaseDb();
        if (db) {
          await setDoc(doc(db, "shared_boards", board.id), sanitizeForFirestore({
            id: board.id,
            name: board.name,
            description: board.description || "",
            icon: board.icon || "💼",
            columns: board.columns || [],
            inviteCode: board.inviteCode,
            ownerId: board.ownerId,
            members: board.members || [],
            tasks: serializeTasks(boardTasks),
            updatedAt: now,
          }), { merge: true });
        }
      } catch (err) {
        console.warn("Firestore syncSharedBoardData error:", err);
      }
    }
  }

  /**
   * Subscribe to real-time changes on a shared board
   */
  public subscribeToSharedBoard(
    boardId: string,
    onUpdate: (data: { board: Board; tasks: Task[] }) => void
  ): () => void {
    // Unsubscribe existing
    const existing = this.activeSubscriptions.get(boardId);
    if (existing) {
      existing();
      this.activeSubscriptions.delete(boardId);
    }

    if (isFirebaseConfigured() && typeof navigator !== "undefined" && navigator.onLine) {
      try {
        const db = getFirebaseDb();
        if (db) {
          const boardDocRef = doc(db, "shared_boards", boardId);
          const unsub = onSnapshot(boardDocRef, (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              const tasks = deserializeTasks(data.tasks);
              const board: Board = {
                id: data.id,
                name: data.name,
                description: data.description,
                icon: data.icon,
                columns: data.columns,
                isShared: true,
                inviteCode: data.inviteCode,
                ownerId: data.ownerId,
                members: data.members || [],
              };
              onUpdate({ board, tasks });
            }
          }, (err) => {
            console.warn("Firestore shared board subscription error:", err);
          });

          this.activeSubscriptions.set(boardId, unsub);
          return () => {
            unsub();
            this.activeSubscriptions.delete(boardId);
          };
        }
      } catch (err) {
        console.warn("Subscription initialization failed:", err);
      }
    }

    return () => {};
  }

  /**
   * Checks current user's role on the given board
   */
  public getUserRole(board?: Board, userId?: string): CollaboratorRole {
    if (!board || !board.isShared) return "owner";
    if (!userId) return "viewer";
    if (board.ownerId === userId) return "owner";

    const member = (board.members || []).find((m) => m.uid === userId);
    return member?.role || "viewer";
  }

  /**
   * Determines if the user can modify tasks/columns on the board
   */
  public canUserEdit(board?: Board, userId?: string): boolean {
    const role = this.getUserRole(board, userId);
    return role === "owner" || role === "editor";
  }
}

export const collaborationService = CollaborationService.getInstance();
