import { NextRequest, NextResponse } from "next/server";
import { isR2Configured, uploadToR2 } from "@/core/services/r2Storage";
import { THUMBNAIL_REHOST_HOST_PATTERN } from "@/features/bookmarks/constants";
import { getBearerToken, verifyFirebaseIdToken } from "@/core/services/verifyIdToken";
import { consumeQuota, ONE_DAY_MS, ONE_MINUTE_MS } from "@/core/utils/rateLimit";

export const runtime = "nodejs";

const FETCH_TIMEOUT_MS = 8000;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
// This route writes into R2, the one billable service in the stack, so it is gated on a
// signed-in account and capped exactly like /api/upload.
const DAILY_REHOSTS = 50;
const BURST_REHOSTS = 10;

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

  const user = await verifyFirebaseIdToken(getBearerToken(req));
  if (!user || user.signInProvider === "anonymous") {
    return NextResponse.json(
      { success: false, error: "請先登入才能轉存圖片。", code: "AUTH_REQUIRED" },
      { status: 401 }
    );
  }

  const burst = consumeQuota(`thumb:burst:${user.uid}`, BURST_REHOSTS, ONE_MINUTE_MS);
  const daily = burst.ok ? consumeQuota(`thumb:day:${user.uid}`, DAILY_REHOSTS, ONE_DAY_MS) : burst;
  if (!burst.ok || !daily.ok) {
    const retryAfter = burst.ok ? daily.retryAfterSec : burst.retryAfterSec;
    return NextResponse.json(
      { success: false, error: "圖片轉存過於頻繁，請稍候再試。", code: "RATE_LIMITED" },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
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

    const uploaded = await uploadToR2(buffer, `thumbnail.${extension}`, contentType, `link-thumbnails/${user.uid}`);
    return NextResponse.json({ success: true, url: uploaded.url });
  } catch (error: any) {
    console.warn("Thumbnail rehost failed:", target.hostname, error?.message);
    return NextResponse.json({ success: false, error: "圖片轉存失敗" }, { status: 502 });
  }
}
