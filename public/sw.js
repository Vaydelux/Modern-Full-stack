/**
 * Zero to Mastery — Modern Full-Stack Service Worker
 * Hand-rolled, auditable offline-first caching engine.
 */

const CACHE_VERSION = "z2m-v1";
const CACHE_NAME = `z2m-shell-${CACHE_VERSION}`;

// Core assets to precache on install
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icons/icon.svg",
];

// Install: Precache application shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .catch((err) => {
        console.warn("[SW] Precache failed:", err);
      })
  );
});

// Activate: Clean up old cache versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("z2m-") && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => {
        // Ready to serve, do not swap mid-lesson without user trigger
      })
  );
});

// Message listener for learner-triggered instant updates
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Fetch routing strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Ignore non-GET or chrome-extension requests
  if (request.method !== "GET" || !request.url.startsWith("http")) {
    return;
  }

  const url = new URL(request.url);

  // Strategy 1: HTML Navigations (SPA route requests)
  // Network-First with Cached Shell Fallback (Fresh deploys win online, cached course wins offline)
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const fallbackShell = await caches.match("/index.html");
          if (fallbackShell) return fallbackShell;
          return new Response("Offline - Please reconnect to load new pages", {
            status: 503,
            headers: { "Content-Type": "text/plain" },
          });
        })
    );
    return;
  }

  // Strategy 2: Cache-First for Immutable Assets & Google Fonts
  // (Vite hashed bundles under /assets/* and Google webfonts)
  const isHashedAsset = url.pathname.startsWith("/assets/");
  const isGoogleFont =
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com";

  if (isHashedAsset || isGoogleFont) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(request).then((response) => {
          if (response && (response.status === 200 || response.type === "opaque")) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        });
      })
    );
    return;
  }

  // Strategy 3: Stale-While-Revalidate for other static resources and assets
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            (networkResponse.status === 200 || networkResponse.type === "opaque")
          ) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failure: if no cache, return empty/error response
          return cached;
        });

      return cached || fetchPromise;
    })
  );
});
