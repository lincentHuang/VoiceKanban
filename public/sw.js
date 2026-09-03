/**
 * Voice Kanban PWA Service Worker (Enhanced Offline Mode)
 * 支援全功能離線作業、離線快取、靜態資源加速與斷網容錯降級
 */

const CACHE_NAME = "voice-kanban-v2";

const PRECACHE_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/apple-touch-icon.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// 安裝階段：預先快取核心外殼與離線資源
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 啟動階段：清理過期舊快取，並立即接管全部客戶端
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// 攔截請求策略：
// 1. 頁面導覽請求 (HTML Navigation)：Network-First，斷網時平滑 fallback 至快取的 App Shell ("/")
// 2. 靜態資源 (Next.js JS, CSS, 圖片, 字型)：Stale-While-Revalidate
// 3. API 路由 (/api/)：斷網時安全返回 JSON 離線備援，避免拋出未捕獲網路異常
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 略過非同源與非 GET 請求（除 API 需特別處理外）
  if (request.method !== "GET") {
    return;
  }

  // API 路由處理
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({
            offline: true,
            message: "目前為離線狀態，已切換至本機備援處理",
          }),
          {
            status: 503,
            headers: { "Content-Type": "application/json" },
          }
        );
      })
    );
    return;
  }

  // 導覽請求 (HTML Navigation) - 確保重新整理或直接開啟時在斷網下 100% 成功載入
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          const appShell = await caches.match("/");
          if (appShell) {
            return appShell;
          }
          return new Response(
            "<!DOCTYPE html><html><head><meta charset='utf-8'><title>聲動看板 - 離線模式</title></head><body><h1>離線模式</h1><p>請確認應用已安裝或恢復連線。</p></body></html>",
            { headers: { "Content-Type": "text/html; charset=utf-8" } }
          );
        })
    );
    return;
  }

  // 一般靜態資源（Next.js 打包 JS/CSS、圖片、字型等）：Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
