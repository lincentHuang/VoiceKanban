import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { encryptData } from "@/core/utils/crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apiKey, model = "gemini-2.0-flash" } = body;

    if (!apiKey || typeof apiKey !== "string" || apiKey.trim() === "") {
      return NextResponse.json({ success: false, error: "請輸入有效的 Gemini API Key" }, { status: 400 });
    }

    const cleanKey = apiKey.trim();

    // Verify key with Gemini API
    try {
      const ai = new GoogleGenAI({ apiKey: cleanKey });
      // Run a lightweight test ping
      const response = await ai.models.generateContent({
        model: model || "gemini-2.0-flash",
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
