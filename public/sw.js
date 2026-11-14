// Service Worker — Ark Commerce PWA (offline + install)
// Scope: raíz del sitio (servido desde /sw.js)
const CACHE_NAME = 'ark-commerce-canaco-v2';
const OFFLINE_URL = '/canaco/';

// Recursos estáticos a cachear al instalar (contexto CANACO)
const PRECACHE_URLS = [
  '/',
  '/canaco/',
  '/canaco/index.html',
  '/canaco/eventos.html',
  '/canaco/admin.html',
  '/favicon.svg',
  '/widget.js',
  '/ark-mascot.jpg',
];

// Assets dinámicos de runtime (estilos, scripts del build) se agregan al caché bajo demanda
const RUNTIME_CACHE = 'ark-commerce-canaco-runtime-v2';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo manejar peticiones GET del mismo origen
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Estrategia: Network First para la página principal, fallback a caché
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then((response) => {
        const cloned = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, cloned));
        return response;
      }).catch(() =>
        caches.match(request).then((cached) => cached || caches.match(OFFLINE_URL))
      )
    );
    return;
  }

  // Keep the embeddable widget fresh after deploys; retain its cached copy for offline use.
  if (url.pathname === '/widget.js') {
    event.respondWith(
      fetch(request).then((response) => {
        if (response.status === 200 && response.type === 'basic') {
          const cloned = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, cloned));
        }
        return response;
      }).catch(() => caches.match(request))
    );
    return;
  }

  // Estrategia: Cache First para assets estáticos
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response;
        const cloned = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, cloned));
        return response;
      });
    })
  );
});
