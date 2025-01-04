'use client'

import { useEffect, useState } from 'react'

export function Clock() {
    const now = new Date()
    const [time, setTime] = useState(now.toLocaleTimeString())
    const [timezone, setTimezone] = useState(
        now
            .toLocaleDateString(undefined, { timeZoneName: 'short' })
            .split(',')[1]
            .trim()
    )
    const [day, setDay] = useState(
        now.toLocaleDateString('en-US', { weekday: 'long' })
    )

    useEffect(() => {
        const updateTime = () => {
            const now = new Date()
            setTime(now.toLocaleTimeString())
            setDay(now.toLocaleDateString('en-US', { weekday: 'long' }))
            setTimezone(
                now
                    .toLocaleDateString(undefined, {
                        timeZoneName: 'short',
                    })
                    .split(',')[1]
                    .trim()
            )

            // Check if it's midnight (00:00:00)
            if (
                now.getHours() === 0 &&
                now.getMinutes() === 0 &&
                now.getSeconds() === 0
            ) {
                window.location.reload()
            }
        }

        const interval = setInterval(updateTime, 1000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div
            className='text-sm text-muted-foreground hover:cursor-help'
            title='Page will refresh at midnight to update daily target'
            suppressHydrationWarning
        >
            {day}, {time} {timezone}
        </div>
    )
}
