"use client";

import { useState, useEffect, useCallback } from "react";
import { BeforeInstallPromptEvent, PlatformType, PwaInstallState } from "../types";

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [platform, setPlatform] = useState<PlatformType>("other");
  const [isInstalling, setIsInstalling] = useState(false);
  const [isIosGuideOpen, setIsIosGuideOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. 偵測是否已經在獨立模式 (Standalone PWA) 或 Capacitor 原生環境中
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes("android-app://") ||
      Boolean((window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.());

    setIsInstalled(Boolean(isStandalone));

    // 2. 偵測平台與作業系統
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice =
      /iphone|ipad|ipod/.test(ua) ||
      (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);

    const isAndroidDevice = /android/.test(ua);
    setIsIos(isIosDevice);

    if (isIosDevice) {
      setPlatform("ios");
    } else if (isAndroidDevice) {
      setPlatform("android");
    } else if (/macintosh|windows|linux/.test(ua)) {
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
    // 若已有原生提示事件 (如 Android / Chrome)
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

    // 若為 iOS 裝置，打開 3 步驟圖文導引視窗
    if (isIos) {
      setIsIosGuideOpen(true);
      return;
    }

    // 其餘平台但尚未安裝，亦開啟安裝引導視窗
    setIsIosGuideOpen(true);
  }, [deferredPrompt, isIos]);

  return {
    canInstall: !isInstalled,
    isInstalled,
    isIos,
    platform,
    isInstalling,
    isIosGuideOpen,
    setIsIosGuideOpen,
    triggerInstall,
  };
}
