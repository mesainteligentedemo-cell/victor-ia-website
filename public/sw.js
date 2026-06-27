// Victor IA Service Worker v6
const CACHE_VERSION = 'victor-ia-v6';
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/styles/responsive.css',
  '/styles/a11y-contrast.css',
  '/styles/a11y-focus.css'
];

// Install: Cachea assets críticos
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Victor IA Service Worker...');
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      console.log('[SW] Caching critical assets...');
      return cache.addAll(CRITICAL_ASSETS).catch((err) => {
        console.warn('[SW] Some assets failed to cache:', err);
        // Continuar incluso si algún asset falla
        return Promise.all(
          CRITICAL_ASSETS.map((url) =>
            fetch(url)
              .then((response) => {
                if (response.ok) {
                  return cache.put(url, response);
                }
              })
              .catch(() => {
                console.warn('[SW] Could not fetch', url);
              })
          )
        );
      });
    })
  );
  self.skipWaiting();
});

// Activate: Limpia caches antiguos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Victor IA Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_VERSION)
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Network-first con fallback a cache
self.addEventListener('fetch', (event) => {
  // Ignorar requests de no-GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignorar extensiones y chrome:// URLs
  if (event.request.url.includes('chrome-extension://')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la respuesta es válida, cachear y retornar
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clonar la respuesta (solo se puede usar una vez)
        const responseToCache = response.clone();
        caches.open(CACHE_VERSION).then((cache) => {
          cache.put(event.request, responseToCache).catch(() => {
            // Ignorar errores de cache (disco lleno, etc)
          });
        });

        return response;
      })
      .catch(() => {
        // Network failed, intenta cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[SW] Serving from cache:', event.request.url);
            return cachedResponse;
          }

          // Fallback para assets específicos
          if (event.request.destination === 'style') {
            return new Response('', { status: 404 });
          }
          if (event.request.destination === 'document') {
            // Retornar index.html si existe en cache
            return caches.match('/index.html').catch(() => {
              return new Response('Offline', { status: 503 });
            });
          }

          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// Background sync (opcional para futuro)
self.addEventListener('sync', (event) => {
  if (event.tag === 'victor-ia-sync') {
    event.waitUntil(
      fetch('/api/sync').catch(() => {
        console.log('[SW] Sync failed, will retry later');
      })
    );
  }
});

console.log('[SW] Victor IA Service Worker loaded');
