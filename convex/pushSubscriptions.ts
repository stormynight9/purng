import { internalMutation, internalQuery, mutation } from './_generated/server'
import { v } from 'convex/values'

const subscriptionValidator = v.object({
    endpoint: v.string(),
    keys: v.object({
        p256dh: v.string(),
        auth: v.string(),
    }),
})

/**
 * Save or update a push subscription for the given user (by email).
 * Replaces any existing subscription with the same endpoint.
 */
export const savePushSubscription = mutation({
    args: {
        userEmail: v.string(),
        subscription: subscriptionValidator,
    },
    handler: async (ctx, args) => {
        if (!args.userEmail) throw new Error('Not authenticated')

        const existing = await ctx.db
            .query('pushSubscriptions')
            .withIndex('by_endpoint', (q) =>
                q.eq('endpoint', args.subscription.endpoint)
            )
            .first()

        const row = {
            userEmail: args.userEmail,
            endpoint: args.subscription.endpoint,
            p256dh: args.subscription.keys.p256dh,
            auth: args.subscription.keys.auth,
            createdAt: Date.now(),
        }

        if (existing) {
            await ctx.db.patch(existing._id, row)
            return existing._id
        }
        return await ctx.db.insert('pushSubscriptions', row)
    },
})

/**
 * Internal: list push subscriptions for a user (used by send action).
 */
export const getSubscriptionsByEmail = internalQuery({
    args: { userEmail: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query('pushSubscriptions')
            .withIndex('by_user_email', (q) =>
                q.eq('userEmail', args.userEmail)
            )
            .collect()
    },
})

/**
 * Internal: distinct userEmails that have at least one subscription (for daily reminders).
 */
export const getDistinctUserEmails = internalQuery({
    args: {},
    handler: async (ctx) => {
        const all = await ctx.db.query('pushSubscriptions').collect()
        const emails = new Set(all.map((s) => s.userEmail))
        return [...emails]
    },
})

/**
 * Remove a push subscription (e.g. when user revokes permission).
 */
export const removePushSubscription = mutation({
    args: {
        userEmail: v.string(),
        endpoint: v.string(),
    },
    handler: async (ctx, args) => {
        const sub = await ctx.db
            .query('pushSubscriptions')
            .withIndex('by_endpoint', (q) => q.eq('endpoint', args.endpoint))
            .first()
        if (sub && sub.userEmail === args.userEmail) {
            await ctx.db.delete(sub._id)
        }
    },
})

/**
 * Internal: delete a subscription by id (used by send action when push returns 410 Gone).
 */
export const deleteSubscriptionById = internalMutation({
    args: { subscriptionId: v.id('pushSubscriptions') },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.subscriptionId)
    },
})
