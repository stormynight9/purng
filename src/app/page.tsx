import { auth } from '@/auth'
import { Clock } from '@/components/clock'
import { Header } from '@/components/header'
import { HeaderStats } from '@/components/header-stats'
import { PushupForm } from '@/components/pushup-form'
import { getDailyTarget } from '@/lib/utils.server'

export default async function Home() {
    const session = await auth()
    const today = new Date()
    const target = getDailyTarget(today)

    if (!session?.user) {
        return (
            <div className='flex min-h-screen flex-col'>
                <div className='p-4'>
                    <Clock />
                    <HeaderStats />
                </div>
                <main className='flex flex-1 flex-col items-center justify-center gap-8 px-5'>
                    <div className='flex max-w-md flex-col gap-6 text-center'>
                        <h1 className='text-4xl font-bold'>
                            Today&apos;s Target
                        </h1>
                        <p className='text-6xl font-bold text-primary'>
                            {target}
                        </p>

                        <div className='flex flex-col gap-4 text-left text-muted-foreground'>
                            <h2 className='text-xl font-semibold text-foreground'>
                                What is Purng?
                            </h2>
                            <ul className='list-inside list-disc space-y-2 text-sm'>
                                <li>
                                    A daily pushup challenge that increases
                                    throughout the year
                                </li>
                                <li>
                                    Every day has a unique target that&apos;s
                                    the same for all users
                                </li>
                                <li>
                                    Day 1: Random number between 0-1 pushups
                                </li>
                                <li>
                                    Day 2: Random number between 0-2 pushups
                                </li>
                                <li>
                                    Day 60: Random number between 0-60 pushups
                                </li>
                                <li>
                                    And so on, making it progressively
                                    challenging
                                </li>
                            </ul>

                            <a
                                href='/auth/signin'
                                className='mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90'
                            >
                                Sign in to start tracking
                            </a>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className='flex min-h-screen flex-col'>
            <Header />
            <main className='flex flex-1 flex-col items-center justify-center gap-6 px-5'>
                <div className='flex flex-col items-center gap-2'>
                    <PushupForm />
                </div>
            </main>
        </div>
    )
}
