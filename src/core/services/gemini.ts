import { VoiceExtractResult } from "../types/voice";
import { Board, ColumnId, Priority } from "../types/task";

export const GEMINI_EXTRACT_SCHEMA = {
  type: "OBJECT",
  properties: {
    title: {
      type: "STRING",
      description: "簡明扼要的任務標題，保留具體動作與主詞，例如：'修改首頁 RWD 響應式排版'",
    },
    tags: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "適合該任務的分類標籤，例如：['Frontend', 'Design', '緊急']",
    },
    dueDate: {
      type: "STRING",
      description: "轉換為標準 ISO-8601 時間字串 (如 2026-08-24T15:00:00.000Z)，若語音未提及時間則回傳 null",
    },
    priority: {
      type: "STRING",
      enum: ["high", "medium", "low"],
      description: "任務優先級：提及緊急/立刻/重要為 high，常規為 medium，次要為 low",
    },
    targetBoardId: {
      type: "STRING",
      description: "最匹配的目標看板 ID。根據使用者語音意圖與可選看板名稱進行選擇",
    },
    targetColumnId: {
      type: "STRING",
      enum: ["inbox", "todo", "in_progress", "waiting", "done"],
      description: "目標欄位 ID：若提及正在做為 in_progress，待辦為 todo，隨手記錄為 inbox，等待為 waiting，完成為 done",
    },
    transcript: {
      type: "STRING",
      description: "語音逐字稿，保留精確的中文/英文辨識結果",
    },
  },
  required: ["title", "priority", "targetBoardId", "targetColumnId", "transcript"],
};

export function buildSystemInstruction(
  currentTimestamp: string,
  timezone: string,
  availableBoards: { id: string; name: string; columns?: { id: string; name: string }[] }[]
): string {
  const boardsListStr = availableBoards
    .map((b) => `- 看板 ID: "${b.id}", 看板名稱: "${b.name}"`)
    .join("\n");

  return `你是一個專為 VoiceKanban (語音智能看板) 服務的精確 AI 助理。
當前基準時間 (Local Time)：${currentTimestamp} (時區: ${timezone})。

使用者將提供一段音訊（語音備忘錄或任務口述）。你的任務是：
1. 完整聽寫使用者的語音內容為中文/英文逐字稿 (transcript)。
2. 從語音中萃取核心任務標題 (title)，去除「請幫我記一下」、「我想做」等贅字。
3. 提取相關標籤 (tags)。
4. 計算精確的到期時間 (dueDate, ISO-8601)，例如「明天下午三點」應基於 ${currentTimestamp} 計算出實際日期。如果未提及時間，填入 null。
5. 判斷優先等級 (priority: "high" | "medium" | "low")。
6. 根據語意將任務分流至最適合的看板 (targetBoardId)：
${boardsListStr}
若語意不明確，預設指向第一個看板。
7. 判斷任務所屬欄位 (targetColumnId: "inbox" | "todo" | "in_progress" | "waiting" | "done")，預設為 "inbox" 或 "todo"。

請嚴格按照提供的 JSON Schema 輸出結構化資料。`;
}
