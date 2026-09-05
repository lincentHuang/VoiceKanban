export type CollaboratorRole = "owner" | "editor" | "viewer";

export interface BoardMember {
  uid: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  role: CollaboratorRole;
  joinedAt: string;
  isOnline?: boolean;
  lastActiveAt?: string;
}

export interface SharedBoardData {
  id: string;
  name: string;
  description?: string;
  icon: string;
  inviteCode: string;
  ownerId: string;
  members: BoardMember[];
  columns: any[];
  tasks: Record<string, any>;
  updatedAt: string;
}

export interface JoinBoardResult {
  success: boolean;
  message?: string;
  board?: any;
}
