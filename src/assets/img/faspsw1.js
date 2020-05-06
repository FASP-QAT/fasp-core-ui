var cacheName = 'fasp-v1';
var assets = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
  '/QAT-logo192x192.png',
  '/QAT-logo512x512.png',
  '/QAT-logo150x61.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then((cahce) => {
      cahce.addAll(assets);
    }).then(() => self.skipWaiting()).catch(function (err) { console.log("Error occured while installing service worker---" + err) })
  )
});
self.addEventListener('activate', function (event) {
  caches.open(cacheName).then((cahce) => {
    cahce.addAll(assets);
  }).then(() => self.skipWaiting()).catch(function (err) { console.log("Error occured while installing service worker---" + err) })



  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (!cacheName.includes(key)) {
          return caches.delete(key);
        }
      })
    )).then(() => {
      // console.log('V2 now ready to handle fetches!');
    })
  );
})

self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(cacheRes => {
      return cacheRes || fetch(evt.request);
    }).catch(function (error) { console.log("Error occured while fetching ---" + error) })
  );
});
self.addEventListener('message', (event) => {
  // console.log('[Service Worker] Message Event: ', event.data)
});

// // This will work!
// workbox.routing.registerRoute(
//   new RegExp('\\.(?:js|css|scss|html|gif|svg|jpg|png|map)'),
//   new workbox.strategies.CacheFirst()
// );


