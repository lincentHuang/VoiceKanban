import { ColumnId, Priority } from "../types/task";
import {
  CorrectionFeedbackPayload,
  LearningModelData,
  LearningStats,
  VoiceExtractResult,
} from "../types/voice";
import { BoardColumnContext, parseTranscriptLocally } from "./localNlpParser";

const STORAGE_KEY = "voicekanban_learning_model_v1";

const CHINESE_STOPWORDS = new Set([
  "的", "了", "在", "和", "是", "我", "你", "他", "她", "它", "這", "那", "就", "把", "被",
  "讓", "給", "到", "從", "對", "請", "幫", "一下", "個", "一些", "點", "有", "要", "會", "能"
]);

const ENGLISH_STOPWORDS = new Set([
  "a", "an", "the", "in", "on", "at", "to", "for", "of", "and", "or", "is", "are", "was",
  "were", "i", "you", "he", "she", "it", "we", "they", "me", "my", "your", "our", "please",
  "help", "can", "will", "do", "task", "todo", "into", "as", "by", "with"
]);

/**
 * Tokenizes Chinese and English text into feature keywords.
 */
export function extractFeatureTokens(text: string): string[] {
  if (!text) return [];

  const tokens: string[] = [];
  const lower = text.toLowerCase();

  // 1. Extract English words (length >= 2, non-stopword)
  const enWords = lower.match(/[a-z0-9]+/g) || [];
  for (const word of enWords) {
    if (word.length >= 2 && !ENGLISH_STOPWORDS.has(word)) {
      tokens.push(word);
    }
  }

  // 2. Extract Chinese characters & bi-grams
  const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || [];
  for (let i = 0; i < chineseChars.length; i++) {
    const char = chineseChars[i];
    if (!CHINESE_STOPWORDS.has(char)) {
      // 1-gram
      tokens.push(char);
    }
    // 2-gram
    if (i < chineseChars.length - 1) {
      const bigram = char + chineseChars[i + 1];
      if (!CHINESE_STOPWORDS.has(char) && !CHINESE_STOPWORDS.has(chineseChars[i + 1])) {
        tokens.push(bigram);
      }
    }
  }

  return Array.from(new Set(tokens));
}

export class SemiAutomaticLearningEngine {
  private model: LearningModelData;

  constructor() {
    this.model = this.loadModel();
  }

  private getDefaultModel(): LearningModelData {
    return {
      version: 1,
      totalSamples: 0,
      lastTrainedAt: new Date().toISOString(),
      vocabulary: {},
      features: {
        boardWeights: {},
        columnWeights: {},
        priorityWeights: {},
        tagAssociations: {},
      },
      languageStats: {
        zhCount: 0,
        enCount: 0,
      },
    };
  }

