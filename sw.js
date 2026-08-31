const CACHE_NAME = "galatea-shell-v21";
const APP_SHELL = [
  "./",
  "./index.html",
  "./gym/",
  "./gym/index.html",
  "./style/",
  "./style/index.html",
  "./ibclc/",
  "./ibclc/index.html",
  "./ibclc/how-questions-work/",
  "./ibclc/how-questions-work/index.html",
  "./ibclc/study-plan/",
  "./ibclc/study-plan/index.html",
  "./ibclc/blueprint/",
  "./ibclc/blueprint/index.html",
  "./ibclc/sources/",
  "./ibclc/sources/index.html",
  "./ibclc/reference/2023-IBCLC-Detailed-Content-Outline.pdf",
  "./assets/site.css",
  "./assets/ibclc.css",
  "./assets/pwa.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon.png",
  "./icons/portrait.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => (key.startsWith("galatea-shell-") || key.startsWith("gym-plan-shell-")) && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          return cached || caches.match("./index.html");
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "activate-update") self.skipWaiting();
});
