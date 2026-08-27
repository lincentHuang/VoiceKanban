import { ColumnId, Priority } from "./task";

export interface VoiceExtractResult {
  title: string;
  tags: string[];
  dueDate: string | null;
  priority: Priority;
  targetBoardId: string;
  targetColumnId: ColumnId;
  transcript: string;
  confidence?: number;
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
