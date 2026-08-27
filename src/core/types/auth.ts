export type AuthProvider = "google" | "apple" | "guest" | "email";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: AuthProvider;
  isAuthenticated: boolean;
  createdAt: string;
}

export type SyncStatus = "synced" | "syncing" | "offline" | "error";

export interface SyncState {
  status: SyncStatus;
  lastSyncedAt: string | null;
  errorMessage?: string;
}
