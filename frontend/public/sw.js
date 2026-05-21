const CACHE_NAME = 'sera-v2';

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? { title: 'Sera', body: 'Nouvelle notification' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon.svg',
      badge: '/icons/icon.svg',
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes('/dashboard') && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/dashboard');
    })
  );
});

const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon.svg',
];
const IS_LOCAL_DEV = ['localhost', '127.0.0.1'].includes(self.location.hostname);

if (IS_LOCAL_DEV) {
  self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys()
        .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
        .then(() => self.registration.unregister())
        .then(() => self.clients.matchAll())
        .then((clients) => clients.forEach((client) => client.navigate(client.url)))
    );
  });
} else {
  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(STATIC_ASSETS))
        .then(() => self.skipWaiting())
    );
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys()
        .then((keys) => Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        ))
        .then(() => self.clients.claim())
    );
  });

  self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/') || request.method !== 'GET') {
      return;
    }

    if (request.mode === 'navigate') {
      event.respondWith(
        fetch(request)
          .then((response) => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            return response;
          })
          .catch(() => caches.match(request).then((cached) => cached || caches.match('/offline.html')))
      );
      return;
    }

    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;

        return fetch(request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type === 'opaque') {
              return response;
            }

            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            return response;
          })
          .catch(() => null);
      })
    );
  });
}
