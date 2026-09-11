import { NextRequest, NextResponse } from "next/server";
import { isR2Configured, uploadToR2 } from "@/core/services/r2Storage";
import { THUMBNAIL_REHOST_HOST_PATTERN } from "@/features/bookmarks/constants";

export const runtime = "nodejs";

const FETCH_TIMEOUT_MS = 8000;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
};

/**
 * POST /api/link/thumbnail  { url }
 * Copies an expiring Instagram / Threads thumbnail into R2 so saved cards (and the image in their
 * description) keep working. Only Meta CDN hosts are accepted, so this can't act as an open proxy.
 */
export async function POST(req: NextRequest) {
  if (!isR2Configured()) {
    return NextResponse.json({ success: false, code: "R2_NOT_CONFIGURED" }, { status: 503 });
  }

  let target: URL;
  try {
    const body = await req.json();
    target = new URL(String(body?.url || ""));
  } catch {
    return NextResponse.json({ success: false, error: "圖片網址格式不正確" }, { status: 400 });
  }
  if (target.protocol !== "https:" || !THUMBNAIL_REHOST_HOST_PATTERN.test(target.hostname)) {
    return NextResponse.json({ success: false, error: "不支援的圖片來源" }, { status: 400 });
  }

  try {
    const res = await fetch(target, { redirect: "error", signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    const contentType = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    const extension = EXTENSION_BY_TYPE[contentType];
    if (!res.ok || !extension) {
      return NextResponse.json({ success: false, error: "無法下載圖片" }, { status: 502 });
    }
    if (Number(res.headers.get("content-length") || 0) > MAX_IMAGE_BYTES) {
      return NextResponse.json({ success: false, error: "圖片過大" }, { status: 413 });
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.byteLength > MAX_IMAGE_BYTES) {
      return NextResponse.json({ success: false, error: "圖片過大" }, { status: 413 });
    }

    const uploaded = await uploadToR2(buffer, `thumbnail.${extension}`, contentType, "link-thumbnails");
    return NextResponse.json({ success: true, url: uploaded.url });
  } catch (error: any) {
    console.warn("Thumbnail rehost failed:", target.hostname, error?.message);
    return NextResponse.json({ success: false, error: "圖片轉存失敗" }, { status: 502 });
  }
}
