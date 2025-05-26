const CACHE_NAME = 'radio-hlr-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  // Add the paths to your icon images here:
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/icon-maskable-192x192.png',
  './icons/icon-maskable-512x512.png',
  // Cache external resources if you want them available offline (careful with versions)
  'https://cdn.tailwindcss.com', 
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

// Install event: caches the static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache during install:', error);
      })
  );
});

// Fetch event: serves cached assets first, then falls back to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // No cache hit - fetch from network
        return fetch(event.request).catch(error => {
          console.error('Service Worker: Fetch failed for:', event.request.url, error);
          // Optional: return an offline page if network fails and you have one
          // return caches.match('/offline.html'); 
        });
      })
  );
});

// Activate event: cleans up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName); // Delete old caches
          }
        })
      );
    })
  );
});