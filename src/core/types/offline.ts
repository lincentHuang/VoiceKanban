export type OfflineSyncStatus = "online" | "offline" | "syncing" | "error";

export interface OfflineAction {
  id: string;
  type: "ADD_TASK" | "UPDATE_TASK" | "DELETE_TASK" | "MOVE_TASK" | "UPDATE_BOARD" | "BATCH_ACTION";
  payload: any;
  timestamp: string;
}

export interface OfflineState {
  isOnline: boolean;
  isManualOffline: boolean;
  pendingSyncCount: number;
  lastOnlineAt: string | null;
  bannerDismissed: boolean;
}
