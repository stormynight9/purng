'use client'

import { Button } from '@/components/ui/button'
import { useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import { useSession } from 'next-auth/react'
import { Bell, BellOff, Loader2Icon } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/')
    const rawData = atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

export function PushNotificationToggle() {
    const { data: session } = useSession()
    const saveSubscription = useMutation(
        api.pushSubscriptions.savePushSubscription
    )
    const removeSubscription = useMutation(
        api.pushSubscriptions.removePushSubscription
    )
    const [status, setStatus] = useState<
        'idle' | 'loading' | 'subscribed' | 'unsupported' | 'denied' | 'error'
    >('idle')
    const [message, setMessage] = useState<string | null>(null)

    const userEmail = session?.user?.email ?? null

    const subscribe = useCallback(async () => {
        if (!userEmail || !VAPID_PUBLIC_KEY) {
            setStatus('error')
            setMessage(
                VAPID_PUBLIC_KEY ? 'Not signed in.' : 'Push not configured.'
            )
            return
        }
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            setStatus('unsupported')
            setMessage('Push not supported in this browser.')
            return
        }

        setStatus('loading')
        setMessage(null)

        try {
            const registration =
                await navigator.serviceWorker.register('/sw.js')
            await navigator.serviceWorker.ready

            const permission = await Notification.requestPermission()
            if (permission !== 'granted') {
                setStatus('denied')
                setMessage('Notifications blocked.')
                return
            }

            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            })

            const subscription = sub.toJSON()
            if (
                !subscription.endpoint ||
                !subscription.keys?.p256dh ||
                !subscription.keys?.auth
            ) {
                setStatus('error')
                setMessage('Invalid subscription.')
                return
            }

            await saveSubscription({
                userEmail,
                subscription: {
                    endpoint: subscription.endpoint,
                    keys: {
                        p256dh: subscription.keys.p256dh,
                        auth: subscription.keys.auth,
                    },
                },
            })

            setStatus('subscribed')
            setMessage('Notifications enabled.')
        } catch (err) {
            setStatus('error')
            setMessage(err instanceof Error ? err.message : 'Failed to enable.')
        }
    }, [userEmail, saveSubscription])

    const unsubscribe = useCallback(async () => {
        if (!userEmail) return
        if (!('serviceWorker' in navigator) || !('PushManager' in window))
            return

        setStatus('loading')
        setMessage(null)

        try {
            const registration =
                await navigator.serviceWorker.getRegistration('/sw.js')
            const sub = registration
                ? await registration.pushManager.getSubscription()
                : null
            if (sub) {
                await sub.unsubscribe()
                await removeSubscription({
                    userEmail,
                    endpoint: sub.endpoint,
                })
            }
            setStatus('idle')
            setMessage('Notifications disabled.')
        } catch (err) {
            setStatus('error')
            setMessage(
                err instanceof Error ? err.message : 'Failed to disable.'
            )
        }
    }, [userEmail, removeSubscription])

    const handleToggle = useCallback(() => {
        if (status === 'subscribed') unsubscribe()
        else subscribe()
    }, [status, subscribe, unsubscribe])

    useEffect(() => {
        if (!userEmail) {
            setStatus('idle')
            setMessage(null)
            return
        }
        if (!VAPID_PUBLIC_KEY) {
            setStatus('unsupported')
            return
        }
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            setStatus('unsupported')
            return
        }
        if (Notification.permission === 'denied') {
            setStatus('denied')
            return
        }
        if (Notification.permission === 'granted') {
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) =>
                    registration.pushManager.getSubscription()
                )
                .then((sub) => setStatus(sub ? 'subscribed' : 'idle'))
            return
        }
        setStatus('idle')
    }, [userEmail])

    if (!userEmail) return null
    if (status === 'unsupported') return null

    const isEnabled = status === 'subscribed'
    const isLoading = status === 'loading'

    return (
        <div className='flex items-center gap-1'>
            {message && (
                <span className='hidden text-xs text-muted-foreground sm:inline'>
                    {message}
                </span>
            )}
            <Button
                variant='ghost'
                size='icon'
                onClick={handleToggle}
                disabled={isLoading}
                aria-label={
                    isEnabled
                        ? 'Turn off notifications'
                        : 'Enable notifications'
                }
            >
                {isLoading ? (
                    <Loader2Icon className='h-4 w-4 animate-spin' />
                ) : isEnabled ? (
                    <Bell className='h-4 w-4 text-green-500' />
                ) : (
                    <BellOff className='h-4 w-4' />
                )}
            </Button>
        </div>
    )
}
