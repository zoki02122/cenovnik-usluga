// Cenovnik usluga — service worker
// Network-first: uvek pokušaj sveže sa interneta, keš je samo rezerva za offline rad.
const CACHE_NAME = "cenovnik-usluga-cache-v1";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-512-maskable.png"
];

self.addEventListener("install", function(event){
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(CORE_ASSETS);
    })
  );
});

self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(key){ return key !== CACHE_NAME; })
            .map(function(key){ return caches.delete(key); })
      );
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(event){
  if(event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then(function(response){
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, copy); });
        return response;
      })
      .catch(function(){
        return caches.match(event.request).then(function(cached){
          return cached || caches.match("./index.html");
        });
      })
  );
});
