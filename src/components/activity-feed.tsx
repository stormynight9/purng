'use client'

import { getActivityFeed } from '@/lib/actions'
import type { ActivityEntry } from '@/lib/types'
import { useCallback, useEffect, useRef, useState } from 'react'

// Format timestamp for logs (e.g., "Jan 1, 02:45:32")
function formatLogTimestamp(date: Date): string {
    return (
        date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        }) +
        ', ' +
        date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        })
    )
}

// Format date for display (e.g., "Jan 5")
function formatDate(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    })
}

// Get type indicator color
function getTypeColor(type: ActivityEntry['type']): string {
    switch (type) {
        case 'completed':
            return 'bg-emerald-500'
        case 'recovery':
            return 'bg-amber-500'
        case 'regular':
        default:
            return 'bg-blue-500'
    }
}

// Get type label
function getTypeLabel(type: ActivityEntry['type']): string {
    switch (type) {
        case 'completed':
            return 'DONE'
        case 'recovery':
            return 'RECV'
        case 'regular':
        default:
            return 'LOG'
    }
}

// Get type label color class
function getTypeLabelColor(type: ActivityEntry['type']): string {
    switch (type) {
        case 'completed':
            return 'text-emerald-400'
        case 'recovery':
            return 'text-amber-400'
        case 'regular':
        default:
            return 'text-blue-400'
    }
}

interface LogRowProps {
    entry: ActivityEntry
}

function LogRow({ entry }: LogRowProps) {
    const dotColor = getTypeColor(entry.type)
    const labelColor = getTypeLabelColor(entry.type)
    const label = getTypeLabel(entry.type)

    // Build the message parts
    const getMessage = () => {
        switch (entry.type) {
            case 'completed':
                return (
                    <>
                        <span className='text-foreground'>
                            {entry.userName}
                        </span>
                        <span className='text-muted-foreground'>
                            {' '}
                            completed challenge{' '}
                        </span>
                        <span className='text-emerald-400'>+{entry.count}</span>
                    </>
                )
            case 'recovery':
                return (
                    <>
                        <span className='text-foreground'>
                            {entry.userName}
                        </span>
                        <span className='text-muted-foreground'>
                            {' '}
                            recovered{' '}
                        </span>
                        <span className='text-amber-400'>+{entry.count}</span>
                        <span className='text-muted-foreground'> for </span>
                        <span className='text-muted-foreground/70'>
                            {formatDate(entry.date)}
                        </span>
                    </>
                )
            case 'regular':
            default:
                return (
                    <>
                        <span className='text-foreground'>
                            {entry.userName}
                        </span>
                        <span className='text-muted-foreground'> logged </span>
                        <span className='text-blue-400'>+{entry.count}</span>
                    </>
                )
        }
    }

    return (
        <div className='group flex items-center gap-3 border-b border-border/40 px-3 py-2 font-mono text-sm transition-colors hover:bg-muted/30'>
            {/* Timestamp */}
            <span className='hidden w-[120px] shrink-0 text-xs text-muted-foreground/60 sm:block'>
                {formatLogTimestamp(new Date(entry.createdAt))}
            </span>

            {/* Status dot */}
            <span className={`h-2 w-2 shrink-0 rounded-full ${dotColor}`} />

            {/* Message */}
            <span className='truncate'>{getMessage()}</span>
        </div>
    )
}

export function ActivityFeed() {
    const [entries, setEntries] = useState<ActivityEntry[]>([])
    const [cursor, setCursor] = useState<string | null>(null)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const observerRef = useRef<HTMLDivElement>(null)

    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return

        setLoading(true)
        try {
            const result = await getActivityFeed(cursor ?? undefined)
            setEntries((prev) => {
                // Create a Set of existing entry IDs for fast lookup
                const existingIds = new Set(prev.map((e) => e.id))
                // Filter out any duplicates from new entries
                const newEntries = result.entries.filter(
                    (e) => !existingIds.has(e.id)
                )
                return [...prev, ...newEntries]
            })
            setCursor(result.nextCursor)
            setHasMore(result.nextCursor !== null)
        } catch (error) {
            console.error('Failed to load activity feed:', error)
        } finally {
            setLoading(false)
            setInitialLoading(false)
        }
    }, [cursor, hasMore, loading])

    // Initial load
    useEffect(() => {
        loadMore()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadMore()
                }
            },
            { threshold: 0.1 }
        )

        const currentRef = observerRef.current
        if (currentRef) {
            observer.observe(currentRef)
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef)
            }
        }
    }, [hasMore, loading, loadMore])

    if (initialLoading) {
        return (
            <div className='overflow-hidden rounded-lg border border-border/40 bg-card'>
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className='h-10 animate-pulse border-b border-border/40 bg-muted/20'
                    />
                ))}
            </div>
        )
    }

    if (entries.length === 0) {
        return (
            <div className='rounded-lg border border-border/40 bg-card p-12 text-center'>
                <p className='font-mono text-sm text-muted-foreground'>
                    No activity yet. Be the first to log some pushups!
                </p>
            </div>
        )
    }

    return (
        <div className='overflow-hidden rounded-lg border-border/40 bg-card'>
            {/* Log rows */}
            <div className='overflow-y-auto'>
                {entries
                    .filter(
                        (entry, index, self) =>
                            index === self.findIndex((e) => e.id === entry.id)
                    )
                    .map((entry) => (
                        <LogRow key={entry.id} entry={entry} />
                    ))}

                {/* Infinite scroll trigger */}
                <div ref={observerRef} className='h-1' />

                {loading && !initialLoading && (
                    <div className='flex items-center justify-center gap-2 py-3 font-mono text-xs text-muted-foreground'>
                        <div className='h-3 w-3 animate-spin rounded-full border border-current border-t-transparent' />
                        <span>Loading more...</span>
                    </div>
                )}

                {!hasMore && entries.length > 0 && (
                    <div className='py-3 text-center font-mono text-xs text-muted-foreground/50'>
                        — End of logs —
                    </div>
                )}
            </div>
        </div>
    )
}
