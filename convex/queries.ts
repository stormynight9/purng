import { query } from './_generated/server'
import { v } from 'convex/values'
import { Id } from './_generated/dataModel'
import { getDailyTarget, getDayOfYear, getLocalDateString } from './utils'
import { api } from './_generated/api'

// ============================================================================
// getTodaysPushups
// ============================================================================
export const getTodaysPushups = query({
    args: {
        dateString: v.string(),
        userEmail: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userEmail = args.userEmail
        if (!userEmail) return 0

        const user = await ctx.db
            .query('users')
            .withIndex('email', (q) => q.eq('email', userEmail))
            .first()

        if (!user) return 0

        const entries = await ctx.db
            .query('pushupEntries')
            .withIndex('by_user_and_date', (q) =>
                q.eq('userId', user._id).eq('date', args.dateString)
            )
            .collect()

        return entries.reduce((sum, entry) => sum + entry.count, 0)
    },
})

// ============================================================================
// getTargetData
// ============================================================================
export const getTargetData = query({
    args: {
        dateString: v.string(),
        userEmail: v.optional(v.string()),
    },
    handler: async (
        ctx,
        args
    ): Promise<{ target: number; current: number }> => {
        const date = new Date(args.dateString + 'T00:00:00')
        const target = getDailyTarget(date)
        const current: number = await ctx.runQuery(
            api.queries.getTodaysPushups,
            {
                dateString: args.dateString,
                userEmail: args.userEmail,
            }
        )
        return { target, current }
    },
})

// ============================================================================
// getTotalPushups
// ============================================================================
export const getTotalPushups = query({
    args: {
        year: v.optional(v.number()),
        userEmail: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userEmail = args.userEmail
        if (!userEmail) return 0

        const user = await ctx.db
            .query('users')
            .withIndex('email', (q) => q.eq('email', userEmail))
            .first()

        if (!user) return 0

        const targetYear = args.year ?? new Date().getFullYear()

        const stats = await ctx.db
            .query('userYearlyStats')
            .withIndex('by_user_and_year', (q) =>
                q.eq('userId', user._id).eq('year', targetYear)
            )
            .first()

        if (stats) return stats.myTotal

        // Fallback: compute from entries (pre-backfill or edge case)
        const startOfYear = `${targetYear}-01-01`
        const endOfYear = `${targetYear}-12-31`
        const entries = await ctx.db
            .query('pushupEntries')
            .withIndex('by_user', (q) => q.eq('userId', user._id))
            .collect()
        return entries
            .filter(
                (entry) => entry.date >= startOfYear && entry.date <= endOfYear
            )
            .reduce((sum, entry) => sum + entry.count, 0)
    },
})

// ============================================================================
// getAllUsersTotalPushups
// ============================================================================
export const getAllUsersTotalPushups = query({
    args: {
        year: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const targetYear = args.year ?? new Date().getFullYear()

        const stats = await ctx.db
            .query('yearlyCommunityStats')
            .withIndex('by_year', (q) => q.eq('year', targetYear))
            .first()

        if (stats) return stats.communityTotal
        return 0
    },
})

// ============================================================================
// getCompletionCount
// ============================================================================
export const getCompletionCount = query({
    args: {
        dateString: v.string(),
    },
    handler: async (ctx, args) => {
        const date = new Date(args.dateString + 'T00:00:00')
        const target = getDailyTarget(date)

        const entries = await ctx.db
            .query('pushupEntries')
            .withIndex('by_date', (q) => q.eq('date', args.dateString))
            .collect()

        const userTotals = new Map<string, number>()
        for (const entry of entries) {
            const current = userTotals.get(entry.userId) || 0
            userTotals.set(entry.userId, current + entry.count)
        }

        let completionCount = 0
        for (const total of userTotals.values()) {
            if (total >= target) {
                completionCount++
            }
        }

        return completionCount
    },
})

// ============================================================================
// getMissedDays
// ============================================================================
export const getMissedDays = query({
    args: {
        todayDateString: v.optional(v.string()),
        userEmail: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userEmail = args.userEmail
        if (!userEmail) return []

        const user = await ctx.db
            .query('users')
            .withIndex('email', (q) => q.eq('email', userEmail))
            .first()

        if (!user) return []

        const today = args.todayDateString
            ? new Date(args.todayDateString + 'T00:00:00')
            : new Date()
        const startOfYear = new Date(today.getFullYear(), 0, 1)
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (yesterday < startOfYear) return []

        const startDateStr = getLocalDateString(startOfYear)
        const endDateStr = getLocalDateString(yesterday)

        const entries = await ctx.db
            .query('pushupEntries')
            .withIndex('by_user', (q) => q.eq('userId', user._id))
            .collect()

        const completedByDate = new Map<string, number>()
        for (const entry of entries) {
            if (entry.date >= startDateStr && entry.date <= endDateStr) {
                const current = completedByDate.get(entry.date) || 0
                completedByDate.set(entry.date, current + entry.count)
            }
        }

        const missedDays: Array<{
            date: string
            target: number
            completed: number
            missed: number
        }> = []
        const currentDate = new Date(startOfYear)

        while (currentDate <= yesterday) {
            const dateString = getLocalDateString(currentDate)
            const target = getDailyTarget(currentDate)

            if (target > 0) {
                const completed = completedByDate.get(dateString) || 0
                const missed = Math.max(0, target - completed)

                if (missed > 0) {
                    missedDays.push({
                        date: dateString,
                        target,
                        completed,
                        missed,
                    })
                }
            }

            currentDate.setDate(currentDate.getDate() + 1)
        }

        return missedDays
    },
})

