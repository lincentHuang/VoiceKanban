export interface BYOKConfig {
  apiKey: string;
  isCustomKeyActive: boolean;
  model: "gemini-3.6-flash" | "gemini-3.1-pro-preview";
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
