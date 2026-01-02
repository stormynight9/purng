'use client'

import { useEffect, useState } from 'react'
import {
    getAllUsersTotalPushups,
    getCompletionCount,
    getTotalPushups,
    getTotalMissedPushups,
} from '@/lib/actions'
import { getLocalDateString } from '@/lib/utils'

interface StatsData {
    dayNumber: number
    year: number
    myTotal: number
    communityTotal: number
    completionCount: number
    missedPushups: number
}

function getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0)
    const diff = date.getTime() - start.getTime()
    const oneDay = 1000 * 60 * 60 * 24
    return Math.floor(diff / oneDay)
}

export function HeaderStats() {
    const [stats, setStats] = useState<StatsData | null>(null)

    useEffect(() => {
        async function fetchStats() {
            const today = new Date()
            const year = today.getFullYear()
            const dateString = getLocalDateString(today)
            const dayNumber = getDayOfYear(today)

            const [myTotal, communityTotal, completionCount, missedPushups] =
                await Promise.all([
                    getTotalPushups(year),
                    getAllUsersTotalPushups(year),
                    getCompletionCount(dateString),
                    getTotalMissedPushups(dateString),
                ])

            setStats({
                dayNumber,
                year,
                myTotal,
                communityTotal,
                completionCount,
                missedPushups,
            })
        }

        fetchStats()

        // Listen for pushup updates
        const handleUpdate = () => {
            fetchStats()
        }
        window.addEventListener('pushups-updated', handleUpdate)

        return () => {
            window.removeEventListener('pushups-updated', handleUpdate)
        }
    }, [])

    if (!stats) {
        return (
            <ul className='my-6 text-sm text-muted-foreground [&>li]:mt-2'>
                <li>Loading stats...</li>
            </ul>
        )
    }

    return (
        <ul className='my-6 text-sm text-muted-foreground [&>li]:mt-2'>
            <li>
                - This is day:{' '}
                <span className='font-bold text-primary'>
                    {stats.dayNumber}
                    <span className='font-normal text-muted-foreground'>
                        /365
                    </span>
                </span>
                <span className='text-muted-foreground'> of {stats.year}</span>
            </li>
            <li>
                - My {stats.year} pushups:{' '}
                <span className='font-bold text-primary'>
                    {stats.myTotal.toLocaleString()}
                </span>
            </li>
            <li>
                - Community {stats.year} pushups:{' '}
                <span className='font-bold text-primary'>
                    {stats.communityTotal.toLocaleString()}
                </span>
            </li>
            <li>
                - People completed today&apos;s target:{' '}
                <span className='font-bold text-primary'>
                    {stats.completionCount.toLocaleString()}
                </span>
            </li>
            {stats.missedPushups > 0 && (
                <li>
                    - Missed pushups to recover:{' '}
                    <span className='font-bold text-orange-500'>
                        {stats.missedPushups.toLocaleString()}
                    </span>
                </li>
            )}
        </ul>
    )
}
