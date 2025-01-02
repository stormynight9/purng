'use client'

import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useActionState } from 'react'
import type { ActionResponse } from '@/lib/types'
import { addPushups, getTargetData } from '@/lib/actions'

const initialState: ActionResponse = {
    success: false,
    message: '',
}

export function PushupForm() {
    const [state, action, isPending] = useActionState(addPushups, initialState)
    const [data, setData] = useState<{
        target: number
        current: number
    } | null>(null)

    const today = new Date().toISOString().split('T')[0]

    useEffect(() => {
        getTargetData(today).then(setData)
    }, [today])

    useEffect(() => {
        if (state.total !== undefined) {
            const total = state.total
            setData((prev) =>
                prev
                    ? {
                          ...prev,
                          current: total,
                      }
                    : null
            )
        }
    }, [state])

    if (!data) return null

    const { target, current } = data
    const remaining = Math.max(0, target - current)

    const handleSubmit = (formData: FormData) => {
        const submissionTime = new Date().toISOString()
        formData.append('submissionTime', submissionTime)
        action(formData)
    }

    return (
        <>
            <h1 className='text-4xl font-bold'>Today&apos;s Target</h1>
            {target === 0 ? (
                <>
                    <p className='text-6xl font-bold text-primary'>0</p>
                    <p className='text-center text-muted-foreground'>
                        Lucky you! Today is your rest day. <br />
                        Come back tomorrow for a new challenge!
                    </p>
                </>
            ) : (
                <>
                    <p className='text-6xl font-bold text-primary'>
                        {state.total || current} / {target}
                    </p>
                    <p className='text-muted-foreground'>
                        {remaining} pushup{remaining === 1 ? '' : 's'} remaining
                    </p>
                    <form
                        action={handleSubmit}
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
                                className={
                                    state?.errors?.count
                                        ? 'border-destructive'
                                        : ''
                                }
                            />
                            {state?.errors?.count && (
                                <p
                                    id='count-error'
                                    className='mt-1 text-sm text-destructive'
                                >
                                    {state.errors.count[0]}
                                </p>
                            )}
                        </div>
                        <Button type='submit' disabled={isPending}>
                            {isPending ? 'Adding...' : 'Add'}
                        </Button>
                    </form>
                    {state?.message && state.success && (
                        <p className='text-sm text-green-500'>
                            {state.message}
                        </p>
                    )}
                </>
            )}
        </>
    )
}
