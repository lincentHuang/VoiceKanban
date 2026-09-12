import { NextRequest, NextResponse } from "next/server";
import { isR2Configured, uploadToR2 } from "@/core/services/r2Storage";
import { getBearerToken, verifyFirebaseIdToken } from "@/core/services/verifyIdToken";
import { consumeQuota, ONE_DAY_MS, ONE_MINUTE_MS } from "@/core/utils/rateLimit";

export const runtime = "nodejs";

/**
 * Abuse limits. R2 is the one service in this stack that bills on overage, so this route
 * is gated on a signed-in user and capped per account. Anonymous callers are turned away
 * and the client falls back to storing the file locally as base64.
 */
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const DAILY_UPLOAD_COUNT = 20;
const DAILY_UPLOAD_BYTES = 50 * 1024 * 1024;
const BURST_UPLOAD_COUNT = 5;

const ALLOWED_MIME_PREFIXES = ["image/", "audio/", "video/"];
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "text/csv",
]);

function isAllowedMimeType(type: string): boolean {
  return ALLOWED_MIME_PREFIXES.some((p) => type.startsWith(p)) || ALLOWED_MIME_TYPES.has(type);
}

/** Keeps a caller-supplied folder from escaping its prefix or injecting path segments. */
function sanitizeFolder(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32);
  return cleaned || "uploads";
}

/**
 * GET /api/upload
 * Health check to verify if Cloudflare R2 is configured
 */
export async function GET() {
  const configured = isR2Configured();
  return NextResponse.json({
    success: true,
    isConfigured: configured,
    storageType: configured ? "cloudflare-r2" : "local-fallback",
    hasPublicUrl: Boolean(process.env.NEXT_PUBLIC_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL),
  });
}

/**
 * POST /api/upload
 * Upload a file directly to Cloudflare R2. Requires a valid Firebase ID token from a
 * non-anonymous account, and stays within the per-account daily quota.
 */
export async function POST(req: NextRequest) {
  try {
    if (!isR2Configured()) {
      return NextResponse.json(
        {
          success: false,
          error: "Cloudflare R2 雲端儲存空間尚未在伺服器環境變數中完整設定。",
          code: "R2_NOT_CONFIGURED",
        },
        { status: 503 }
      );
    }

    const user = await verifyFirebaseIdToken(getBearerToken(req));
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "請先登入才能使用雲端儲存空間，檔案將改為儲存在本機。",
          code: "AUTH_REQUIRED",
        },
        { status: 401 }
      );
    }

    // Anonymous accounts can be minted endlessly by a script, which would defeat the
    // per-account quota below, so they do not get cloud storage.
    if (user.signInProvider === "anonymous") {
      return NextResponse.json(
        {
          success: false,
          error: "訪客帳號無法使用雲端儲存空間，請使用 Google 或電子郵件登入。",
          code: "AUTH_REQUIRED",
        },
        { status: 401 }
      );
    }

    const burst = consumeQuota(`upload:burst:${user.uid}`, BURST_UPLOAD_COUNT, ONE_MINUTE_MS);
    if (!burst.ok) {
      return NextResponse.json(
        { success: false, error: "上傳過於頻繁，請稍候再試。", code: "RATE_LIMITED" },
        { status: 429, headers: { "Retry-After": String(burst.retryAfterSec) } }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = sanitizeFolder((formData.get("folder") as string) || "uploads");

    if (!file) {
      return NextResponse.json(
        { success: false, error: "未收到任何上傳檔案" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { success: false, error: "檔案大小超過 5MB 限制", code: "FILE_TOO_LARGE" },
        { status: 400 }
      );
    }

    const mimeType = file.type || "application/octet-stream";
    if (!isAllowedMimeType(mimeType)) {
      return NextResponse.json(
        { success: false, error: `不支援的檔案類型：${mimeType}`, code: "UNSUPPORTED_TYPE" },
        { status: 400 }
      );
    }

    const dailyCount = consumeQuota(`upload:count:${user.uid}`, DAILY_UPLOAD_COUNT, ONE_DAY_MS);
    if (!dailyCount.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `已達每日 ${DAILY_UPLOAD_COUNT} 個檔案的上傳上限，檔案將改為儲存在本機。`,
          code: "QUOTA_EXCEEDED",
        },
        { status: 429, headers: { "Retry-After": String(dailyCount.retryAfterSec) } }
      );
    }

    const dailyBytes = consumeQuota(
      `upload:bytes:${user.uid}`,
      DAILY_UPLOAD_BYTES,
      ONE_DAY_MS,
      file.size
    );
    if (!dailyBytes.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "已達每日上傳容量上限，檔案將改為儲存在本機。",
          code: "QUOTA_EXCEEDED",
        },
        { status: 429, headers: { "Retry-After": String(dailyBytes.retryAfterSec) } }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadToR2(
      buffer,
      file.name || "unnamed-file",
      mimeType,
      `${folder}/${user.uid}`
    );

    return NextResponse.json({
      success: true,
      data: result,
      quota: {
        filesRemaining: dailyCount.remaining,
        bytesRemaining: dailyBytes.remaining,
      },
    });
  } catch (error: any) {
    console.error("R2 Upload API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "上傳至 Cloudflare R2 失敗",
        details: error.name || "UploadError",
      },
      { status: 500 }
    );
  }
}
