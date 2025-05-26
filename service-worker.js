const CACHE_NAME = 'radio-hlr-cache-v1';
const urlsToCache = [
  // Adjust paths if your GitHub Pages setup is different (e.g., if not using a subpath)
  '/radio-hlr-pwa/', // The root of your PWA on GitHub Pages
  '/radio-hlr-pwa/index.html',
  '/radio-hlr-pwa/manifest.json',
  // You might want to cache external CSS/JS if you move them locally
  // 'https://cdn.tailwindcss.com', // Tailwind CDN, caching can be tricky for external CDNs
  // 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  // If you use local icons, add their paths here:
  // '/radio-hlr-pwa/icons/icon-192x192.png',
  // '/radio-hlr-pwa/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache during install:', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Strategy: Network-only for the radio stream to ensure it's always live
  if (event.request.url.includes('cdnstream.com')) {
    return event.respondWith(fetch(event.request));
  }

  // Strategy: Cache-first for other assets (HTML, CSS, JS, images)
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // No cache hit - fetch from network
        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            // IMPORTANT: Clone the response. A response is a stream
            // and can only be consumed once. We consume it once to cache it,
            // and once by the browser for the actual request.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
      .catch(error => {
        console.error('Service Worker: Fetch failed:', error);
        // You can return an offline page here if desired when network fails
        // return caches.match('/radio-hlr-pwa/offline.html');
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
