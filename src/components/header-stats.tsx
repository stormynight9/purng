'use client'

import { useEffect } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { getLocalDateString } from '@/lib/utils'
import { useSession } from 'next-auth/react'

export function HeaderStats() {
    const { data: session } = useSession()
    const today = new Date()
    const year = today.getFullYear()
    const dateString = getLocalDateString(today)
    const userEmail = session?.user?.email ?? undefined

    const stats = useQuery(api.queries.getStatsData, {
        dateString,
        year,
        userEmail,
    })

    // Listen for pushup updates - Convex will automatically refetch
    useEffect(() => {
        const handleUpdate = () => {
            // Convex queries are reactive, so they'll automatically update
        }

        window.addEventListener('pushups-updated', handleUpdate)
        return () => {
            window.removeEventListener('pushups-updated', handleUpdate)
        }
    }, [])

    if (!stats) {
        return (
            <ul className='my-6 text-sm text-muted-foreground [&>li>span:first-child]:inline-block [&>li]:relative [&>li]:mt-2 [&>li]:pl-4'>
                <li>
                    <span className='absolute left-0'>-</span>
                    <span>This is day: </span>
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
                    <span className='absolute left-0'>-</span>
                    <span>
                        My <span className='invisible'>2024</span> pushups:{' '}
                    </span>
                    <span className='font-bold text-primary'>
                        <span className='invisible'>0</span>
                    </span>
                </li>
                <li>
                    <span className='absolute left-0'>-</span>
                    <span>
                        Community <span className='invisible'>2024</span>{' '}
                        pushups:{' '}
                    </span>
                    <span className='font-bold text-primary'>
                        <span className='invisible'>0</span>
                    </span>
                </li>
                <li>
                    <span className='absolute left-0'>-</span>
                    <span>People completed today&apos;s target: </span>
                    <span className='font-bold text-primary'>
                        <span className='invisible'>Everyone</span>
                    </span>
                </li>
            </ul>
        )
    }

    return (
        <ul className='my-6 text-sm text-muted-foreground [&>li]:relative [&>li]:mt-2 [&>li]:pl-4'>
            <li>
                <span className='absolute left-0'>-</span>
                <span>This is day: </span>
                <span className='font-bold text-primary'>
                    {stats.dayNumber}
                    <span className='font-normal text-muted-foreground'>
                        /365
                    </span>
                </span>
                <span className='text-muted-foreground'> of {stats.year}</span>
            </li>
            <li>
                <span className='absolute left-0'>-</span>
                <span>My {stats.year} pushups: </span>
                <span className='font-bold text-primary'>
                    {stats.myTotal.toLocaleString()}
                </span>
            </li>
            <li>
                <span className='absolute left-0'>-</span>
                <span>Community {stats.year} pushups: </span>
                <span className='font-bold text-primary'>
                    {stats.communityTotal.toLocaleString()}
                </span>
            </li>
            <li>
                <span className='absolute left-0'>-</span>
                <span>People completed today&apos;s target: </span>
                <span className='font-bold text-primary'>
                    {stats.target === 0
                        ? 'Everyone'
                        : stats.completionCount.toLocaleString()}
                </span>
            </li>
            {stats.missedPushups > 0 && (
                <li>
                    <span className='absolute left-0'>-</span>
                    <span>Missed pushups to recover: </span>
                    <span className='font-bold text-orange-500'>
                        {stats.missedPushups.toLocaleString()}
                    </span>
                </li>
            )}
        </ul>
    )
}
