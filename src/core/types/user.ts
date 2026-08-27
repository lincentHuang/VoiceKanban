export interface BYOKConfig {
  apiKey: string;
  isCustomKeyActive: boolean;
  model: "gemini-2.0-flash" | "gemini-1.5-pro";
  defaultBoardId: string;
  isEncrypted: boolean;
  lastTestedAt?: string | null;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}
