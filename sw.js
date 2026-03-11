// Maria's Bake & Brew — Admin Service Worker
const CACHE = 'mbb-admin-v1';
const ASSETS = [
  './admin.html',
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Jost:wght@300;400;500;600&display=swap'
];

// Install — cache core assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activate — clear old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', e => {
  // Skip non-GET and Apps Script requests (kena online untuk API)
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('script.google.com')) return;
  if (e.request.url.includes('api.remove.bg')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cache fresh copy
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
