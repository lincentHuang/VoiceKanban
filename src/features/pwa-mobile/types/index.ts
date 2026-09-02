/**
 * PWA & Mobile 模組型別定義
 */

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export type PlatformType = "ios" | "android" | "desktop" | "other";

export interface PwaInstallState {
  /** 是否可觸發原生 PWA 安裝提示 (支援 beforeinstallprompt) */
  canInstall: boolean;
  /** 是否已在獨立應用 (Standalone PWA) 或 Capacitor 原生 App 中執行 */
  isInstalled: boolean;
  /** 是否為 iOS Safari 裝置 */
  isIos: boolean;
  /** 當前裝置平台類別 */
  platform: PlatformType;
  /** 是否正在調用安裝介面中 */
  isInstalling: boolean;
  /** 是否顯示 iOS 3 步驟安裝引導視窗 */
  isIosGuideOpen: boolean;
}
