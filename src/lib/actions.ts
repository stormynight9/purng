'use server'

import { auth } from '@/auth'
import { db } from '@/db/db'
import { pushupEntries } from '@/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { pushupSchema } from './schemas'
import { getDailyTarget } from './utils.server'
import type { ActionResponse } from './types'
import { z } from 'zod'

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
        const submissionTime = formData.get('submissionTime') as string

        // Get current progress and target
        const { target, current } = await getTargetData(
            new Date(submissionTime).toISOString().split('T')[0]
        )
        const remaining = Math.max(0, target - current)

        const validatedFields = pushupSchema
            .extend({
                count: z
                    .number()
                    .int()
                    .min(1, 'You can&apos;t log less than 1 pushup')
                    .max(
                        remaining,
                        `You can't log more than the remaining ${remaining} pushup${remaining === 1 ? '' : 's'}`
                    ),
            })
            .safeParse({
                count,
                submissionTime,
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
            date: new Date(validatedFields.data.submissionTime)
                .toISOString()
                .split('T')[0],
        })

        const newTotal = await getTodaysPushups(submissionTime as string)

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

export async function getTargetData(dateString: string) {
    const date = new Date(dateString)
    const target = getDailyTarget(date)
    const current = await getTodaysPushups(dateString)
    return { target, current }
}

export async function getTodaysPushups(dateString: string) {
    const session = await auth()
    if (!session?.user?.id) return 0

    const today = new Date(dateString)

    const result = await db
        .select({
            total: sql<number>`sum(${pushupEntries.count})`,
        })
        .from(pushupEntries)
        .where(
            and(
                eq(pushupEntries.userId, session.user.id),
                eq(pushupEntries.date, today.toISOString().split('T')[0])
            )
        )

    return result[0]?.total || 0
}

export async function getCompletionCount(dateString: string) {
    const date = new Date(dateString)
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
                WHERE ${pushupEntries.date} = ${date.toISOString().split('T')[0]}
                GROUP BY ${pushupEntries.userId}
                HAVING sum(${pushupEntries.count}) >= ${target}
            ) as user_totals`
        )

    return result[0]?.count ?? 0
}
