const CACHE_NAME = '77mobiles-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/generated/category-smartphone-transparent.dim_200x240.png',
  '/assets/generated/category-laptop-transparent.dim_200x240.png',
  '/assets/generated/category-ipad-transparent.dim_200x240.png',
  '/assets/generated/category-gaming-transparent.dim_200x240.png',
  '/assets/generated/category-accessories-transparent.dim_200x240.png',
  '/assets/generated/category-watch-transparent.dim_200x240.png',
  '/assets/generated/category-spareparts-transparent.dim_200x240.png',
];

// Install: pre-cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {});
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first for API/backend, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET and cross-origin requests
  if (event.request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  // ICP canister calls — always network
  if (url.pathname.startsWith('/api/') || url.pathname.includes('canister')) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);

      // For HTML navigation — network first, fall back to cache
      if (event.request.mode === 'navigate') {
        return networkFetch.catch(() => caches.match('/index.html'));
      }

      // For assets — cache first, then network
      return cached || networkFetch;
    })
  );
});