  private loadModel(): LearningModelData {
    if (typeof window === "undefined") return this.getDefaultModel();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn("Failed to load learning model from localStorage:", e);
    }
    return this.getDefaultModel();
  }

  private saveModel(): void {
    if (typeof window === "undefined") return;
    try {
      this.model.lastTrainedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.model));
    } catch (e) {
      console.error("Failed to save learning model:", e);
    }
  }

  /**
   * Records user confirmation or correction feedback and reinforces feature weights.
   */
  public recordUserCorrection(payload: CorrectionFeedbackPayload): void {
    const tokens = extractFeatureTokens(`${payload.transcript} ${payload.finalTitle}`);
    if (tokens.length === 0) return;

    this.model.totalSamples += 1;

    // Track language count
    if (payload.detectedLanguage === "zh-TW") {
      this.model.languageStats.zhCount += 1;
    } else {
      this.model.languageStats.enCount += 1;
    }

    // Reinforce weights for each token
    for (const token of tokens) {
      // 1. Vocabulary frequency
      this.model.vocabulary[token] = (this.model.vocabulary[token] || 0) + 1;

      // 2. Board weight reinforcement
      if (payload.finalBoardId) {
        if (!this.model.features.boardWeights[token]) {
          this.model.features.boardWeights[token] = {};
        }
        this.model.features.boardWeights[token][payload.finalBoardId] =
          (this.model.features.boardWeights[token][payload.finalBoardId] || 0) + 2;
      }

      // 3. Column weight reinforcement
      if (payload.finalColumnId) {
        if (!this.model.features.columnWeights[token]) {
          this.model.features.columnWeights[token] = {};
        }
        this.model.features.columnWeights[token][payload.finalColumnId] =
          (this.model.features.columnWeights[token][payload.finalColumnId] || 0) + 2;
      }

      // 4. Priority weight reinforcement
      if (payload.finalPriority) {
        if (!this.model.features.priorityWeights[token]) {
          this.model.features.priorityWeights[token] = {};
        }
        this.model.features.priorityWeights[token][payload.finalPriority] =
          (this.model.features.priorityWeights[token][payload.finalPriority] || 0) + 2;
      }

      // 5. Tag associations
      if (payload.finalTags && payload.finalTags.length > 0) {
        const existingTags = new Set(this.model.features.tagAssociations[token] || []);
        for (const tag of payload.finalTags) {
          if (tag !== "繁中" && tag !== "English") {
            existingTags.add(tag);
          }
        }
        this.model.features.tagAssociations[token] = Array.from(existingTags);
      }
    }

    this.saveModel();
  }

  /**
   * Predicts task properties by combining local NLP parsing + Bayesian learning weights.
   */
  public extractWithLearning(
    transcript: string,
    context: BoardColumnContext
  ): VoiceExtractResult {
    // 1. Start with baseline rule-based parse
    const baseResult = parseTranscriptLocally(transcript, context);
    const tokens = extractFeatureTokens(transcript);

    if (tokens.length === 0 || this.model.totalSamples === 0) {
      return baseResult;
    }

    // 2. Compute Bayesian Likelihood scores for Boards
    const boardScores: Record<string, number> = {};
    for (const token of tokens) {
      const weights = this.model.features.boardWeights[token];
      if (weights) {
        for (const [boardId, score] of Object.entries(weights)) {
          boardScores[boardId] = (boardScores[boardId] || 0) + score;
        }
      }
    }

    // 3. Compute Likelihood scores for Columns
    const columnScores: Record<string, number> = {};
    for (const token of tokens) {
      const weights = this.model.features.columnWeights[token];
      if (weights) {
        for (const [columnId, score] of Object.entries(weights)) {
          columnScores[columnId] = (columnScores[columnId] || 0) + score;
        }
      }
    }

    // 4. Compute Likelihood scores for Priority
    const priorityScores: Record<string, number> = {};
    for (const token of tokens) {
      const weights = this.model.features.priorityWeights[token];
      if (weights) {
        for (const [p, score] of Object.entries(weights)) {
          priorityScores[p] = (priorityScores[p] || 0) + score;
        }
      }
    }

    // 5. Gather Learned Tags
    const learnedTagSet = new Set<string>(baseResult.tags);
    for (const token of tokens) {
      const tags = this.model.features.tagAssociations[token];
      if (tags) {
        for (const t of tags) {
          learnedTagSet.add(t);
        }
      }
    }

    // Pick top scored Board if learned confidence is strong
    let bestBoardId = baseResult.targetBoardId;
    let maxBoardScore = 0;
    for (const [bId, score] of Object.entries(boardScores)) {
      if (score > maxBoardScore && context.boards.some((b) => b.id === bId)) {
        maxBoardScore = score;
        bestBoardId = bId;
      }
    }

    // Pick top scored Column if learned
    let bestColumnId = baseResult.targetColumnId;
    let maxColumnScore = 0;
    for (const [colId, score] of Object.entries(columnScores)) {
      if (score > maxColumnScore) {
        maxColumnScore = score;
        bestColumnId = colId as ColumnId;
      }
    }

    // Pick top scored Priority if learned
    let bestPriority = baseResult.priority;
    let maxPriorityScore = 0;
    for (const [p, score] of Object.entries(priorityScores)) {
      if (score > maxPriorityScore) {
        maxPriorityScore = score;
        bestPriority = p as Priority;
      }
    }

    const hasLearnedKnowledge = maxBoardScore > 0 || maxColumnScore > 0 || maxPriorityScore > 0 || learnedTagSet.size > baseResult.tags.length;
    const learningConfidence = hasLearnedKnowledge ? Math.min(0.99, 0.7 + (this.model.totalSamples * 0.02)) : 0.6;

    return {
      ...baseResult,
      targetBoardId: bestBoardId,
      targetColumnId: bestColumnId,
      priority: bestPriority,
      tags: Array.from(learnedTagSet),
      isOfflineLearned: hasLearnedKnowledge,
      learningConfidence,
    };
  }

  /**
   * Get learning engine statistics.
   */
  public getStats(): LearningStats {
    const totalWords = Object.keys(this.model.vocabulary).length;
    return {
      totalLearnedWords: totalWords,
      totalFeedbackCount: this.model.totalSamples,
      zhFeedbackCount: this.model.languageStats.zhCount,
      enFeedbackCount: this.model.languageStats.enCount,
      lastUpdated: this.model.lastTrainedAt || null,
    };
  }

  /**
   * Reset learning model back to clean state.
   */
  public resetModel(): void {
    this.model = this.getDefaultModel();
    this.saveModel();
  }
}

// Singleton Instance
export const learningEngine = new SemiAutomaticLearningEngine();
