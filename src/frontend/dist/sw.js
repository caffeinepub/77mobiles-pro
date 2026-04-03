/* scope: / */
const CACHE_NAME = '77mobiles-v3';
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

// Install: pre-cache critical assets — do NOT call skipWaiting() here to avoid clearing sessions
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {});
    })
    // Intentionally NOT calling skipWaiting() during install
    // skipWaiting is only called via postMessage to preserve active sessions
  );
});

// Listen for SKIP_WAITING message from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Activate: clean up old caches + claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: network-first for navigation, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;
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

      if (event.request.mode === 'navigate') {
        return networkFetch.catch(() => caches.match('/index.html'));
      }
      return cached || networkFetch;
    })
  );
});
