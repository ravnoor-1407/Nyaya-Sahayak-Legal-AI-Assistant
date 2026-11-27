// NyayaSahayak Service Worker for Offline Citizen Empowerment
const CACHE_NAME = "nyayasahayak-v1";
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/offline.html",
  "/favicon.svg",
  "/manifest.webmanifest",
];

// Install: Pre-cache essential offline pages & emergency guides
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: Clean up older cache versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch: Stale-While-Revalidate for application, fallback to offline.html if no network
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only intercept GET requests
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Skip caching for backend API POST/data calls to avoid stale dynamic responses
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch fresh copy in background to revalidate cache
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && request.url.startsWith("http")) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => {
          // If a page navigation fails (user is offline), show offline.html or index.html
          if (request.mode === "navigate") {
            return caches.match("/offline.html") || caches.match("/index.html");
          }
        });
    })
  );
});
