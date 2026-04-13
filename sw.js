/* ============================================================
   sw.js  --  てちょう Service Worker
   Cache-first / Network-fallback 戦略
   ※ このファイルは index.html と同じディレクトリに置いてください
============================================================ */
var CACHE_NAME = 'techyo-v2';

/* インストール時：コアファイルをキャッシュ */
self.addEventListener('install', function(e) {
  self.skipWaiting();
});

/* アクティベート時：古いキャッシュを削除 */
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

/* フェッチ：GET のみキャッシュを使用 */
self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.match(e.request).then(function(cached) {
        var net = fetch(e.request).then(function(res) {
          if (res && res.status === 200 && res.type !== 'opaque') {
            cache.put(e.request, res.clone());
          }
          return res;
        }).catch(function() { return cached; });
        return cached || net;
      });
    })
  );
});
