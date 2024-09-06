self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : { title: '新通知', body: '新的消息' };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/images/favicon.png',
    })
  );
});
