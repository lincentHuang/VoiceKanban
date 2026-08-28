import { ColumnId, Priority } from "./task";

export type VoiceLanguage = "zh-TW" | "en-US" | "auto";
export type VoiceMode = "offline_learning" | "cloud_gemini";

export interface VoiceExtractResult {
  title: string;
  tags: string[];
  dueDate: string | null;
  priority: Priority;
  targetBoardId: string;
  targetColumnId: ColumnId;
  transcript: string;
  confidence?: number;
  detectedLanguage?: "zh-TW" | "en-US";
  isOfflineLearned?: boolean;
  learningConfidence?: number;
  matchedRules?: string[];
}

export type VoiceState = "idle" | "recording" | "processing" | "preview" | "error";

export interface AudioRecordingPayload {
  audioBase64: string;
  mimeType: string;
  currentTimestamp: string;
  timezone: string;
  availableBoards: {
    id: string;
    name: string;
    columns: { id: string; name: string }[];
  }[];
}

// Semi-Automatic Learning Engine Schemas
export interface LearningFeatureWeight {
  // Keyword mapping to target board ID with weight score
  boardWeights: Record<string, Record<string, number>>;
  // Keyword mapping to target column ID with weight score
  columnWeights: Record<string, Record<string, number>>;
  // Keyword mapping to target priority with weight score
  priorityWeights: Record<string, Record<string, number>>;
  // Keyword co-occurrence tags
  tagAssociations: Record<string, string[]>;
}

export interface LearningModelData {
  version: number;
  totalSamples: number;
  lastTrainedAt: string;
  vocabulary: Record<string, number>; // word frequency
  features: LearningFeatureWeight;
  languageStats: {
    zhCount: number;
    enCount: number;
  };
}

export interface CorrectionFeedbackPayload {
  transcript: string;
  detectedLanguage: "zh-TW" | "en-US";
  finalTitle: string;
  finalBoardId: string;
  finalColumnId: ColumnId;
  finalPriority: Priority;
  finalTags: string[];
  finalDueDate: string | null;
}

export interface LearningStats {
  totalLearnedWords: number;
  totalFeedbackCount: number;
  zhFeedbackCount: number;
  enFeedbackCount: number;
  lastUpdated: string | null;
}
