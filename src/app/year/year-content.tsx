'use client'

import { useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { YearGrid } from '@/components/year-grid'
import { Header } from '@/components/header'
import { getLocalDateString } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface YearContentProps {
    userEmail: string | undefined
}

export function YearContent({ userEmail }: YearContentProps) {
    const today = new Date()
    const dateString = getLocalDateString(today)
    const year = today.getFullYear()

    const yearData = useQuery(api.queries.getYearData, {
        todayDateString: dateString,
        userEmail,
    })

    const refreshData = () => {
        // Convex queries are reactive, so they'll automatically update
    }

    if (!yearData) {
        return (
            <div className='flex min-h-screen flex-col'>
                <Header />
                <main className='flex flex-1 items-center justify-center'>
                    <p className='font-mono text-muted-foreground'>
                        Loading...
                    </p>
                </main>
            </div>
        )
    }

    // Calculate stats
    const completedDays = yearData.filter(
        (d) => d.status === 'completed'
    ).length
    const missedDays = yearData.filter((d) => d.status === 'missed').length
    const restDays = yearData.filter((d) => d.status === 'rest').length
    const totalPastDays = completedDays + missedDays + restDays

    // Calculate pushup totals (excluding future and rest days)
    const pastNonRestDays = yearData.filter(
        (d) => d.status !== 'future' && d.status !== 'rest'
    )
    const totalPushupsCompleted = pastNonRestDays.reduce(
        (sum, d) => sum + Number(d.completed),
        0
    )
    const totalPushupsTarget = pastNonRestDays.reduce(
        (sum, d) => sum + Number(d.target),
        0
    )

    return (
        <div className='flex min-h-screen flex-col'>
            <Header />
            <main className='flex-1 p-4 sm:p-6'>
                <div className='mx-auto max-w-4xl'>
                    <div className='mb-4 flex items-center justify-between'>
                        <h1 className='font-mono text-xl font-semibold'>
                            {year} Progress
                        </h1>
                        <Link href='/'>
                            <Button
                                variant='ghost'
                                size='sm'
                                className='font-mono text-xs'
                            >
                                ← Back
                            </Button>
                        </Link>
                    </div>

                    {/* Pushup totals */}
                    <p className='mb-4 text-center font-mono text-2xl'>
                        <span className='font-bold text-primary'>
                            {totalPushupsCompleted.toLocaleString()}
                        </span>
                        <span className='text-muted-foreground'>
                            {' '}
                            / {totalPushupsTarget.toLocaleString()} pushups
                        </span>
                    </p>

                    <div className='mb-6 flex flex-wrap justify-center gap-4 font-mono text-sm text-muted-foreground'>
                        <span>
                            Completed Days:{' '}
                            <span className='font-bold text-green-500'>
                                {completedDays}
                            </span>
                        </span>
                        <span>
                            Missed Days:{' '}
                            <span className='font-bold text-orange-500'>
                                {missedDays}
                            </span>
                        </span>
                        <span>
                            Rest Days:{' '}
                            <span className='font-bold text-muted-foreground'>
                                {restDays}
                            </span>
                        </span>
                        {totalPastDays > 0 && (
                            <span>
                                Completion Rate:{' '}
                                <span className='font-bold text-primary'>
                                    {Math.round(
                                        (completedDays /
                                            (completedDays + missedDays)) *
                                            100
                                    ) || 0}
                                    %
                                </span>
                            </span>
                        )}
                    </div>
                    <YearGrid days={yearData} onRecoverySuccess={refreshData} />
                </div>
            </main>
        </div>
    )
}
