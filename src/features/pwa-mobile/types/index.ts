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
  /** 是否已在獨立應用 (Standalone PWA) 中執行 */
  isInstalled: boolean;
  /** 是否為 iOS 裝置 */
  isIos: boolean;
  /** 是否為電腦桌面環境 (macOS / Windows / Linux) */
  isDesktop: boolean;
  /** 是否為 macOS 系統 */
  isMac: boolean;
  /** 是否為 Safari 瀏覽器 */
  isSafari: boolean;
  /** 是否為 Chrome / Chromium 瀏覽器 */
  isChrome: boolean;
  /** 當前裝置平台類別 */
  platform: PlatformType;
  /** 是否正在調用安裝介面中 */
  isInstalling: boolean;
  /** 是否顯示 iOS 3 步驟安裝引導視窗 */
  isIosGuideOpen: boolean;
  /** 是否顯示電腦桌面安裝引導視窗 */
  isDesktopGuideOpen: boolean;
}
