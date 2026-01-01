'use client'

import { useState } from 'react'
import type { YearDay } from '@/lib/types'
import { RecoveryModal } from './recovery-modal'

const STATUS_COLORS = {
    future: 'bg-muted/30 text-muted-foreground/50 border-muted/50',
    today: 'bg-blue-500 text-white border-blue-400  ring-blue-400 ring-offset-2 ring-offset-background',
    completed: 'bg-green-500/80 text-white border-green-600',
    missed: 'bg-orange-500/80 text-white border-orange-600 cursor-pointer hover:bg-orange-600',
    rest: 'bg-muted/50 text-muted-foreground border-muted',
}

interface YearGridProps {
    days: YearDay[]
    onRecoverySuccess?: () => void
}

function formatDate(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function YearGrid({ days, onRecoverySuccess }: YearGridProps) {
    const [selectedDay, setSelectedDay] = useState<YearDay | null>(null)
    const [modalOpen, setModalOpen] = useState(false)

    const handleDayClick = (day: YearDay) => {
        if (day.status === 'missed') {
            setSelectedDay(day)
            setModalOpen(true)
        }
    }

    const handleRecoverySuccess = () => {
        setModalOpen(false)
        setSelectedDay(null)
        onRecoverySuccess?.()
    }

    return (
        <div className='w-full'>
            {/* Legend */}
            <div className='mb-6 flex flex-wrap items-center justify-center gap-4 text-sm'>
                <div className='flex items-center gap-2'>
                    <div className='h-4 w-4 rounded bg-blue-500' />
                    <span>Today</span>
                </div>
                <div className='flex items-center gap-2'>
                    <div className='h-4 w-4 rounded bg-green-500/80' />
                    <span>Completed</span>
                </div>
                <div className='flex items-center gap-2'>
                    <div className='h-4 w-4 rounded bg-orange-500/80' />
                    <span>Missed (click to recover)</span>
                </div>
                <div className='flex items-center gap-2'>
                    <div className='h-4 w-4 rounded bg-muted/50' />
                    <span>Rest Day</span>
                </div>
            </div>

            {/* Continuous Grid */}
            <div className='lg:grid-cols-14 xl:grid-cols-18 grid grid-cols-5 gap-2 sm:grid-cols-7 md:grid-cols-10'>
                {days.map((day) => (
                    <div
                        key={day.date}
                        className={`flex min-h-[70px] flex-col items-center justify-center rounded-lg border p-2 transition-transform ${STATUS_COLORS[day.status]} ${day.status !== 'missed' ? 'cursor-default' : ''}`}
                        title={`${day.date}${day.status === 'rest' ? ' - Rest Day' : ''}${day.status === 'missed' ? ' - Click to recover' : ''}`}
                        onClick={() => handleDayClick(day)}
                    >
                        <span className='text-xs font-medium opacity-80'>
                            {formatDate(day.date)}
                        </span>
                        <span className='text-lg font-bold'>
                            {day.status === 'future'
                                ? '?'
                                : day.status === 'rest'
                                  ? '-'
                                  : day.target}
                        </span>
                        {day.status !== 'future' &&
                            day.status !== 'rest' &&
                            day.completed > 0 && (
                                <span className='text-[10px] opacity-70'>
                                    {day.completed}/{day.target}
                                </span>
                            )}
                    </div>
                ))}
            </div>

            {/* Recovery Modal */}
            <RecoveryModal
                day={selectedDay}
                open={modalOpen}
                onOpenChange={setModalOpen}
                onSuccess={handleRecoverySuccess}
            />
        </div>
    )
}
