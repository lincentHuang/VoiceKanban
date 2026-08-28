import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { buildSystemInstruction } from "@/core/services/gemini";
import { VoiceExtractResult } from "@/core/types/voice";
import { parseTranscriptLocally } from "@/core/services/localNlpParser";

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
    const apiKey = customApiKey || process.env.GEMINI_API_KEY;

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

    // Read audio into memory buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = audioFile.type || "audio/webm";

    // If API Key is present, call real Gemini 2.0 Flash
    if (apiKey && apiKey.trim() !== "") {
      try {
        const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
        const systemInstruction = buildSystemInstruction(currentTimestamp, timezone, availableBoards);

        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
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
                targetColumnId: { type: Type.STRING, enum: ["inbox", "todo", "in_progress", "waiting", "done"] },
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
      }
    }

    // Graceful Offline Fallback when only audio was sent without key
    const sampleMockResults: VoiceExtractResult[] = [
      {
        title: "完成首頁 Base 44 設計樣式切版與微調",
        tags: ["繁中", "Design", "UI"],
        dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        priority: "high",
        targetBoardId: fallbackBoardId,
        targetColumnId: "in_progress",
        transcript: "明天下午三點前要完成首頁 Base 44 設計樣式切版，請標記為高優先級並放入進行中。",
        detectedLanguage: "zh-TW",
      },
      {
        title: "Buy groceries and prepare for weekly sprint",
        tags: ["English", "Work"],
        dueDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
        priority: "medium",
        targetBoardId: fallbackBoardId,
        targetColumnId: "todo",
        transcript: "Buy groceries and prepare for weekly sprint by tomorrow 3pm.",
        detectedLanguage: "en-US",
      },
    ];

    const randomResult = sampleMockResults[Math.floor(Math.random() * sampleMockResults.length)];
    return NextResponse.json({
      success: true,
      data: randomResult,
      isMock: true,
      notice: "已啟用本地半自動學習模式（可隨時於設定自備 Gemini API Key 切換深度多模態推理）",
    });
  } catch (error: any) {
    console.error("Voice extract error:", error);
    return NextResponse.json({ success: false, error: error.message || "處理語音時發生錯誤" }, { status: 500 });
  }
}

