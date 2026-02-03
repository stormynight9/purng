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
    // Use absolute URL so icon loads regardless of SW scope. Icon must have
    // transparent background or Android shows a white square (monochrome mask).
    const iconUrl = new URL('/notification-icon.png', self.location.origin).href
    const options = {
        body: payload.body || '',
        icon: iconUrl,
        badge: iconUrl,
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
