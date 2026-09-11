import { LinkPreview, LinkPreviewResponse } from "../types";

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
