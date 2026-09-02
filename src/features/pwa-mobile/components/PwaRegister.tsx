"use client";

import { useEffect } from "react";

export const PwaRegister: React.FC = () => {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("PWA Service Worker 已成功註冊:", registration.scope);
          })
          .catch((error) => {
            console.error("PWA Service Worker 註冊失敗:", error);
          });
      });
    }
  }, []);

  return null;
};
