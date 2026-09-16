import { Board, CollaboratorRole } from "@/core/types/task";

/**
 * Role checks read nothing but the board object, so they stay out of collaborationService —
 * components call them during render and must not wait on the lazily loaded Firebase chunk.
 */
export function getUserRole(board?: Board, userId?: string): CollaboratorRole {
  if (!board || !board.isShared) return "owner";
  if (!userId) return "viewer";
  if (board.ownerId === userId) return "owner";

  const member = (board.members || []).find((m) => m.uid === userId);
  return member?.role || "viewer";
}

/** Determines if the user can modify tasks/columns on the board. */
export function canUserEdit(board?: Board, userId?: string): boolean {
  const role = getUserRole(board, userId);
  return role === "owner" || role === "editor";
}
