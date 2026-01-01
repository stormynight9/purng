'use server'

import { auth } from '@/auth'
import { db } from '@/db/db'
import { pushupEntries, users } from '@/db/schema'
import { and, desc, eq, gte, lt, lte, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import { z } from 'zod'
import type {
    ActionResponse,
    ActivityEntry,
    ActivityType,
    DayStatus,
    MissedDay,
    YearDay,
} from './types'
import { getDailyTarget, getLocalDateString } from './utils.server'

export async function addPushups(
    prevState: ActionResponse | null,
    formData: FormData
): Promise<ActionResponse> {
    const session = await auth()
    if (!session?.user?.id) {
        return {
            success: false,
            message: 'Not authenticated',
        }
    }

    try {
        const count = Number(formData.get('count'))
        // Use the local date string sent from the client
        const submissionDate = formData.get('submissionDate') as string

        // Get current progress and target
        const { target, current } = await getTargetData(submissionDate)
        const remaining = Math.max(0, target - current)

        const validatedFields = z
            .object({
                count: z
                    .number()
                    .int()
                    .min(1, "You can't log less than 1 pushup")
                    .max(
                        remaining,
                        `You can't log more than the remaining ${remaining} pushup${remaining === 1 ? '' : 's'}`
                    ),
                submissionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
            })
            .safeParse({
                count,
                submissionDate,
            })

        if (!validatedFields.success) {
            return {
                success: false,
                message: 'Please fix the errors in the form',
                errors: {
                    count: validatedFields.error.errors.map((e) => e.message),
                },
            }
        }

        await db.insert(pushupEntries).values({
            userId: session.user.id,
            count: validatedFields.data.count,
            date: validatedFields.data.submissionDate,
        })

        const newTotal = await getTodaysPushups(submissionDate)

        revalidatePath('/')
        return {
            success: true,
            message: 'Pushups logged successfully!',
            total: newTotal,
        }
    } catch (error) {
        console.error(error)
        return {
            success: false,
            message: 'An unexpected error occurred',
        }
    }
}

export const getTargetData = cache(async (dateString: string) => {
    // Add T00:00:00 to parse as local time, not UTC
    const date = new Date(dateString + 'T00:00:00')
    const target = getDailyTarget(date)
    const current = await getTodaysPushups(dateString)
    return { target, current }
})

export const getTodaysPushups = cache(async (dateString: string) => {
    const session = await auth()
    if (!session?.user?.id) return 0

    const result = await db
        .select({
            total: sql<number>`sum(${pushupEntries.count})`,
        })
        .from(pushupEntries)
        .where(
            and(
                eq(pushupEntries.userId, session.user.id),
                eq(pushupEntries.date, dateString)
            )
        )

    return Number(result[0]?.total) || 0
})

export const getCompletionCount = cache(async (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00')
    const target = getDailyTarget(date)

    const result = await db
        .select({
            count: sql<number>`count(distinct user_totals.user_id)`,
        })
        .from(
            sql`(
                SELECT 
                    ${pushupEntries.userId} as user_id,
                    sum(${pushupEntries.count}) as total_pushups
                FROM ${pushupEntries}
                WHERE ${pushupEntries.date} = ${dateString}
                GROUP BY ${pushupEntries.userId}
                HAVING sum(${pushupEntries.count}) >= ${target}
            ) as user_totals`
        )

    return result[0]?.count ?? 0
})

export const getTotalPushups = cache(async (year?: number) => {
    const session = await auth()
    if (!session?.user?.id) return 0

    const targetYear = year ?? new Date().getFullYear()
    const startOfYear = `${targetYear}-01-01`
    const endOfYear = `${targetYear}-12-31`

    const result = await db
        .select({
            total: sql<number>`sum(${pushupEntries.count})`,
        })
        .from(pushupEntries)
        .where(
            and(
                eq(pushupEntries.userId, session.user.id),
                gte(pushupEntries.date, startOfYear),
                lte(pushupEntries.date, endOfYear)
            )
        )

    return Number(result[0]?.total) || 0
})

export const getAllUsersTotalPushups = cache(async (year?: number) => {
    const targetYear = year ?? new Date().getFullYear()
    const startOfYear = `${targetYear}-01-01`
    const endOfYear = `${targetYear}-12-31`

    const result = await db
        .select({
            total: sql<number>`sum(${pushupEntries.count})`,
        })
        .from(pushupEntries)
        .where(
            and(
                gte(pushupEntries.date, startOfYear),
                lte(pushupEntries.date, endOfYear)
            )
        )

    return Number(result[0]?.total) || 0
})

// Get all days with missed pushups from Jan 1 of current year to yesterday
// Optimized: single DB query to fetch all user entries, then calculate in memory
// todayDateString should be in YYYY-MM-DD format from the client's local time
export const getMissedDays = cache(
    async (todayDateString?: string): Promise<MissedDay[]> => {
        const session = await auth()
        if (!session?.user?.id) return []

        // Use provided date or fall back to server date
        const today = todayDateString
            ? new Date(todayDateString + 'T00:00:00')
            : new Date()
        const startOfYear = new Date(today.getFullYear(), 0, 1)
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        // If we're on Jan 1, there are no missed days yet
        if (yesterday < startOfYear) return []

        const startDateStr = getLocalDateString(startOfYear)
        const endDateStr = getLocalDateString(yesterday)

        // Fetch all user entries for the year in a single query, grouped by date
        const userEntries = await db
            .select({
                date: pushupEntries.date,
                total: sql<number>`sum(${pushupEntries.count})`,
            })
            .from(pushupEntries)
            .where(
                and(
                    eq(pushupEntries.userId, session.user.id),
                    gte(pushupEntries.date, startDateStr),
                    lte(pushupEntries.date, endDateStr)
                )
            )
            .groupBy(pushupEntries.date)

        // Create a map for quick lookup
        const completedByDate = new Map<string, number>()
        for (const entry of userEntries) {
            // Ensure the total is a number (SQL aggregates can return strings)
            completedByDate.set(entry.date, Number(entry.total) || 0)
        }

        // Calculate missed days in memory
        const missedDays: MissedDay[] = []
        const currentDate = new Date(startOfYear)

        while (currentDate <= yesterday) {
            const dateString = getLocalDateString(currentDate)
            const target = getDailyTarget(currentDate)

            // Skip rest days (target is 0 when isRestDay returns true)
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
    }
)

// Get total missed pushups count
export const getTotalMissedPushups = cache(
    async (todayDateString?: string): Promise<number> => {
        const missedDays = await getMissedDays(todayDateString)
        return missedDays.reduce((total, day) => total + day.missed, 0)
    }
)

// Recover pushups for a specific past day
export async function recoverPushups(
    prevState: ActionResponse | null,
    formData: FormData
): Promise<ActionResponse> {
    const session = await auth()
    if (!session?.user?.id) {
        return {
            success: false,
            message: 'Not authenticated',
        }
    }

    try {
        const count = Number(formData.get('count'))
        const targetDate = formData.get('targetDate') as string

        // Verify the date is a valid past date with missed pushups
        const missedDays = await getMissedDays()
        const missedDay = missedDays.find((d) => d.date === targetDate)

        if (!missedDay) {
            return {
                success: false,
                message: 'Invalid recovery date',
            }
        }

        // Validate the recovery count
        const validatedFields = z
            .object({
                count: z
                    .number()
                    .int()
                    .min(1, "You can't recover less than 1 pushup")
                    .max(
                        missedDay.missed,
                        `You can only recover up to ${missedDay.missed} pushup${missedDay.missed === 1 ? '' : 's'} for this day`
                    ),
                targetDate: z.string(),
            })
            .safeParse({
                count,
                targetDate,
            })

        if (!validatedFields.success) {
            return {
                success: false,
                message: 'Please fix the errors in the form',
                errors: {
                    count: validatedFields.error.errors.map((e) => e.message),
                },
            }
        }

        // Add the recovery entry to the original missed day
        await db.insert(pushupEntries).values({
            userId: session.user.id,
            count: validatedFields.data.count,
            date: validatedFields.data.targetDate,
        })

        revalidatePath('/')
        return {
            success: true,
            message: `Recovered ${count} pushup${count === 1 ? '' : 's'} successfully!`,
        }
    } catch (error) {
        console.error(error)
        return {
            success: false,
            message: 'An unexpected error occurred',
        }
    }
}

// Get all days of the year with their status for the grid view
// todayDateString should be in YYYY-MM-DD format from the client's local time
export const getYearData = cache(
    async (todayDateString?: string): Promise<YearDay[]> => {
        const session = await auth()
        // Use provided date or fall back to server date
        const today = todayDateString
            ? new Date(todayDateString + 'T00:00:00')
            : new Date()
        const year = today.getFullYear()
        const startOfYear = new Date(year, 0, 1)
        const endOfYear = new Date(year, 11, 31)
        const todayStr = todayDateString || getLocalDateString(today)

        // Fetch all user entries for the year in a single query
        const completedByDate = new Map<string, number>()

        if (session?.user?.id) {
            const startDateStr = getLocalDateString(startOfYear)
            const endDateStr = todayStr

            const userEntries = await db
                .select({
                    date: pushupEntries.date,
                    total: sql<number>`sum(${pushupEntries.count})`,
                })
                .from(pushupEntries)
                .where(
                    and(
                        eq(pushupEntries.userId, session.user.id),
                        gte(pushupEntries.date, startDateStr),
                        lte(pushupEntries.date, endDateStr)
                    )
                )
                .groupBy(pushupEntries.date)

            for (const entry of userEntries) {
                // Ensure the total is a number (SQL aggregates can return strings)
                completedByDate.set(entry.date, Number(entry.total) || 0)
            }
        }

        // Build the year data
        const yearDays: YearDay[] = []
        const currentDate = new Date(startOfYear)

        while (currentDate <= endOfYear) {
            const dateString = getLocalDateString(currentDate)
            const target = getDailyTarget(currentDate)
            const completed = completedByDate.get(dateString) || 0

            let status: DayStatus
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
    }
)

// Format user name as "First L."
function formatUserName(name: string | null): string {
    if (!name) return 'Anonymous'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0]
    const firstName = parts[0]
    const lastInitial = parts[parts.length - 1][0]
    return `${firstName} ${lastInitial}.`
}

// Get activity feed with pagination
export async function getActivityFeed(
    cursor?: string,
    limit: number = 20
): Promise<{ entries: ActivityEntry[]; nextCursor: string | null }> {
    // Fetch entries with user info, ordered by createdAt descending
    const cursorDate = cursor ? new Date(cursor) : null

    const baseQuery = db
        .select({
            id: pushupEntries.id,
            userId: pushupEntries.userId,
            userName: users.name,
            count: pushupEntries.count,
            date: pushupEntries.date,
            createdAt: pushupEntries.createdAt,
        })
        .from(pushupEntries)
        .innerJoin(users, eq(pushupEntries.userId, users.id))
        .orderBy(desc(pushupEntries.createdAt))
        .limit(limit + 1) // Fetch one extra to check if there's more

    const rawEntries = cursorDate
        ? await baseQuery.where(lt(pushupEntries.createdAt, cursorDate))
        : await baseQuery

    // Check if there are more entries
    const hasMore = rawEntries.length > limit
    const entries = hasMore ? rawEntries.slice(0, limit) : rawEntries

    // For each entry, determine the type
    const activityEntries: ActivityEntry[] = []

    for (const entry of entries) {
        const entryDate = entry.date
        const createdAtDate = getLocalDateString(entry.createdAt)

        // Determine type based on whether it's a recovery
        const isRecovery = entryDate < createdAtDate

        // Calculate target for the entry date
        const target = getDailyTarget(new Date(entryDate + 'T00:00:00'))

        // Check if this entry could have completed the challenge
        // We need to know the running total at the time of this entry
        // For simplicity, mark as completed if total >= target and this was the completing entry
        const priorEntries = await db
            .select({
                total: sql<number>`sum(${pushupEntries.count})`,
            })
            .from(pushupEntries)
            .where(
                and(
                    eq(pushupEntries.userId, entry.userId),
                    eq(pushupEntries.date, entry.date),
                    lt(pushupEntries.createdAt, entry.createdAt)
                )
            )
        const priorTotal = Number(priorEntries[0]?.total) || 0
        const newTotal = priorTotal + entry.count

        // Determine final type
        let type: ActivityType = 'regular'
        if (target > 0 && priorTotal < target && newTotal >= target) {
            type = 'completed'
        } else if (isRecovery) {
            type = 'recovery'
        }

        activityEntries.push({
            id: entry.id,
            userName: formatUserName(entry.userName),
            count: entry.count,
            date: entry.date,
            createdAt: entry.createdAt,
            type,
            target,
        })
    }

    const nextCursor = hasMore
        ? entries[entries.length - 1].createdAt.toISOString()
        : null

    return { entries: activityEntries, nextCursor }
}
