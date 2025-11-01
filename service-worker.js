const CACHE = 'converter-cache-v1';
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './Icon-192.png',
  './Icon-512.png'
];
// Third‑party libs (cache after first use)
const CDN_ALLOWLIST = [
  'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js',
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.js',
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k!==CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // Cache‑first for core and CDN libs; otherwise network‑first fallback to cache
  if (CORE.some(p => url.endsWith(p)) || CDN_ALLOWLIST.some(p => url.startsWith(p))) {
    e.respondWith(
      caches.match(e.request).then(hit => hit || fetch(e.request).then(resp => {
        const copy = resp.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return resp;
      }))
    );
  } else {
    e.respondWith(
      fetch(e.request).catch(()=>caches.match(e.request))
    );
  }
});
