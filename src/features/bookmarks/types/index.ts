import { LinkPlatform } from "@/core/types/task";

/** Metadata scraped by /api/link/preview for a shared URL. */
export interface LinkPreview {
  title: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  author: string | null;
  siteName: string | null;
}

export interface LinkPreviewResponse {
  success: boolean;
  preview?: LinkPreview;
  error?: string;
}

/** Raw payload received from the OS share sheet (Web Share Target) or a pasted link. */
export interface SharedLinkDraft {
  url: string | null;
  platform: LinkPlatform;
  sharedTitle: string | null;
  sharedText: string | null;
  receivedAt: string;
}
