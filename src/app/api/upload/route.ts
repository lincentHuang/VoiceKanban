import { NextRequest, NextResponse } from "next/server";
import { isR2Configured, uploadToR2 } from "@/core/services/r2Storage";

export const runtime = "nodejs";

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
    bucket: process.env.R2_BUCKET_NAME || null,
    hasPublicUrl: Boolean(process.env.NEXT_PUBLIC_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL),
  });
}

/**
 * POST /api/upload
 * Upload a file directly to Cloudflare R2
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

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "未收到任何上傳檔案" },
        { status: 400 }
      );
    }

    // Limit to 25MB per upload
    const MAX_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "檔案大小超過 25MB 限制" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadToR2(
      buffer,
      file.name || "unnamed-file",
      file.type || "application/octet-stream",
      folder
    );

    return NextResponse.json({
      success: true,
      data: result,
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
