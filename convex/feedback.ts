import { mutation } from './_generated/server'
import { v } from 'convex/values'

/**
 * Insert feedback or bug report. Callable from server (HTTP) without user auth.
 */
export const insertFeedback = mutation({
    args: {
        type: v.union(v.literal('feedback'), v.literal('bug')),
        message: v.string(),
        userId: v.optional(v.id('users')),
        email: v.optional(v.string()),
        name: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert('feedback', {
            type: args.type,
            message: args.message,
            createdAt: Date.now(),
            userId: args.userId,
            email: args.email,
            name: args.name,
        })
    },
})
