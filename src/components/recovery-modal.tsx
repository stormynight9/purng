'use client'

import * as React from 'react'
import { useEffect, useState, useRef } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer'
import type { YearDay } from '@/lib/types'
import { Loader2Icon } from 'lucide-react'
import { useSession } from 'next-auth/react'

function useMediaQuery(query: string) {
    const [matches, setMatches] = useState(false)

    useEffect(() => {
        const media = window.matchMedia(query)
        setMatches(media.matches)

        const listener = (event: MediaQueryListEvent) => {
            setMatches(event.matches)
        }

        media.addEventListener('change', listener)
        return () => media.removeEventListener('change', listener)
    }, [query])

    return matches
}

interface RecoveryModalProps {
    day: YearDay | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function RecoveryModal({
    day,
    open,
    onOpenChange,
    onSuccess,
}: RecoveryModalProps) {
    const { data: session } = useSession()
    const formRef = useRef<HTMLFormElement>(null)
    const isDesktop = useMediaQuery('(min-width: 768px)')
    const recoverPushupsMutation = useMutation(api.mutations.recoverPushups)
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const hasCalledSuccess = useRef(false)
    const formKey = day?.date || 'default'

    const missed = day ? day.target - day.completed : 0
    const userEmail = session?.user?.email

    // Reset the success flag when modal opens with a new day
    useEffect(() => {
        if (open) {
            hasCalledSuccess.current = false
            setError(null)
            setSuccess(null)
        }
    }, [open, day?.date])

    // Reset state when day changes or modal closes
    useEffect(() => {
        if (!open || !day) {
            hasCalledSuccess.current = false
        }
    }, [open, day])

    const handleSubmit = async (formData: FormData) => {
        if (!day || !userEmail) return

        setIsPending(true)
        setError(null)
        setSuccess(null)

        try {
            const count = Number(formData.get('count'))
            const result = await recoverPushupsMutation({
                count,
                targetDate: day.date,
                userEmail,
            })

            if (result.success && !hasCalledSuccess.current) {
                hasCalledSuccess.current = true
                setSuccess(result.message)
                formRef.current?.reset()
                onSuccess()
                window.dispatchEvent(new CustomEvent('pushups-updated'))
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'An unexpected error occurred'
            )
        } finally {
            setIsPending(false)
        }
    }

    if (!day) return null

    const formattedDate = new Date(day.date + 'T00:00:00').toLocaleDateString(
        'en-US',
        {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        }
    )

    const content = (
        <>
            <div className='rounded-lg bg-muted/50 p-3'>
                <div className='flex justify-between text-sm'>
                    <span>Target:</span>
                    <span className='font-bold'>{day.target}</span>
                </div>
                <div className='flex justify-between text-sm'>
                    <span>Completed:</span>
                    <span className='font-bold text-green-500'>
                        {day.completed}
                    </span>
                </div>
                <div className='flex justify-between text-sm'>
                    <span>Remaining:</span>
                    <span className='font-bold text-orange-500'>{missed}</span>
                </div>
            </div>

            <form
                ref={formRef}
                key={formKey}
                action={handleSubmit}
                className='flex gap-2'
            >
                <div className='flex-1'>
                    <Input
                        type='number'
                        name='count'
                        min='1'
                        max={missed}
                        placeholder={`Recover up to ${missed}`}
                        required
                        aria-describedby='recovery-error'
                        className={error ? 'border-destructive' : ''}
                    />
                    {error && (
                        <p
                            id='recovery-error'
                            className='mt-1 text-sm text-destructive'
                        >
                            {error}
                        </p>
                    )}
                    {success && (
                        <p className='mt-1 text-sm text-green-500'>{success}</p>
                    )}
                </div>
                <Button type='submit' disabled={isPending}>
                    {isPending ? (
                        <Loader2Icon className='h-4 w-4 animate-spin' />
                    ) : (
                        'Recover'
                    )}
                </Button>
            </form>
        </>
    )

    if (isDesktop) {
        return (
            <Dialog key={formKey} open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Recover Pushups</DialogTitle>
                        <DialogDescription>{formattedDate}</DialogDescription>
                    </DialogHeader>
                    <div className='grid gap-4'>{content}</div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Drawer key={formKey} open={open} onOpenChange={onOpenChange}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Recover Pushups</DrawerTitle>
                    <DrawerDescription>{formattedDate}</DrawerDescription>
                </DrawerHeader>
                <div className='grid gap-4 px-4 pb-4'>{content}</div>
            </DrawerContent>
        </Drawer>
    )
}
