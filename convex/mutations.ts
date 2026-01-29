import { mutation } from './_generated/server'
import { v } from 'convex/values'
import { getDailyTarget } from './utils'
import { z } from 'zod'
import { api } from './_generated/api'

// ============================================================================
// addPushups
// ============================================================================
export const addPushups = mutation({
    args: {
        count: v.number(),
        submissionDate: v.string(),
        userEmail: v.string(), // Passed from client after NextAuth session validation
    },
    handler: async (ctx, args) => {
        if (!args.userEmail) {
            throw new Error('Not authenticated')
        }

        const user = await ctx.db
            .query('users')
            .withIndex('email', (q) => q.eq('email', args.userEmail))
            .first()

        if (!user) {
            throw new Error('User not found')
        }

        const date = new Date(args.submissionDate + 'T00:00:00')
        const target = getDailyTarget(date)

        const entries = await ctx.db
            .query('pushupEntries')
            .withIndex('by_user_and_date', (q) =>
                q.eq('userId', user._id).eq('date', args.submissionDate)
            )
            .collect()

        const current = entries.reduce((sum, entry) => sum + entry.count, 0)
        const remaining = Math.max(0, target - current)

        const validatedFields = z
            .object({
                count: z
                    .number()
                    .int()
                    .min(1, "You can't log less than 1 pushup")
                    .max(
                        remaining,
                        `You can't log more than the remaining ${remaining} pushup${
                            remaining === 1 ? '' : 's'
                        }`
                    ),
                submissionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
            })
            .safeParse({
                count: args.count,
                submissionDate: args.submissionDate,
            })

        if (!validatedFields.success) {
            throw new Error(
                validatedFields.error.errors.map((e) => e.message).join(', ')
            )
        }

        await ctx.db.insert('pushupEntries', {
            userId: user._id,
            count: validatedFields.data.count,
            date: validatedFields.data.submissionDate,
            createdAt: Date.now(),
            recovery: false,
        })

        const year = date.getFullYear()
        const count = validatedFields.data.count

        const existingCommunity = await ctx.db
            .query('yearlyCommunityStats')
            .withIndex('by_year', (q) => q.eq('year', year))
            .first()
        if (existingCommunity) {
            await ctx.db.patch(existingCommunity._id, {
                communityTotal: existingCommunity.communityTotal + count,
            })
        } else {
            await ctx.db.insert('yearlyCommunityStats', {
                year,
                communityTotal: count,
            })
        }

        const existingUserStats = await ctx.db
            .query('userYearlyStats')
            .withIndex('by_user_and_year', (q) =>
                q.eq('userId', user._id).eq('year', year)
            )
            .first()
        if (existingUserStats) {
            await ctx.db.patch(existingUserStats._id, {
                myTotal: existingUserStats.myTotal + count,
                onTimePushups: (existingUserStats.onTimePushups ?? 0) + count,
            })
        } else {
            await ctx.db.insert('userYearlyStats', {
                userId: user._id,
                year,
                myTotal: count,
                onTimePushups: count,
                recoveredPushups: 0,
            })
        }

        const newEntries = await ctx.db
            .query('pushupEntries')
            .withIndex('by_user_and_date', (q) =>
                q.eq('userId', user._id).eq('date', args.submissionDate)
            )
            .collect()

        const newTotal = newEntries.reduce((sum, entry) => sum + entry.count, 0)

        return {
            success: true,
            message: 'Pushups logged successfully!',
            total: newTotal,
        }
    },
})

// ============================================================================
// recoverPushups
// ============================================================================
export const recoverPushups = mutation({
    args: {
        count: v.number(),
        targetDate: v.string(),
        userEmail: v.string(), // Passed from client after NextAuth session validation
    },
    handler: async (ctx, args) => {
        if (!args.userEmail) {
            throw new Error('Not authenticated')
        }

        const user = await ctx.db
            .query('users')
            .withIndex('email', (q) => q.eq('email', args.userEmail))
            .first()

        if (!user) {
            throw new Error('User not found')
        }

        const missedDays = await ctx.runQuery(api.queries.getMissedDays, {
            todayDateString: undefined,
            userEmail: args.userEmail,
        })

        const missedDay = missedDays.find(
            (d: { date: string; missed: number }) => d.date === args.targetDate
        )

        if (!missedDay) {
            throw new Error('Invalid recovery date')
        }

        const validatedFields = z
            .object({
                count: z
                    .number()
                    .int()
                    .min(1, "You can't recover less than 1 pushup")
                    .max(
                        missedDay.missed,
                        `You can only recover up to ${missedDay.missed} pushup${
                            missedDay.missed === 1 ? '' : 's'
                        } for this day`
                    ),
                targetDate: z.string(),
            })
            .safeParse({
                count: args.count,
                targetDate: args.targetDate,
            })

        if (!validatedFields.success) {
            throw new Error(
                validatedFields.error.errors.map((e) => e.message).join(', ')
            )
        }

        await ctx.db.insert('pushupEntries', {
            userId: user._id,
            count: validatedFields.data.count,
            date: validatedFields.data.targetDate,
            createdAt: Date.now(),
            recovery: true,
        })

        const year = new Date(args.targetDate + 'T00:00:00').getFullYear()
        const count = validatedFields.data.count

        const existingCommunity = await ctx.db
            .query('yearlyCommunityStats')
            .withIndex('by_year', (q) => q.eq('year', year))
            .first()
        if (existingCommunity) {
            await ctx.db.patch(existingCommunity._id, {
                communityTotal: existingCommunity.communityTotal + count,
            })
        } else {
            await ctx.db.insert('yearlyCommunityStats', {
                year,
                communityTotal: count,
            })
        }

        const existingUserStats = await ctx.db
            .query('userYearlyStats')
            .withIndex('by_user_and_year', (q) =>
                q.eq('userId', user._id).eq('year', year)
            )
            .first()
        if (existingUserStats) {
            await ctx.db.patch(existingUserStats._id, {
                myTotal: existingUserStats.myTotal + count,
                recoveredPushups:
                    (existingUserStats.recoveredPushups ?? 0) + count,
            })
        } else {
            await ctx.db.insert('userYearlyStats', {
                userId: user._id,
                year,
                myTotal: count,
                onTimePushups: 0,
                recoveredPushups: count,
            })
        }

        return {
            success: true,
            message: `Recovered ${args.count} pushup${
                args.count === 1 ? '' : 's'
            } successfully!`,
        }
    },
})
