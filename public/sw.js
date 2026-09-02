/**
 * Voice Kanban PWA Service Worker
 * 支援離線快取、靜態資源加速與網路中斷容錯降級
 */

const CACHE_NAME = "voice-kanban-v1";

const PRECACHE_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/apple-touch-icon.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// 安裝階段：預先快取核心外殼資源
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 啟動階段：清理過期舊快取，並立即接管頁面
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
// 1. API 路由 (/api/) 與非 GET 請求：一律走網路，不進快取
// 2. 頁面導覽請求 (HTML)：Network-First，斷網時 fallback 回快取
// 3. 靜態資源 (JS, CSS, 圖片)：Stale-While-Revalidate
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 略過非同源、非 GET 請求以及 /api/ 呼叫
  if (
    request.method !== "GET" ||
    !url.origin.includes(self.location.origin) ||
    url.pathname.startsWith("/api/")
  ) {
    return;
  }

  // 導覽請求 (HTML Navigation)
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
          return caches.match("/");
        })
    );
    return;
  }

  // 一般靜態資源：Stale-While-Revalidate
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
