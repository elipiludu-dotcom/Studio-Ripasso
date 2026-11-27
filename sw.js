// Service worker minimo: rende l'app installabile e tiene una copia per quando la rete manca.
// Prima prova la rete, così gli aggiornamenti arrivano subito.
var VERSIONE = 'studio-ripasso-v2';
var FILE = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSIONE).then(function (c) { return c.addAll(FILE); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (chiavi) {
      return Promise.all(chiavi.filter(function (k) { return k !== VERSIONE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(r).then(function (res) {
      var copia = res.clone();
      caches.open(VERSIONE).then(function (c) { c.put(r, copia); });
      return res;
    }).catch(function () { return caches.match(r); })
  );
});