// ============================================================================
// getTotalMissedPushups
// ============================================================================
export const getTotalMissedPushups = query({
    args: {
        todayDateString: v.optional(v.string()),
        userEmail: v.optional(v.string()),
    },
    handler: async (ctx, args): Promise<number> => {
        const missedDays: Array<{ missed: number }> = await ctx.runQuery(
            api.queries.getMissedDays,
            {
                todayDateString: args.todayDateString,
                userEmail: args.userEmail,
            }
        )
        return missedDays.reduce((total, day) => total + day.missed, 0)
    },
})

// ============================================================================
// getYearData
// ============================================================================
export const getYearData = query({
    args: {
        todayDateString: v.optional(v.string()),
        userEmail: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const today = args.todayDateString
            ? new Date(args.todayDateString + 'T00:00:00')
            : new Date()
        const year = today.getFullYear()
        const startOfYear = new Date(year, 0, 1)
        const endOfYear = new Date(year, 11, 31)
        const todayStr = args.todayDateString || getLocalDateString(today)

        const completedByDate = new Map<string, number>()
        const userEmail = args.userEmail

        if (userEmail) {
            const user = await ctx.db
                .query('users')
                .withIndex('email', (q) => q.eq('email', userEmail))
                .first()

            if (user) {
                const startDateStr = getLocalDateString(startOfYear)
                const entries = await ctx.db
                    .query('pushupEntries')
                    .withIndex('by_user', (q) => q.eq('userId', user._id))
                    .collect()

                for (const entry of entries) {
                    if (entry.date >= startDateStr && entry.date <= todayStr) {
                        const current = completedByDate.get(entry.date) || 0
                        completedByDate.set(entry.date, current + entry.count)
                    }
                }
            }
        }

        const yearDays: Array<{
            date: string
            dayOfMonth: number
            month: number
            status: 'future' | 'today' | 'completed' | 'missed' | 'rest'
            target: number
            completed: number
        }> = []
        const currentDate = new Date(startOfYear)

        while (currentDate <= endOfYear) {
            const dateString = getLocalDateString(currentDate)
            const target = getDailyTarget(currentDate)
            const completed = completedByDate.get(dateString) || 0

            let status: 'future' | 'today' | 'completed' | 'missed' | 'rest'
            if (dateString === todayStr) {
                status = 'today'
            } else if (currentDate > today) {
                status = 'future'
            } else if (target === 0) {
                status = 'rest'
            } else if (completed >= target) {
                status = 'completed'
            } else {
                status = 'missed'
            }

            yearDays.push({
                date: dateString,
                dayOfMonth: currentDate.getDate(),
                month: currentDate.getMonth(),
                status,
                target,
                completed,
            })

            currentDate.setDate(currentDate.getDate() + 1)
        }

        return yearDays
    },
})

// ============================================================================
// getStatsData
// ============================================================================
export const getStatsData = query({
    args: {
        dateString: v.string(),
        year: v.number(),
        userEmail: v.optional(v.string()),
    },
    handler: async (
        ctx,
        args
    ): Promise<{
        dayNumber: number
        year: number
        myTotal: number
        communityTotal: number
        completionCount: number
        missedPushups: number
        target: number
    }> => {
        const today = new Date(args.dateString + 'T00:00:00')
        const dayNumber = getDayOfYear(today)
        const target = getDailyTarget(today)

        const [myTotal, communityTotal, completionCount, missedPushups]: [
            number,
            number,
            number,
            number,
        ] = await Promise.all([
            ctx.runQuery(api.queries.getTotalPushups, {
                year: args.year,
                userEmail: args.userEmail,
            }),
            ctx.runQuery(api.queries.getAllUsersTotalPushups, {
                year: args.year,
            }),
            ctx.runQuery(api.queries.getCompletionCount, {
                dateString: args.dateString,
            }),
            ctx.runQuery(api.queries.getTotalMissedPushups, {
                todayDateString: args.dateString,
                userEmail: args.userEmail,
            }),
        ])

        return {
            dayNumber,
            year: args.year,
            myTotal,
            communityTotal,
            completionCount,
            missedPushups,
            target,
        }
    },
})

