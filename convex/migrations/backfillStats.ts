import { mutation } from '../_generated/server'
import { Id } from '../_generated/dataModel'

/**
 * One-time backfill: compute yearlyCommunityStats and userYearlyStats
 * from existing pushupEntries. Run once after adding the stats tables.
 */
export const backfillStats = mutation({
    args: {},
    handler: async (ctx) => {
        const entries = await ctx.db.query('pushupEntries').collect()

        const communityByYear = new Map<number, number>()
        const userByYear = new Map<
            string,
            { myTotal: number; onTimePushups: number; recoveredPushups: number }
        >() // key: `${userId}|${year}`

        for (const entry of entries) {
            const year = new Date(entry.date + 'T00:00:00').getFullYear()
            communityByYear.set(
                year,
                (communityByYear.get(year) ?? 0) + entry.count
            )
            const userKey = `${entry.userId}|${year}`
            const prev = userByYear.get(userKey) ?? {
                myTotal: 0,
                onTimePushups: 0,
                recoveredPushups: 0,
            }
            userByYear.set(userKey, {
                myTotal: prev.myTotal + entry.count,
                onTimePushups:
                    prev.onTimePushups + (entry.recovery ? 0 : entry.count),
                recoveredPushups:
                    prev.recoveredPushups + (entry.recovery ? entry.count : 0),
            })
        }

        for (const [year, communityTotal] of communityByYear) {
            const existing = await ctx.db
                .query('yearlyCommunityStats')
                .withIndex('by_year', (q) => q.eq('year', year))
                .first()
            if (existing) {
                await ctx.db.patch(existing._id, { communityTotal })
            } else {
                await ctx.db.insert('yearlyCommunityStats', {
                    year,
                    communityTotal,
                })
            }
        }

        for (const [userKey, stats] of userByYear) {
            const [userId, yearStr] = userKey.split('|')
            const year = parseInt(yearStr, 10)
            const existing = await ctx.db
                .query('userYearlyStats')
                .withIndex('by_user_and_year', (q) =>
                    q.eq('userId', userId as Id<'users'>).eq('year', year)
                )
                .first()
            if (existing) {
                await ctx.db.patch(existing._id, {
                    myTotal: stats.myTotal,
                    onTimePushups: stats.onTimePushups,
                    recoveredPushups: stats.recoveredPushups,
                })
            } else {
                await ctx.db.insert('userYearlyStats', {
                    userId: userId as Id<'users'>,
                    year,
                    myTotal: stats.myTotal,
                    onTimePushups: stats.onTimePushups,
                    recoveredPushups: stats.recoveredPushups,
                })
            }
        }

        return {
            entriesProcessed: entries.length,
            yearsUpdated: communityByYear.size,
            userYearsUpdated: userByYear.size,
        }
    },
})
