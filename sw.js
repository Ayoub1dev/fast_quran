// ═══════════════════════════════════════════════════
//  SERVICE WORKER  — Quran Speed Reader PWA
//  Strategy: Cache-first for app shell + data
//  Quran data is in IndexedDB (survives cache clear)
// ═══════════════════════════════════════════════════

const SW_VERSION = 'v1.0.0';
const CACHE_NAME = 'quran-reader-' + SW_VERSION;

// App shell files to cache on install
const SHELL_FILES = [
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/db.js',
  './js/reader.js',
  './js/eye.js',
  './manifest.json',
  // Amiri font — critical for correct Arabic rendering
  'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@300;400;600&display=swap',
];

// ── INSTALL: cache app shell ──────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache shell files individually so one failure doesn't break all
      return Promise.allSettled(
        SHELL_FILES.map(url => cache.add(url).catch(() => {}))
      );
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: clean old caches ────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: cache-first, fallback to network ───────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Don't intercept non-GET or alquran.cloud (handled in app with IDB fallback)
  if (event.request.method !== 'GET') return;
  if (url.hostname === 'api.alquran.cloud') return; // app handles this

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache valid responses
        if (response && response.status === 200 && response.type !== 'opaque') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback for navigation
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

// ── MESSAGE: skip waiting on demand ──────────────
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
