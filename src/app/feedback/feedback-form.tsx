'use client'

import { useActionState, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header'
import Link from 'next/link'
import {
    submitFeedback,
    type SubmitFeedbackState,
} from '@/app/feedback/actions'
import { SubmitButton } from '@/components/submit-button'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { BuyMeACoffee } from '@/components/buy-me-a-coffee'
import type { FeedbackType } from '@/app/feedback/actions'

interface FeedbackFormProps {
    userEmail: string | null
    userName: string | null
}

export function FeedbackForm({ userEmail, userName }: FeedbackFormProps) {
    const [state, formAction] = useActionState<
        SubmitFeedbackState | null,
        FormData
    >(submitFeedback, null)
    const [type, setType] = useState<FeedbackType>('feedback')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (state !== null) setIsSubmitting(false)
    }, [state])

    return (
        <div className='flex min-h-screen flex-col'>
            <Header />
            <main className='mx-auto flex w-full max-w-2xl flex-1 flex-col justify-between p-4 sm:p-6'>
                <div>
                    <div className='mb-4 flex items-center justify-between'>
                        <h1 className='font-mono text-xl font-semibold'>
                            Feedback & bug reports
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

                    {(userEmail || userName) && (
                        <p className='mb-4 font-mono text-sm text-muted-foreground'>
                            Sending as{' '}
                            {[userName, userEmail].filter(Boolean).join(' ')}
                        </p>
                    )}

                    <form
                        action={formAction}
                        onSubmit={() => setIsSubmitting(true)}
                        className='flex flex-col gap-4 font-mono text-sm'
                    >
                        <div>
                            <Label
                                htmlFor='type'
                                className='mb-1 block font-medium text-foreground'
                            >
                                Type
                            </Label>
                            <Select
                                value={type}
                                onValueChange={(v) =>
                                    setType(v as FeedbackType)
                                }
                            >
                                <SelectTrigger id='type' className='font-mono'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem
                                        value='feedback'
                                        className='font-mono'
                                    >
                                        Feedback
                                    </SelectItem>
                                    <SelectItem
                                        value='bug'
                                        className='font-mono'
                                    >
                                        Bug report
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <input type='hidden' name='type' value={type} />
                        </div>
                        <div>
                            <Label
                                htmlFor='message'
                                className='mb-1 block font-medium text-foreground'
                            >
                                Message
                            </Label>
                            <Textarea
                                id='message'
                                name='message'
                                required
                                rows={5}
                                placeholder='Describe your feedback or the bug...'
                                className='resize-none font-mono'
                            />
                        </div>
                        <div
                            className='min-h-5 font-mono text-sm'
                            aria-live='polite'
                        >
                            {state?.success === false && (
                                <p className='text-destructive'>
                                    {state.error}
                                </p>
                            )}
                            {state?.success === true && (
                                <p className='text-green-500'>
                                    Thanks! Your message was sent.
                                </p>
                            )}
                        </div>
                        <SubmitButton disabled={isSubmitting}>
                            Send
                        </SubmitButton>
                    </form>
                </div>
                <BuyMeACoffee className='mt-8' />
            </main>
        </div>
    )
}
