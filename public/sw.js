// Service Worker for Intima Lab Notifications and PWA
const CACHE_NAME = 'intima-lab-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming push notifications or background message
self.addEventListener('push', (event) => {
  let data = {
    title: 'Novo Pedido Recebido! 🛍️ Intima Lab',
    body: 'Uma cliente acabou de realizar um pedido no site.',
    url: '/',
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icon.svg',
    badge: '/icon.svg',
    vibrate: [300, 100, 300, 100, 300, 100, 500],
    tag: data.tag || 'intima-lab-order',
    renotify: true,
    requireInteraction: true,
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now(),
    },
    actions: [
      { action: 'open', title: '🛍️ Ver Pedido' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle user clicking the Android notification in top bar / drawer
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

