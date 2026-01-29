'use client'

import { useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useState, useMemo } from 'react'

const START_YEAR = 2025

export function LeaderboardContent() {
    const currentYear = new Date().getFullYear()
    const years = useMemo(
        () =>
            Array.from(
                { length: currentYear - START_YEAR + 1 },
                (_, i) => currentYear - i
            ),
        [currentYear]
    )
    const [selectedYear, setSelectedYear] = useState(currentYear)
    const leaderboard = useQuery(api.queries.getLeaderboard, {
        year: selectedYear,
    })

    return (
        <div className='flex min-h-screen flex-col'>
            <Header />
            <main className='flex-1 p-4 sm:p-6'>
                <div className='mx-auto max-w-4xl'>
                    <div className='mb-4 flex flex-wrap items-center justify-between gap-2'>
                        <div className='flex items-center gap-2'>
                            <h1 className='font-mono text-xl font-semibold'>
                                Leaderboard
                            </h1>
                            <Select
                                value={String(selectedYear)}
                                onValueChange={(v) =>
                                    setSelectedYear(Number(v))
                                }
                            >
                                <SelectTrigger className='h-8 w-[100px] font-mono text-sm'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((y) => (
                                        <SelectItem
                                            key={y}
                                            value={String(y)}
                                            className='font-mono'
                                        >
                                            {y}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
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

                    {leaderboard === undefined ? (
                        <p className='my-6 text-sm text-muted-foreground'>
                            Loading leaderboard...
                        </p>
                    ) : leaderboard.length === 0 ? (
                        <div className='rounded-lg border border-border/40 bg-card p-12 text-center'>
                            <p className='font-mono text-sm text-muted-foreground'>
                                No one has logged pushups in {selectedYear} yet.
                            </p>
                        </div>
                    ) : (
                        <div className='overflow-x-auto rounded-lg bg-card'>
                            <table className='w-full font-mono text-xs sm:text-sm'>
                                <thead>
                                    <tr className='border-b border-border/40'>
                                        <th className='px-3 py-2 text-left font-semibold text-muted-foreground'>
                                            Rank
                                        </th>
                                        <th className='px-3 py-2 text-left font-semibold text-muted-foreground'>
                                            User
                                        </th>
                                        <th className='px-3 py-2 text-right font-semibold text-amber-600 dark:text-amber-400'>
                                            Recovered
                                        </th>
                                        <th className='px-3 py-2 text-right font-semibold text-emerald-600 dark:text-emerald-400'>
                                            On time
                                        </th>
                                        <th className='px-3 py-2 text-right font-semibold text-primary'>
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboard.map((row) => {
                                        const rankColor =
                                            row.rank === 1
                                                ? 'text-amber-500 dark:text-amber-400 font-semibold'
                                                : row.rank === 2
                                                  ? 'text-slate-500 dark:text-slate-400 font-medium'
                                                  : row.rank === 3
                                                    ? 'text-amber-700 dark:text-amber-600 font-medium'
                                                    : 'text-muted-foreground'
                                        return (
                                            <tr
                                                key={row.userId}
                                                className='border-b border-border/40 py-2 transition-colors hover:bg-muted/30'
                                            >
                                                <td
                                                    className={`px-3 py-2 ${rankColor}`}
                                                >
                                                    {row.rank}
                                                </td>
                                                <td className='px-3 py-2'>
                                                    {row.userName}
                                                </td>
                                                <td className='px-3 py-2 text-right text-amber-600 dark:text-amber-400'>
                                                    {row.recoveredPushups.toLocaleString()}
                                                </td>
                                                <td className='px-3 py-2 text-right text-emerald-600 dark:text-emerald-400'>
                                                    {row.onTimePushups.toLocaleString()}
                                                </td>
                                                <td className='px-3 py-2 text-right font-medium text-primary'>
                                                    {row.total.toLocaleString()}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
