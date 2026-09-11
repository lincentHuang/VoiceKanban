import { SharedLinkDraft } from "../types";

// A share can arrive before the user is signed in (or across an OAuth redirect), so the
// draft is parked in sessionStorage until the share sheet is dismissed or saved.
const PENDING_SHARE_KEY = "vk_pending_share";

export function savePendingShare(draft: SharedLinkDraft | null): void {
  try {
    if (typeof window === "undefined") return;
    if (draft) sessionStorage.setItem(PENDING_SHARE_KEY, JSON.stringify(draft));
    else sessionStorage.removeItem(PENDING_SHARE_KEY);
  } catch {}
}

export function loadPendingShare(): SharedLinkDraft | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem(PENDING_SHARE_KEY);
    return raw ? (JSON.parse(raw) as SharedLinkDraft) : null;
  } catch {
    return null;
  }
}
