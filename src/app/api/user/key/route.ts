import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { encryptData } from "@/core/utils/crypto";
import { consumeQuota, getClientIp, ONE_HOUR_MS } from "@/core/utils/rateLimit";

export const runtime = "nodejs";

/**
 * Each call spends a real Gemini request (on the caller's own key) plus server time, so the
 * route is capped per IP. Without this it works as a free, unauthenticated key-checking
 * oracle that anyone can point at a list of stolen keys.
 */
const VERIFICATIONS_PER_HOUR = 5;
const MAX_KEY_LENGTH = 200;

export async function POST(req: NextRequest) {
  try {
    const limit = consumeQuota(`key-test:${getClientIp(req)}`, VERIFICATIONS_PER_HOUR, ONE_HOUR_MS);
    if (!limit.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "API Key 測試次數過多，請稍後再試。",
          code: "RATE_LIMITED",
        },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
      );
    }

    const body = await req.json();
    const { apiKey, model = "gemini-3.6-flash" } = body;

    if (!apiKey || typeof apiKey !== "string" || apiKey.trim() === "") {
      return NextResponse.json({ success: false, error: "請輸入有效的 Gemini API Key" }, { status: 400 });
    }

    const cleanKey = apiKey.trim();
    if (cleanKey.length > MAX_KEY_LENGTH) {
      return NextResponse.json({ success: false, error: "API Key 格式不正確" }, { status: 400 });
    }

    // Verify key with Gemini API
    try {
      const ai = new GoogleGenAI({ apiKey: cleanKey });
      // Run a lightweight test ping
      const response = await ai.models.generateContent({
        model: model || "gemini-3.6-flash",
        contents: "Hello, reply with 'OK' if you receive this test.",
      });

      if (response && response.text) {
        const encrypted = encryptData(cleanKey);
        return NextResponse.json({
          success: true,
          message: "API Key 連線測試成功！",
          model,
          isEncrypted: true,
          encryptedData: encrypted,
          testedAt: new Date().toISOString(),
        });
      } else {
        throw new Error("模型無回應");
      }
    } catch (apiError: any) {
      console.error("Gemini Key verification failed:", apiError);
      return NextResponse.json(
        {
          success: false,
          error: `API Key 驗證失敗: ${apiError.message || "請確認 Key 是否正確或具備存取權限"}`,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Key endpoint error:", error);
    return NextResponse.json({ success: false, error: error.message || "伺服器內部錯誤" }, { status: 500 });
  }
}
