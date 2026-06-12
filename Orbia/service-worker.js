const CACHE_NAME = "orbia-shell-v6";
const APP_BASE_URL = new URL("./", self.location.href);
const APP_BASE_PATH = APP_BASE_URL.pathname;
const INDEX_URL = new URL("./index.html", self.location.href).toString();
const API_BASE_PATH = new URL("./api/", self.location.href).pathname;
const APP_SHELL = [
  APP_BASE_URL.toString(),
  INDEX_URL,
  new URL("./manifest.webmanifest", self.location.href).toString(),
  new URL("./service-worker.js", self.location.href).toString(),
  new URL("./src/main.js", self.location.href).toString(),
  new URL("./src/app.js", self.location.href).toString(),
  new URL("./src/router.js", self.location.href).toString(),
  new URL("./src/store.js", self.location.href).toString(),
  new URL("./src/map-controller.js", self.location.href).toString(),
  new URL("./src/styles.css", self.location.href).toString(),
  new URL("./src/data/create-orbe-gateway.js", self.location.href).toString(),
  new URL("./src/data/mock-orbe-gateway.js", self.location.href).toString(),
  new URL("./src/data/proxy-orbe-gateway.js", self.location.href).toString(),
  new URL("./src/views/login-view.js", self.location.href).toString(),
  new URL("./src/views/dashboard-view.js", self.location.href).toString(),
  new URL("./src/views/notifications-view.js", self.location.href).toString(),
  new URL("./src/views/planning-view.js", self.location.href).toString(),
  new URL("./icons/favicon.svg", self.location.href).toString(),
  new URL("./icons/icon-192.png", self.location.href).toString(),
  new URL("./icons/icon-512.png", self.location.href).toString(),
  new URL("./icons/apple-touch-icon.png", self.location.href).toString()
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin || url.pathname.startsWith(API_BASE_PATH)) {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(INDEX_URL, copy));
          return response;
        })
        .catch(() => caches.match(INDEX_URL))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
