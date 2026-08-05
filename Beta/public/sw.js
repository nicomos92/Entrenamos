self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      try {
        return await fetch(event.request);
      } catch (error) {
        const cached = await caches.match(event.request);
        return cached || Response.error();
      }
    })()
  );
});
