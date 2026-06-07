self.addEventListener('push', e => {
  const data = e.data.json();
  console.log('Push mesajı alındı:', data);
  
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon || '/favicon.svg',
    image: data.image,
    data: { url: data.url || '/' },
    actions: data.actions || []
  });
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  
  if (e.notification.data && e.notification.data.url) {
    e.waitUntil(
      clients.openWindow(e.notification.data.url)
    );
  }
});
