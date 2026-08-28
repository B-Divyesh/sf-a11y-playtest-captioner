const CACHE = "a11y-captioner-v2";
const PAGES = ["/", "/privacy/", "/terms/"];
const BUILD_ASSETS = []; // __BUILD_ASSETS__
const SHELL = [...PAGES, "/hero-caption-landscape.webp", "/hero-caption-landscape-480.webp", "/favicon.svg", ...BUILD_ASSETS];

async function cacheShell() {
  const cache = await caches.open(CACHE);
  await cache.addAll(SHELL);
}

self.addEventListener("install", (event) => {
  event.waitUntil(cacheShell().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok) caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));
    return response;
  }).catch(() => event.request.mode === "navigate" ? caches.match("/") : Response.error())));
});