// ============================================================================
// getActivityFeed
// ============================================================================
function formatUserName(name: string | null): string {
    if (!name) return 'Anonymous'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0]
    const firstName = parts[0]
    const lastInitial = parts[parts.length - 1][0]
    return `${firstName} ${lastInitial}.`
}

export const getActivityFeed = query({
    args: {
        cursor: v.optional(v.number()), // Timestamp for efficient cursor-based pagination
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 20

        // Efficient pagination: use index range query + order + take
        // This only reads (limit + 1) documents, not the entire table
        const queryBuilder = ctx.db
            .query('pushupEntries')
            .withIndex('by_created_at', (q) =>
                args.cursor ? q.lt('createdAt', args.cursor) : q
            )
            .order('desc')
            .take(limit + 1)

        const entries = await queryBuilder
        const hasMore = entries.length > limit
        const limitedEntries = hasMore ? entries.slice(0, limit) : entries

        if (limitedEntries.length === 0) {
            return { entries: [], nextCursor: null }
        }

        // Batch fetch users
        const userIds = [...new Set(limitedEntries.map((e) => e.userId))]
        const users = await Promise.all(userIds.map((id) => ctx.db.get(id)))
        const userMap = new Map(
            userIds.map((id, i) => [id, users[i]?.name ?? null])
        )

        // Batch fetch daily totals for "completed" detection
        // Group by user+date, fetch only what we need
        const userDateKeys = [
            ...new Set(limitedEntries.map((e) => `${e.userId}|${e.date}`)),
        ]

        const dailyTotals = new Map<
            string,
            { entries: typeof limitedEntries }
        >()
        await Promise.all(
            userDateKeys.map(async (key) => {
                const [userId, date] = key.split('|')
                const dayEntries = await ctx.db
                    .query('pushupEntries')
                    .withIndex('by_user_and_date', (q) =>
                        q.eq('userId', userId as Id<'users'>).eq('date', date)
                    )
                    .collect()
                dailyTotals.set(key, { entries: dayEntries })
            })
        )

        const activityEntries = limitedEntries.map((entry) => {
            const key = `${entry.userId}|${entry.date}`
            const dayData = dailyTotals.get(key)
            const sameDayEntries = dayData?.entries || []

            // Calculate running total up to this entry
            const sortedSameDay = [...sameDayEntries].sort(
                (a, b) => a.createdAt - b.createdAt
            )
            let runningTotal = 0
            for (const e of sortedSameDay) {
                runningTotal += e.count
                if (e._id === entry._id) break
            }

            const target = getDailyTarget(new Date(entry.date + 'T00:00:00'))
            const priorTotal = runningTotal - entry.count

            let type: 'regular' | 'recovery' | 'completed' = 'regular'
            if (entry.recovery) {
                type = 'recovery'
            } else if (
                target > 0 &&
                priorTotal < target &&
                runningTotal >= target
            ) {
                type = 'completed'
            }

            return {
                id: entry._id,
                userName: formatUserName(userMap.get(entry.userId) ?? null),
                count: entry.count,
                date: entry.date,
                createdAt: entry.createdAt,
                type,
                target,
            }
        })

        const nextCursor = hasMore
            ? limitedEntries[limitedEntries.length - 1].createdAt
            : null

        return { entries: activityEntries, nextCursor }
    },
})

// ============================================================================
// getLeaderboard
// ============================================================================
export const getLeaderboard = query({
    args: {
        year: v.number(),
    },
    handler: async (ctx, args) => {
        const stats = await ctx.db
            .query('userYearlyStats')
            .withIndex('by_year', (q) => q.eq('year', args.year))
            .collect()

        const sorted = [...stats].sort((a, b) => {
            const totalA = a.myTotal
            const totalB = b.myTotal
            if (totalB !== totalA) return totalB - totalA
            const onTimeA = a.onTimePushups ?? 0
            const onTimeB = b.onTimePushups ?? 0
            return onTimeB - onTimeA
        })

        const userIds = [...new Set(sorted.map((s) => s.userId))]
        const users = await Promise.all(userIds.map((id) => ctx.db.get(id)))
        const userMap = new Map(
            userIds.map((id, i) => [id, users[i]?.name ?? null])
        )

        return sorted.map((doc, i) => ({
            rank: i + 1,
            userId: doc.userId,
            userName: formatUserName(userMap.get(doc.userId) ?? null),
            recoveredPushups: doc.recoveredPushups ?? 0,
            onTimePushups: doc.onTimePushups ?? 0,
            total: doc.myTotal,
        }))
    },
})
