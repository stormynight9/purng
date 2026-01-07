'use client'

import { useEffect, useState } from 'react'
import { getStatsData } from '@/lib/actions'
import { getLocalDateString } from '@/lib/utils'
import type { StatsData } from '@/lib/types'

export function HeaderStats() {
    const [stats, setStats] = useState<StatsData | null>(null)

    useEffect(() => {
        async function fetchStats() {
            const today = new Date()
            const year = today.getFullYear()
            const dateString = getLocalDateString(today)
            const data = await getStatsData(dateString, year)
            setStats(data)
        }

        fetchStats()

        // Listen for pushup updates and refresh stats
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
                <li>
                    - This is day:{' '}
                    <span className='font-bold text-primary'>
                        <span className='invisible'>67</span>
                        <span className='font-normal text-muted-foreground'>
                            /365
                        </span>
                    </span>
                    <span className='text-muted-foreground'>
                        {' '}
                        of <span className='invisible'>2024</span>
                    </span>
                </li>
                <li>
                    - My <span className='invisible'>2024</span> pushups:{' '}
                    <span className='font-bold text-primary'>
                        <span className='invisible'>0</span>
                    </span>
                </li>
                <li>
                    - Community <span className='invisible'>2024</span> pushups:{' '}
                    <span className='font-bold text-primary'>
                        <span className='invisible'>0</span>
                    </span>
                </li>
                <li>
                    - People completed today&apos;s target:{' '}
                    <span className='font-bold text-primary'>
                        <span className='invisible'>0</span>
                    </span>
                </li>
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
