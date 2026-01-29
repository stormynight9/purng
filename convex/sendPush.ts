'use node'

/// <reference path="./web-push.d.ts" />
import { internal } from './_generated/api'
import { internalAction } from './_generated/server'
import { v } from 'convex/values'
import webpush from 'web-push'
import { getDailyTarget } from './utils'

function subscriptionForWebPush(sub: {
    endpoint: string
    p256dh: string
    auth: string
}) {
    return {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
    }
}

/**
 * Send a push notification to one user (all their subscriptions).
 * Requires Convex env: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY.
 */
export const sendToUser = internalAction({
    args: {
        userEmail: v.string(),
        payload: v.object({
            title: v.string(),
            body: v.optional(v.string()),
            url: v.optional(v.string()),
        }),
    },
    handler: async (ctx, args) => {
        const publicKey = process.env.VAPID_PUBLIC_KEY
        const privateKey = process.env.VAPID_PRIVATE_KEY
        if (!publicKey || !privateKey) {
            throw new Error(
                'Missing VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY in Convex env'
            )
        }

        webpush.setVapidDetails(
            'mailto:support@purng.nader.run',
            publicKey,
            privateKey
        )

        const subs = await ctx.runQuery(
            internal.pushSubscriptions.getSubscriptionsByEmail,
            { userEmail: args.userEmail }
        )

        const payloadStr = JSON.stringify({
            title: args.payload.title,
            body: args.payload.body ?? '',
            url: args.payload.url ?? '/',
        })

        for (const sub of subs) {
            try {
                await webpush.sendNotification(
                    subscriptionForWebPush({
                        endpoint: sub.endpoint,
                        p256dh: sub.p256dh,
                        auth: sub.auth,
                    }),
                    payloadStr
                )
            } catch (err: unknown) {
                const statusCode =
                    err &&
                    typeof err === 'object' &&
                    'statusCode' in err &&
                    typeof (err as { statusCode: number }).statusCode ===
                        'number'
                        ? (err as { statusCode: number }).statusCode
                        : 0
                if (statusCode === 410 || statusCode === 404) {
                    await ctx.runMutation(
                        internal.pushSubscriptions.deleteSubscriptionById,
                        { subscriptionId: sub._id }
                    )
                }
            }
        }
    },
})

/**
 * Daily reminder: send "Time for your pushups" to users who have a subscription
 * and have not logged today (UTC date). Run via cron (e.g. once per day).
 */
export const sendDailyReminders = internalAction({
    args: {},
    handler: async (ctx) => {
        const publicKey = process.env.VAPID_PUBLIC_KEY
        const privateKey = process.env.VAPID_PRIVATE_KEY
        if (!publicKey || !privateKey) return

        // Today's date in UTC (reminders use UTC day for simplicity).
        const todayUtc = new Date().toISOString().slice(0, 10)
        const todayDate = new Date(todayUtc + 'T12:00:00.000Z')
        const target = getDailyTarget(todayDate)

        const userEmails = await ctx.runQuery(
            internal.pushSubscriptions.getDistinctUserEmails,
            {}
        )

        const body =
            target === 0
                ? "It's a rest day – enjoy the break!"
                : `Don't forget to log your pushups today! Target: ${target} pushups.`

        for (const userEmail of userEmails) {
            const hasLoggedToday = await ctx.runQuery(
                internal.queries.userHasLoggedOnDate,
                { userEmail, dateString: todayUtc }
            )
            if (!hasLoggedToday) {
                await ctx.runAction(internal.sendPush.sendToUser, {
                    userEmail,
                    payload: {
                        title: 'Time for your pushups',
                        body,
                        url: '/',
                    },
                })
            }
        }
    },
})
