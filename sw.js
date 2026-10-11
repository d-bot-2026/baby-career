/* 離線快取：遊戲檔案先存起來，沒網路也能玩。更新內容時把 VERSION +1。 */
const VERSION = 'baby-career-v4';
const SHELL = [
  './', './index.html', './css/style.css?v=5', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png',
  './js/config.js?v=5', './js/save.js?v=5', './js/art.js?v=5', './js/data.js?v=5', './js/acts.js?v=5', './js/game.js?v=5',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 自己的檔案：先用網路（拿到最新版），失敗再用快取；字型：快取優先
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  const isFont = url.host.includes('fonts.googleapis.com') || url.host.includes('fonts.gstatic.com');
  if (isFont) {
    e.respondWith(caches.open(VERSION).then(async c => {
      const hit = await c.match(e.request);
      if (hit) return hit;
      const res = await fetch(e.request);
      if (res.ok || res.type === 'opaque') c.put(e.request, res.clone());
      return res;
    }));
    return;
  }
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(VERSION).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
