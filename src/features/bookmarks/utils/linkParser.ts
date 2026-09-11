import { LinkPlatform } from "@/core/types/task";
import { SharedLinkDraft } from "../types";

const URL_PATTERN = /https?:\/\/[^\s<>"'「」]+/i;

// Share-tracking params the apps append; stripping them keeps duplicate detection reliable.
const TRACKING_PARAMS = ["igsh", "igshid", "si", "feature", "xmt", "slof", "fbclid", "gclid", "mibextid"];

/** Pulls the first http(s) URL out of free text (IG/Threads put the link inside `text`, not `url`). */
export function extractFirstUrl(...candidates: (string | null | undefined)[]): string | null {
  for (const candidate of candidates) {
    if (!candidate) continue;
    const match = candidate.match(URL_PATTERN);
    if (match) return match[0].replace(/[),.;!?，。！？]+$/, "");
  }
  return null;
}

/** True when the text is nothing but a single http(s) URL, e.g. a link pasted as a card title. */
export function isBareUrl(text: string | null | undefined): boolean {
  return /^https?:\/\/\S+$/i.test((text || "").trim());
}

export function normalizeSharedUrl(raw: string): string {
  try {
    const url = new URL(raw);
    TRACKING_PARAMS.forEach((p) => url.searchParams.delete(p));
    Array.from(url.searchParams.keys())
      .filter((k) => k.startsWith("utm_"))
      .forEach((k) => url.searchParams.delete(k));
    url.hash = "";
    return url.toString();
  } catch {
    return raw;
  }
}

export function detectPlatform(raw: string | null): LinkPlatform {
  if (!raw) return "other";
  let host: string;
  try {
    host = new URL(raw).hostname.toLowerCase();
  } catch {
    return "other";
  }
  if (host === "youtu.be" || host.endsWith("youtube.com")) return "youtube";
  if (host === "instagr.am" || host.endsWith("instagram.com")) return "instagram";
  if (host.endsWith("threads.net") || host.endsWith("threads.com")) return "threads";
  return "other";
}

export function getYouTubeVideoId(raw: string): string | null {
  try {
    const url = new URL(raw);
    if (url.hostname === "youtu.be") return url.pathname.slice(1).split("/")[0] || null;
    const v = url.searchParams.get("v");
    if (v) return v;
    const match = url.pathname.match(/^\/(?:shorts|live|embed)\/([\w-]{6,})/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export function buildSharedDraft(input: {
  url?: string | null;
  text?: string | null;
  title?: string | null;
}): SharedLinkDraft {
  const found = extractFirstUrl(input.url, input.text, input.title);
  const url = found ? normalizeSharedUrl(found) : null;
  return {
    url,
    platform: detectPlatform(url),
    sharedTitle: input.title?.trim() || null,
    sharedText: input.text?.trim() || null,
    receivedAt: new Date().toISOString(),
  };
}

/** Collapses a long caption into a card-friendly one-line title. */
export function toCardTitle(text: string | null | undefined, maxLength = 80): string {
  const firstLine = (text || "").split(/\r?\n/).map((l) => l.trim()).find(Boolean) || "";
  return firstLine.length > maxLength ? `${firstLine.slice(0, maxLength).trimEnd()}…` : firstLine;
}

export function getDisplayHost(raw: string): string {
  try {
    return new URL(raw).hostname.replace(/^www\./, "");
  } catch {
    return raw;
  }
}
