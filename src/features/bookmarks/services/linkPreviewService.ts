import { LinkPreview, LinkPreviewResponse } from "../types";
import { THUMBNAIL_REHOST_HOST_PATTERN } from "../constants";
import { getAuthHeader } from "@/core/utils/authToken";

/** Resolves to null (never throws) so the share sheet can always fall back to saving the bare URL. */
export async function fetchLinkPreview(url: string, signal?: AbortSignal): Promise<LinkPreview | null> {
  try {
    const res = await fetch(`/api/link/preview?url=${encodeURIComponent(url)}`, { signal });
    const data: LinkPreviewResponse = await res.json();
    return data.success && data.preview ? data.preview : null;
  } catch {
    return null;
  }
}

export function needsThumbnailRehost(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    return THUMBNAIL_REHOST_HOST_PATTERN.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

/** Returns an R2 copy of an expiring IG / Threads thumbnail, or the original URL when that isn't possible. */
export async function persistThumbnail(url: string): Promise<string> {
  if (!needsThumbnailRehost(url)) return url;
  // Rehosting writes to R2, which requires a signed-in account. Guests keep the original
  // (expiring) URL rather than failing the save.
  const authHeader = await getAuthHeader();
  if (!authHeader) return url;
  try {
    const res = await fetch("/api/link/thumbnail", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    return data.success && typeof data.url === "string" ? data.url : url;
  } catch {
    return url;
  }
}
