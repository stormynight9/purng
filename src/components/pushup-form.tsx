'use client'

import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useMutation, useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import { Loader2Icon } from 'lucide-react'
import { getLocalDateString } from '@/lib/utils'
import { useSession } from 'next-auth/react'

export function PushupForm() {
    const { data: session } = useSession()
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [isPending, setIsPending] = useState(false)

    const today = getLocalDateString()
    const userEmail = session?.user?.email ?? undefined
    const targetData = useQuery(api.queries.getTargetData, {
        dateString: today,
        userEmail,
    })
    const addPushupsMutation = useMutation(api.mutations.addPushups)

    const handleSubmit = async (formData: FormData) => {
        if (!userEmail) {
            setError('Not authenticated')
            return
        }

        setIsPending(true)
        setError(null)
        setSuccess(null)

        try {
            const count = Number(formData.get('count'))
            const result = await addPushupsMutation({
                count,
                submissionDate: today,
                userEmail,
            })

            if (result.success) {
                setSuccess(result.message)
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

    if (!targetData) return null

    const { target, current } = targetData
    const remaining = Math.max(0, target - current)
    const isCompleted = target > 0 && remaining === 0
    const isRestDay = target === 0

    return (
        <>
            <h1 className='text-4xl font-bold'>Today&apos;s Target</h1>
            {isRestDay ? (
                <>
                    <p className='text-6xl font-bold text-primary'>0</p>
                    <p className='text-center text-muted-foreground'>
                        Lucky you! Today is your rest day. 🎉 <br />
                        Come back tomorrow for a new challenge!
                    </p>
                </>
            ) : isCompleted ? (
                <>
                    <p className='text-6xl font-bold text-green-500'>
                        {current} / {target}
                    </p>
                    <p className='text-center text-green-500'>
                        You&apos;ve completed today&apos;s target!
                    </p>
                </>
            ) : (
                <>
                    <p className='text-6xl font-bold text-primary'>
                        {current} / {target}
                    </p>
                    <p className='text-muted-foreground'>
                        {remaining} pushup{remaining === 1 ? '' : 's'} remaining
                    </p>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            handleSubmit(new FormData(e.currentTarget))
                        }}
                        className='flex w-full max-w-xs gap-2'
                    >
                        <div className='flex-1'>
                            <Input
                                type='number'
                                name='count'
                                min='1'
                                max='1000'
                                placeholder='How many pushups?'
                                required
                                aria-describedby='count-error'
                                className={error ? 'border-destructive' : ''}
                            />
                            <div
                                id='count-error'
                                className='mt-1 min-h-5 text-sm'
                                aria-live='polite'
                            >
                                {error && (
                                    <p className='text-destructive'>{error}</p>
                                )}
                                {success && (
                                    <p className='text-green-500'>{success}</p>
                                )}
                            </div>
                        </div>
                        <Button type='submit' disabled={isPending}>
                            {isPending ? (
                                <Loader2Icon className='h-4 w-4 animate-spin' />
                            ) : (
                                'Add'
                            )}
                        </Button>
                    </form>
                </>
            )}
        </>
    )
}
