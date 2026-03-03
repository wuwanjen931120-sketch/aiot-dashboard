const CACHE_NAME = "aiot-pwa-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./login.html",
  "./dashboard.html",
  "./logs.html",
  "./settings.html",
  "./style.css",
  "./core.js",
  "./script.js",
  "./manifest.webmanifest"
];

// 安裝：先把重要檔案快取好
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 啟用：清除舊快取
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 取用：優先走快取，沒有再抓網路
self.addEventListener("fetch", (event) => {
  const req = event.request;
  event.respondWith(
    caches.match(req).then((cached) => {
      return cached || fetch(req).then((res) => {
        // 只快取 GET
        if (req.method === "GET") {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() => cached);
    })
  );
});