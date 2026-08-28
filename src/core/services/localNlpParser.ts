import { ColumnId, Priority } from "../types/task";
import { VoiceExtractResult } from "../types/voice";

export interface BoardColumnContext {
  boards: { id: string; name: string }[];
  activeBoardId: string;
  columns?: { id: string; title: string }[];
}

/**
 * Detect whether the spoken text is Chinese (zh-TW) or English (en-US).
 */
export function detectLanguage(text: string): "zh-TW" | "en-US" {
  if (!text || text.trim() === "") return "zh-TW";
  
  // Count Chinese characters (CJK Unified Ideographs)
  const chineseMatch = text.match(/[\u4e00-\u9fa5\u3400-\u4dbf\uf900-\ufaff]/g);
  const chineseCount = chineseMatch ? chineseMatch.length : 0;
  
  // Count English alphabetic words
  const englishWords = text.match(/[a-zA-Z]+/g);
  const englishCharCount = englishWords ? englishWords.join("").length : 0;
  
  // If Chinese characters are present and account for substantial weight, prefer zh-TW
  if (chineseCount > 0 && (chineseCount * 2 >= englishCharCount || chineseCount >= 2)) {
    return "zh-TW";
  }
  
  if (englishCharCount > 0) {
    return "en-US";
  }
  
  return "zh-TW";
}

/**
 * Parses relative date/time expressions in Chinese and English.
 */
