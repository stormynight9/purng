import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header'

export default function HowItWorksPage() {
    return (
        <div className='flex min-h-screen flex-col'>
            <Header />
            <main className='flex-1 p-4 sm:p-6'>
                <div className='mx-auto max-w-4xl'>
                    <div className='mb-4 flex items-center justify-between'>
                        <h1 className='font-mono text-xl font-semibold'>
                            How it works
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

                    <div className='mx-auto max-w-4xl space-y-8'>
                        <div className='rounded-lg'>
                            <div className='space-y-4 font-mono text-sm text-muted-foreground'>
                                <p>
                                    Purng is a year-long pushup challenge that
                                    gets progressively harder. Each day,
                                    you&apos;ll have a unique target number of
                                    pushups to complete.
                                </p>
                                <div>
                                    <p className='mb-2 font-semibold text-foreground'>
                                        Daily Targets:
                                    </p>
                                    <p className='mb-2 text-xs'>
                                        Each day, a random number is chosen
                                        within the range for that day:
                                    </p>
                                    <ul className='ml-2 list-inside list-disc space-y-1'>
                                        <li>
                                            Day 1: Random number between 0-1
                                            pushups
                                        </li>
                                        <li>
                                            Day 2: Random number between 0-2
                                            pushups
                                        </li>
                                        <li>
                                            Day 60: Random number between 0-60
                                            pushups
                                        </li>
                                        <li>
                                            Day 365: Random number between 0-365
                                            pushups
                                        </li>
                                    </ul>
                                </div>
                                <div>
                                    <p className='mb-2 font-semibold text-foreground'>
                                        Rest Days:
                                    </p>
                                    <p>
                                        Some days are rest days (0 pushups
                                        required). The chance of a rest day
                                        starts at 0% in January and gradually
                                        increases to 20% by December, giving you
                                        more recovery time as the challenge gets
                                        harder.
                                    </p>
                                </div>
                                <p className='text-foreground'>
                                    Everyone gets the same target for each day,
                                    so you&apos;re all in this together!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
