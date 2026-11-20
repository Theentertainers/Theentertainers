// Service worker pentru aplicația The Entertainers (PWA)
// Pagini: întâi de pe internet (mereu la zi), din memorie doar fără semnal.
// Fișiere statice: din memorie imediat, actualizate în fundal.
const V = 'te-v1';
const CORE = ['/', '/offline.html', '/assets/compact.css', '/assets/menu.css', '/assets/logo-gold.png', '/assets/app-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;            // Supabase, fonturi, TikTok etc. merg direct
  if (u.pathname.startsWith('/api/')) return;           // vremea etc. mereu live
  if (/\.(mp4|webm)$/i.test(u.pathname)) return;        // clipurile merg direct (cereri pe bucăți)
  if (/^\/(admin|cont-partener)\.html/.test(u.pathname)) return;

  if (r.mode === 'navigate') {
    e.respondWith(
      fetch(r).then(res => {
        if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); }
        return res;
      }).catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match('/offline.html')))
    );
    return;
  }

  if (/\.(css|js|png|jpg|jpeg|webp|svg|ico|woff2?)$/i.test(u.pathname)) {
    e.respondWith(caches.open(V).then(c => c.match(r).then(m => {
      const net = fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; }).catch(() => m);
      return m || net;
    })));
  }
});