export function parseDateTime(text: string, baseDate = new Date()): { dueDate: string | null; matchedPhrase: string | null } {
  const lower = text.toLowerCase();
  const d = new Date(baseDate);

  // --- Chinese Date/Time Parsing ---
  let targetDate = new Date(d);
  const matchedChinese: string[] = [];
  let hasDate = false;

  if (text.includes("今天") || text.includes("今日") || text.includes("今晚")) {
    hasDate = true;
    matchedChinese.push(text.includes("今晚") ? "今晚" : "今天");
  } else if (text.includes("大後天")) {
    targetDate.setDate(d.getDate() + 3);
    hasDate = true;
    matchedChinese.push("大後天");
  } else if (text.includes("後天")) {
    targetDate.setDate(d.getDate() + 2);
    hasDate = true;
    matchedChinese.push("後天");
  } else if (text.includes("明天") || text.includes("明日")) {
    targetDate.setDate(d.getDate() + 1);
    hasDate = true;
    matchedChinese.push("明天");
  }

  // Chinese weekday pattern: 下週[一二三四五六日天] or 週[一二三四五六日天]
  const weekdayMap: Record<string, number> = {
    "一": 1, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6, "日": 0, "天": 0
  };
  const weekMatch = text.match(/(下週|下星期|這週|這星期|週|星期)([一二三四五六日天])/);
  if (weekMatch) {
    const isNext = weekMatch[1].startsWith("下");
    const targetDay = weekdayMap[weekMatch[2]];
    const currentDay = d.getDay();
    let diff = (targetDay + 7 - currentDay) % 7;
    if (diff === 0 && isNext) diff = 7;
    if (isNext && diff < 7) diff += 7;
    targetDate.setDate(d.getDate() + (diff === 0 ? 7 : diff));
    hasDate = true;
    matchedChinese.push(weekMatch[0]);
  }

  // Chinese Time: (prefix)? (number) 點 (minute)? (suffix)?
  const timeRegex = /(早上|上午|下午|晚上|中午|凌晨|傍晚|夜間)?\s*([0-9]|1[0-9]|2[0-4]|一|二|兩|三|四|五|六|七|八|九|十|十一|十二)\s*(點|點鐘|分)?(\s*(半|[0-9]{1,2}|三十|十五|四十五)分?)?\s*(早上|上午|下午|晚上|中午|凌晨|傍晚|夜間)?/;
  const timeMatch = text.match(timeRegex);

  if (timeMatch && (timeMatch[3] === "點" || timeMatch[3] === "點鐘" || timeMatch[1] || timeMatch[5])) {
    hasDate = true;
    const prefixPeriod = timeMatch[1] || "";
    const suffixPeriod = timeMatch[5] || "";
    const period = prefixPeriod || suffixPeriod || "";

    const zhNumMap: Record<string, number> = {
      "一": 1, "二": 2, "兩": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9, "十": 10, "十一": 11, "十二": 12
    };
    const hourStr = timeMatch[2];
    let hour = zhNumMap[hourStr] !== undefined ? zhNumMap[hourStr] : parseInt(hourStr, 10);

    const isPm =
      period === "下午" ||
      period === "晚上" ||
      period === "傍晚" ||
      period === "夜間" ||
      (text.includes("下午") && !text.includes("上午")) ||
      (text.includes("晚上") && !text.includes("早上"));

    const isAm = period === "早上" || period === "上午" || period === "凌晨";

    if (isPm && hour < 12) {
      hour += 12;
    } else if (isAm && hour === 12) {
      hour = 0;
    } else if (!isPm && !isAm) {
      // If hour is 1-6 without AM/PM explicit, assume PM for tasks (e.g. 5點 -> 17:00)
      if (hour >= 1 && hour <= 6) {
        hour += 12;
      }
    }

    let minute = 0;
    const minStr = timeMatch[4];
    if (minStr) {
      if (minStr.includes("半") || minStr.includes("三十")) minute = 30;
      else if (minStr.includes("十五")) minute = 15;
      else if (minStr.includes("四十五")) minute = 45;
      else {
        const num = parseInt(minStr.replace(/\D/g, ""), 10);
        if (!isNaN(num)) minute = num;
      }
    }

    targetDate.setHours(hour, minute, 0, 0);
    matchedChinese.push(timeMatch[0].trim());
    if (period && !timeMatch[0].includes(period)) {
      matchedChinese.push(period);
    }
  } else if (hasDate) {
    if (text.includes("今晚") || text.includes("晚上")) {
      targetDate.setHours(20, 0, 0, 0);
    } else {
      targetDate.setHours(18, 0, 0, 0);
    }
  }

  for (const p of ["早上", "上午", "下午", "晚上", "中午", "凌晨", "傍晚"]) {
    if (text.includes(p) && !matchedChinese.some((m) => m.includes(p))) {
      matchedChinese.push(p);
    }
  }

  if (hasDate) {
    return {
      dueDate: targetDate.toISOString(),
      matchedPhrase: matchedChinese.join(" "),
    };
  }

  // --- English Date/Time Parsing ---
  let hasEnDate = false;
  const matchedEn: string[] = [];
  const enDate = new Date(d);

  if (lower.includes("day after tomorrow")) {
    enDate.setDate(d.getDate() + 2);
    hasEnDate = true;
    matchedEn.push("day after tomorrow");
  } else if (lower.includes("tomorrow")) {
    enDate.setDate(d.getDate() + 1);
    hasEnDate = true;
    matchedEn.push("tomorrow");
  } else if (lower.includes("today") || lower.includes("tonight")) {
    hasEnDate = true;
    matchedEn.push(lower.includes("tonight") ? "tonight" : "today");
    if (lower.includes("tonight")) enDate.setHours(20, 0, 0, 0);
  }

  // English weekday: next monday, by friday, on tuesday
  const enWeekMatch = lower.match(/(?:next|this|by|on)?\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/);
  if (enWeekMatch && !hasEnDate) {
    const enDayMap: Record<string, number> = {
      sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6
    };
    const targetDay = enDayMap[enWeekMatch[1]];
    const currentDay = d.getDay();
    let diff = (targetDay + 7 - currentDay) % 7;
    if (diff === 0 || lower.includes("next " + enWeekMatch[1])) diff += 7;
    enDate.setDate(d.getDate() + diff);
    hasEnDate = true;
    matchedEn.push(enWeekMatch[0]);
  }

  // English Time: at 3pm, 10:30 am, 5 o'clock, 5pm
  const enTimeMatch = lower.match(/(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm|o'clock)?(?:\s*(in the afternoon|in the morning|in the evening|at night|pm|am))?/);
  if (enTimeMatch && (enTimeMatch[3] || enTimeMatch[4] || lower.includes("at " + enTimeMatch[1]))) {
    let hour = parseInt(enTimeMatch[1], 10);
    const minute = enTimeMatch[2] ? parseInt(enTimeMatch[2], 10) : 0;
    const isPm =
      enTimeMatch[3] === "pm" ||
      enTimeMatch[4]?.includes("afternoon") ||
      enTimeMatch[4]?.includes("evening") ||
      enTimeMatch[4]?.includes("night") ||
      enTimeMatch[4] === "pm";

    const isAm = enTimeMatch[3] === "am" || enTimeMatch[4]?.includes("morning") || enTimeMatch[4] === "am";

    if (isPm && hour < 12) hour += 12;
    if (isAm && hour === 12) hour = 0;
    if (!isPm && !isAm && hour >= 1 && hour <= 6) hour += 12;

    enDate.setHours(hour, minute, 0, 0);
    hasEnDate = true;
    matchedEn.push(enTimeMatch[0].trim());
  } else if (hasEnDate && !lower.includes("tonight")) {
    enDate.setHours(18, 0, 0, 0);
  }

  if (hasEnDate) {
    return {
      dueDate: enDate.toISOString(),
      matchedPhrase: matchedEn.join(" "),
    };
  }

  return { dueDate: null, matchedPhrase: null };
}

/**
 * Extracts priority from transcript.
 */
export function parsePriority(text: string): { priority: Priority; matchedPhrase: string | null } {
  const lower = text.toLowerCase();
  
  const highKeywordsZh = ["高優先級", "高優先等級", "非常重要", "高優先", "緊急", "重大", "立刻", "急件", "馬上"];
  const highKeywordsEn = ["high priority", "urgent", "asap", "critical", "crucial", "immediately", "p0", "p1"];
  
  for (const kw of highKeywordsZh) {
    if (text.includes(kw)) return { priority: "high", matchedPhrase: kw };
  }
  for (const kw of highKeywordsEn) {
    if (lower.includes(kw)) return { priority: "high", matchedPhrase: kw };
  }

  const lowKeywordsZh = ["低優先級", "低優先等級", "有空再做", "低優先", "隨便", "不急", "延後", "參考", "瑣事"];
  const lowKeywordsEn = ["low priority", "not urgent", "whenever", "later", "trivial", "someday", "p3"];
  
  for (const kw of lowKeywordsZh) {
    if (text.includes(kw)) return { priority: "low", matchedPhrase: kw };
  }
  for (const kw of lowKeywordsEn) {
    if (lower.includes(kw)) return { priority: "low", matchedPhrase: kw };
  }

  return { priority: "medium", matchedPhrase: null };
}

/**
 * Matches target board and column from context and spoken phrases.
 */
export function matchBoardAndColumn(
  text: string,
  context: BoardColumnContext
): {
  boardId: string;
  columnId: ColumnId;
  matchedBoardName: string | null;
  matchedColumnName: string | null;
} {
  let targetBoardId = context.activeBoardId || (context.boards.length > 0 ? context.boards[0].id : "board-work");
  let matchedBoardName: string | null = null;
  let targetColumnId: ColumnId = "inbox";
  let matchedColumnName: string | null = null;

  const lower = text.toLowerCase();

  // Match Boards
  for (const b of context.boards) {
    const cleanBoardName = b.name.replace(/[^\w\u4e00-\u9fa5]/g, "").toLowerCase();
    if (cleanBoardName.length >= 2 && lower.includes(cleanBoardName)) {
      targetBoardId = b.id;
      matchedBoardName = b.name;
      break;
    }
  }

  // Match Columns
  if (lower.includes("進行中") || lower.includes("in progress") || lower.includes("doing")) {
    targetColumnId = "in_progress";
    matchedColumnName = "進行中";
  } else if (lower.includes("待辦") || lower.includes("待處理") || lower.includes("to do") || lower.includes("todo")) {
    targetColumnId = "todo";
    matchedColumnName = "待辦清單";
  } else if (lower.includes("已完成") || lower.includes("完成") || lower.includes("done") || lower.includes("finished")) {
    targetColumnId = "done";
    matchedColumnName = "已完成";
  } else if (lower.includes("等待") || lower.includes("卡住") || lower.includes("waiting") || lower.includes("block")) {
    targetColumnId = "waiting";
    matchedColumnName = "等待/卡關";
  } else if (lower.includes("收件夾") || lower.includes("收集箱") || lower.includes("inbox")) {
    targetColumnId = "inbox";
    matchedColumnName = "收件夾";
  }

  return {
    boardId: targetBoardId,
    columnId: targetColumnId,
    matchedBoardName,
    matchedColumnName,
  };
}

/**
 * Clean spoken prefix/postfix phrases to extract a clean task title.
 */
export function extractCleanTitle(
  text: string,
  matchedPhrases: (string | null | undefined)[]
): string {
  let clean = text;

  for (const phrase of matchedPhrases) {
    if (phrase && phrase.trim().length > 0) {
      // Split on spaces and remove each component
      const parts = phrase.split(/\s+/);
      for (const p of parts) {
        if (p.trim().length > 0) {
          clean = clean.split(p.trim()).join("");
        }
      }
    }
  }

  // Remove leftover board/column intent words and filler particles
  clean = clean.replace(/(高優先級|中優先級|低優先級|高優先|中優先|低優先|優先級|優先等級)/g, " ");
  clean = clean.replace(/(放進|放到|移到|移至|標記為|設為|放入|前要|前需|前)/g, " ");
  clean = clean.replace(/\b(put into|move to|set priority to|mark as|by|at)\b\s*/gi, " ");
  clean = clean.replace(/^[，,。！!？?\s:：]+|[，,。！!？?\s:：]+$/g, "").trim();

  const boilerplatePrefixes = [
    /^幫我(記一下|新增|記錄|建立|提醒|安排|記)/,
    /^請幫我(記一下|新增|記錄|建立|提醒|安排|記)/,
    /^請(記一下|新增|記錄|建立|提醒|安排|記)/,
    /^記一下/,
    /^提醒我(要)?/,
    /^記得(要)?/,
    /^我要/,
    /^要/,
    /^去/,
    /^add a task (to|for)?/i,
    /^create a task (to|for)?/i,
    /^remind me to/i,
    /^please record/i,
  ];

  for (const prefix of boilerplatePrefixes) {
    clean = clean.replace(prefix, "");
  }

  clean = clean.replace(/^[，,。！!？?\s:：]+|[，,。！!？?\s:：]+$/g, "").trim();

  if (clean.length < 2) {
    return text.replace(/^[，,。！!？?\s]+|[，,。！!？?\s]+$/g, "").trim();
  }

  return clean;
}

/**
 * Full Offline Heuristic NLP pipeline.
 */
export function parseTranscriptLocally(
  transcript: string,
  context: BoardColumnContext
): VoiceExtractResult {
  const language = detectLanguage(transcript);
  const { dueDate, matchedPhrase: datePhrase } = parseDateTime(transcript);
  const { priority, matchedPhrase: priorityPhrase } = parsePriority(transcript);
  const { boardId, columnId, matchedBoardName, matchedColumnName } = matchBoardAndColumn(transcript, context);

  const matchedPhrases = [datePhrase, priorityPhrase, matchedBoardName, matchedColumnName];
  const title = extractCleanTitle(transcript, matchedPhrases);

  const tags: string[] = [language === "zh-TW" ? "繁中" : "English"];
  
  if (transcript.toLowerCase().includes("bug") || transcript.includes("修復") || transcript.includes("問題")) {
    tags.push("Bug");
  }
  if (transcript.toLowerCase().includes("meeting") || transcript.includes("開會") || transcript.includes("對接")) {
    tags.push("會議");
  }
  if (transcript.toLowerCase().includes("design") || transcript.includes("設計") || transcript.includes("切版") || transcript.includes("ui")) {
    tags.push("Design");
  }

  return {
    title: title || (language === "zh-TW" ? "語音口述任務" : "Voice Task"),
    tags,
    dueDate,
    priority,
    targetBoardId: boardId,
    targetColumnId: columnId,
    transcript,
    detectedLanguage: language,
    isOfflineLearned: false,
    confidence: 0.92,
    matchedRules: matchedPhrases.filter(Boolean) as string[],
  };
}
