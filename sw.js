/* 口袋派對離線快取 */
const V = 'pocket-party-a52391566f';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const font = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (url.origin !== location.origin && !font) return;
  e.respondWith(caches.open(V).then(async c => {
    const key = req.mode === 'navigate' ? './index.html' : req;
    const hit = await c.match(key, { ignoreSearch: true });
    const net = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) c.put(key, r.clone()); return r; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    return (await net) || new Response('離線中，請連上網路後重新開啟一次', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }));
});
