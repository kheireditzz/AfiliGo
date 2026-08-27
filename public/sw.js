const CACHE_NAME = 'afiligo-v2026-dynamic';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => caches.delete(k)));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Network first strategy to ensure real-time update without uninstalling
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
