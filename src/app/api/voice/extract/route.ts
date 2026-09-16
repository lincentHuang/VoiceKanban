import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { buildSystemInstruction } from "@/core/services/gemini";
import { VoiceExtractResult } from "@/core/types/voice";
import { parseTranscriptLocally } from "@/core/services/localNlpParser";
import { consumeQuota, getClientIp, ONE_MINUTE_MS } from "@/core/utils/rateLimit";

export const runtime = "nodejs";

/** Audio is base64-encoded into memory before the Gemini call, so cap what we accept. */
const MAX_AUDIO_BYTES = 10 * 1024 * 1024;
const AUDIO_REQUESTS_PER_MINUTE = 10;

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let transcriptText = "";
    let customApiKey: string | null = null;
    let availableBoards: { id: string; name: string; columns?: { id: string; name: string }[] }[] = [];
    let audioFile: File | null = null;
    let currentTimestamp = new Date().toISOString();
    let timezone = "Asia/Taipei";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      transcriptText = body.transcript || "";
      customApiKey = body.customApiKey || null;
      availableBoards = body.availableBoards || [];
    } else {
      const formData = await req.formData();
      audioFile = formData.get("audio") as File | null;
      transcriptText = (formData.get("transcript") as string) || "";
      currentTimestamp = (formData.get("currentTimestamp") as string) || new Date().toISOString();
      timezone = (formData.get("timezone") as string) || "Asia/Taipei";
      const availableBoardsRaw = formData.get("availableBoards") as string;
      customApiKey = formData.get("customApiKey") as string | null;

      if (availableBoardsRaw) {
        try {
          availableBoards = JSON.parse(availableBoardsRaw);
        } catch {
          availableBoards = [{ id: "board-work", name: "工作日常" }];
        }
      }
    }

    const fallbackBoardId = availableBoards.length > 0 ? availableBoards[0].id : "board-work";
    // Cloud extraction always runs on the caller's own Gemini key. There is deliberately no
    // server-side key fallback: a shared key on a public deployment is billed to the operator
    // and can be drained by anyone who posts audio to this route.
    const apiKey = customApiKey;

    // 1. If user provided a transcript directly (from Web Speech API)
    if (transcriptText && transcriptText.trim().length > 0) {
      const localResult = parseTranscriptLocally(transcriptText, {
        boards: availableBoards,
        activeBoardId: fallbackBoardId,
      });

      return NextResponse.json({
        success: true,
        data: localResult,
        isOfflineLearned: true,
        notice: "已透過純前端 Web Speech 與本地半自動學習引擎成功剖析！",
      });
    }

    if (!audioFile) {
      return NextResponse.json({ success: false, error: "未收到音訊檔案或語音逐字稿" }, { status: 400 });
    }

    if (!apiKey || apiKey.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          error: "雲端語音解析需要自備 Gemini API Key，請至設定頁面填入後再試。",
          code: "API_KEY_REQUIRED",
        },
        { status: 400 }
      );
    }

    if (audioFile.size > MAX_AUDIO_BYTES) {
      return NextResponse.json(
        { success: false, error: "音訊檔案超過 10MB 限制", code: "FILE_TOO_LARGE" },
        { status: 400 }
      );
    }

    const burst = consumeQuota(
      `voice:${getClientIp(req)}`,
      AUDIO_REQUESTS_PER_MINUTE,
      ONE_MINUTE_MS
    );
    if (!burst.ok) {
      return NextResponse.json(
        { success: false, error: "語音解析請求過於頻繁，請稍候再試。", code: "RATE_LIMITED" },
        { status: 429, headers: { "Retry-After": String(burst.retryAfterSec) } }
      );
    }

    // Read audio into memory buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = audioFile.type || "audio/webm";

    try {
      const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
      const systemInstruction = buildSystemInstruction(currentTimestamp, timezone, availableBoards);

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: buffer.toString("base64"),
                  mimeType: mimeType.includes("mp4") ? "audio/mp4" : mimeType.includes("wav") ? "audio/wav" : "audio/webm",
                },
              },
              {
                text: "請分析這段語音，提取任務標題、標籤、到期時間、優先級、目標看板與欄位，並輸出繁體中文 JSON。",
              },
            ],
          },
        ],
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              dueDate: { type: Type.STRING },
              priority: { type: Type.STRING, enum: ["high", "medium", "low"] },
              targetBoardId: { type: Type.STRING },
              targetColumnId: { type: Type.STRING, enum: ["inbox", "todo", "in_progress", "done"] },
              transcript: { type: Type.STRING },
            },
            required: ["title", "priority", "targetBoardId", "targetColumnId", "transcript"],
          },
        },
      });

      const textResponse = response.text;
      if (textResponse) {
        const parsed = JSON.parse(textResponse) as VoiceExtractResult;
        return NextResponse.json({ success: true, data: parsed });
      }
    } catch (geminiError: any) {
      console.error("Gemini API Error:", geminiError);
      return NextResponse.json(
        {
          success: false,
          error: "Gemini 解析失敗，請確認自備的 API Key 是否有效或額度是否用盡。",
          code: "GEMINI_FAILED",
        },
        { status: 502 }
      );
    }

    // Reaching here means Gemini responded without usable content. The client falls back to
    // the local parser with the real transcript rather than showing invented sample tasks.
    return NextResponse.json(
      { success: false, error: "Gemini 未回傳可解析的內容", code: "EMPTY_RESPONSE" },
      { status: 502 }
    );
  } catch (error: any) {
    console.error("Voice extract error:", error);
    return NextResponse.json({ success: false, error: error.message || "處理語音時發生錯誤" }, { status: 500 });
  }
}

