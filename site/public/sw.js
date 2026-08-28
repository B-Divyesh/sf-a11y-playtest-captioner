const CACHE = "a11y-captioner-__BUILD_ID__";
const BUILD_ID = "__BUILD_ID__";
const PAGES = ["/", "/privacy/", "/terms/"];
const BUILD_ASSETS = []; // __BUILD_ASSETS__
const SHELL = [...PAGES, "/hero-caption-landscape.webp", "/hero-caption-landscape-480.webp", "/favicon.svg", ...BUILD_ASSETS];

async function cacheShell() {
  const cache = await caches.open(CACHE);
  await Promise.all(SHELL.map(async (url) => {
    // During an update, the currently active worker can otherwise answer this
    // request from its old cache. The versioned query forces a fresh network
    // response, which we keep under the canonical URL for offline matching.
    const separator = url.includes("?") ? "&" : "?";
    const response = await fetch(`${url}${separator}__captioner_cache=${BUILD_ID}`, { cache: "reload" });
    if (!response.ok) throw new Error(`Could not cache ${url}: ${response.status}`);
    await cache.put(url, response);
  }));
}

self.addEventListener("install", (event) => {
  event.waitUntil(cacheShell().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "a11y-captioner:cache-version") {
    event.source?.postMessage({ type: "a11y-captioner:cache-version", cache: CACHE });
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  // Build assets may carry Vary: Origin. The shell is same-origin and
  // precached by this worker, so match independently of that request header.
  event.respondWith(caches.match(event.request, { ignoreVary: true }).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok) caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));
    return response;
  }).catch(() => event.request.mode === "navigate" ? caches.match("/", { ignoreVary: true }) : Response.error())));
});
