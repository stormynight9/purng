/**
 * Service worker for web push notifications.
 * Handles push events and notification clicks.
 */
self.addEventListener('push', (event) => {
    if (!event.data) return
    let payload
    try {
        payload = event.data.json()
    } catch {
        payload = { title: 'Purng', body: '', url: '/' }
    }
    const title = payload.title || 'Purng'
    const options = {
        body: payload.body || '',
        icon: '/web-app-manifest-192x192.png',
        badge: '/web-app-manifest-192x192.png',
        data: { url: payload.url || '/' },
    }
    event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    const url = event.notification.data?.url || '/'
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.navigate(url)
                    return client.focus()
                }
            }
            if (self.clients.openWindow) return self.clients.openWindow(url)
        })
    )
})
