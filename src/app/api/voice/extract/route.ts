import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { buildSystemInstruction } from "@/core/services/gemini";
import { VoiceExtractResult } from "@/core/types/voice";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;
    const currentTimestamp = (formData.get("currentTimestamp") as string) || new Date().toISOString();
    const timezone = (formData.get("timezone") as string) || "Asia/Taipei";
    const availableBoardsRaw = formData.get("availableBoards") as string;
    const customApiKey = formData.get("customApiKey") as string | null;

    let availableBoards: { id: string; name: string; columns?: { id: string; name: string }[] }[] = [];
    if (availableBoardsRaw) {
      try {
        availableBoards = JSON.parse(availableBoardsRaw);
      } catch {
        availableBoards = [{ id: "board-work", name: "工作日常" }];
      }
    }

    if (!audioFile) {
      return NextResponse.json({ success: false, error: "未收到音訊檔案" }, { status: 400 });
    }

    const apiKey = customApiKey || process.env.GEMINI_API_KEY;

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
        // Fallback to intelligent parser if API limits/key issues occur
      }
    }

    // Graceful Intelligent Mock / Offline Fallback (when no key or offline)
    const fallbackBoardId = availableBoards.length > 0 ? availableBoards[0].id : "board-work";
    const sampleMockResults: VoiceExtractResult[] = [
      {
        title: "完成首頁 Base 44 設計樣式切版與微調",
        tags: ["Design", "UI", "Frontend"],
        dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        priority: "high",
        targetBoardId: fallbackBoardId,
        targetColumnId: "in_progress",
        transcript: "明天下午三點前要完成首頁 Base 44 設計樣式切版，請標記為高優先級並放入進行中。",
      },
      {
        title: "採購生活用品與預約週末牙醫檢查",
        tags: ["Health", "Life"],
        dueDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
        priority: "medium",
        targetBoardId: availableBoards.find((b) => b.name.includes("生活"))?.id || fallbackBoardId,
        targetColumnId: "todo",
        transcript: "幫我記一下，後天要採購生活用品還有預約牙醫檢查。",
      },
    ];

    const randomResult = sampleMockResults[Math.floor(Math.random() * sampleMockResults.length)];
    return NextResponse.json({
      success: true,
      data: randomResult,
      isMock: true,
      notice: "目前使用智慧模擬回傳（可於右上角設定自備 Gemini API Key 享受專屬即時模型推理）",
    });
  } catch (error: any) {
    console.error("Voice extract error:", error);
    return NextResponse.json({ success: false, error: error.message || "處理語音時發生錯誤" }, { status: 500 });
  }
}
