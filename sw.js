// ═══════════════════════════════════════════════════
//  SERVICE WORKER  — Quran Speed Reader PWA
//  Works under any subdirectory (e.g. /fast_quran/)
// ═══════════════════════════════════════════════════

const SW_VERSION = 'v1.0.2';
const CACHE_NAME = 'quran-reader-' + SW_VERSION;

// Use relative paths — SW is served from the same directory as index.html
// so ./index.html always resolves correctly regardless of subdirectory
const SHELL_FILES = [
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/db.js',
  './js/eye.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

// ── INSTALL: cache app shell ──────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(
        SHELL_FILES.map(url =>
          cache.add(new Request(url, { cache: 'reload' })).catch(() => {})
        )
      )
    ).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: clean old caches ────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── FETCH: cache-first, fallback to network ───────
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Let API calls go straight to network — app handles IDB fallback
  if (url.hostname === 'api.alquran.cloud') return;
  // Let Google Fonts go straight to network
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        if (response && response.status === 200 && response.type !== 'opaque') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback: serve index.html for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

// ── MESSAGE ───────────────────────────────────────
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
