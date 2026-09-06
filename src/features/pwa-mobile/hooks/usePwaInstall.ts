"use client";

import { useState, useEffect, useCallback } from "react";
import { BeforeInstallPromptEvent, PlatformType, PwaInstallState } from "../types";

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [isChrome, setIsChrome] = useState(false);
  const [platform, setPlatform] = useState<PlatformType>("other");
  const [isInstalling, setIsInstalling] = useState(false);
  const [isIosGuideOpen, setIsIosGuideOpen] = useState(false);
  const [isDesktopGuideOpen, setIsDesktopGuideOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. 偵測是否已經在獨立模式 (Standalone PWA) 或 Capacitor 原生環境中
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes("android-app://") ||
      Boolean((window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.());

    setIsInstalled(Boolean(isStandalone));

    // 2. 偵測平台、作業系統與瀏覽器
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice =
      /iphone|ipad|ipod/.test(ua) ||
      (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);

    const isAndroidDevice = /android/.test(ua);
    const isMacDevice = /macintosh|mac os x/.test(ua) && !isIosDevice;
    const isDesktopEnv = /macintosh|windows|linux/.test(ua) && !isIosDevice && !isAndroidDevice;
    const isSafariBrowser = /safari/.test(ua) && !/chrome|chromium|edg|opr|brave/.test(ua);
    const isChromeBrowser = /chrome|chromium|edg|brave/.test(ua);

    setIsIos(isIosDevice);
    setIsMac(isMacDevice);
    setIsDesktop(isDesktopEnv);
    setIsSafari(isSafariBrowser);
    setIsChrome(isChromeBrowser);

    if (isIosDevice) {
      setPlatform("ios");
    } else if (isAndroidDevice) {
      setPlatform("android");
    } else if (isDesktopEnv) {
      setPlatform("desktop");
    } else {
      setPlatform("other");
    }

    // 3. 監聽 PWA 原生安裝提示事件 (Chrome, Edge, Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // 4. 監聽已安裝事件
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsInstalling(false);
      setIsIosGuideOpen(false);
      setIsDesktopGuideOpen(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // 觸發安裝流程
  const triggerInstall = useCallback(async () => {
    // 若已有原生提示事件 (如 桌面 Chrome / Edge / Android)
    if (deferredPrompt) {
      setIsInstalling(true);
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setIsInstalled(true);
        }
      } catch (err) {
        console.error("PWA 安裝流程異常:", err);
      } finally {
        setDeferredPrompt(null);
        setIsInstalling(false);
      }
      return;
    }

    // 若為 iOS 裝置，打開 iOS 3 步驟圖文導引視窗
    if (isIos) {
      setIsIosGuideOpen(true);
      return;
    }

    // 若為桌面環境（macOS Safari / Chrome 無 prompt 狀態），開啟桌面專屬安裝引導視窗
    if (isDesktop) {
      setIsDesktopGuideOpen(true);
      return;
    }

    // 其餘平台預設引導視窗
    setIsIosGuideOpen(true);
  }, [deferredPrompt, isIos, isDesktop]);

  return {
    canInstall: !isInstalled,
    isInstalled,
    isIos,
    isDesktop,
    isMac,
    isSafari,
    isChrome,
    platform,
    isInstalling,
    isIosGuideOpen,
    setIsIosGuideOpen,
    isDesktopGuideOpen,
    setIsDesktopGuideOpen,
    triggerInstall,
  };
}
