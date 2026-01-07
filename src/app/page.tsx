import { auth } from '@/auth'
import { Clock } from '@/components/clock'
import { Header } from '@/components/header'
import { HeaderStats } from '@/components/header-stats'
import { PushupForm } from '@/components/pushup-form'
import { ActivityFeed } from '@/components/activity-feed'
import { getDailyTarget, getLocalDateString } from '@/lib/utils.server'
import { getHomePageData } from '@/lib/actions'

function getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0)
    const diff = date.getTime() - start.getTime()
    const oneDay = 1000 * 60 * 60 * 24
    return Math.floor(diff / oneDay)
}

export default async function Home() {
    const session = await auth()
    const today = new Date()
    const year = today.getFullYear()
    const dateString = getLocalDateString(today)
    const target = getDailyTarget(today)

    // Fetch all data in parallel on the server
    const homeData = await getHomePageData(dateString, year)

    // Build stats data for components
    const statsData = {
        dayNumber: getDayOfYear(today),
        year,
        myTotal: homeData.myTotal,
        communityTotal: homeData.communityTotal,
        completionCount: homeData.completionCount,
        missedPushups: homeData.missedPushups,
    }

    if (!session?.user) {
        return (
            <div className='flex flex-col'>
                <div className='p-4 sm:p-6'>
                    <Clock />
                    <HeaderStats initialStats={statsData} />
                </div>
                <main className='flex flex-1 flex-col items-center justify-center gap-8 p-4 sm:p-6'>
                    <div className='mx-auto flex max-w-4xl flex-col gap-8 text-center'>
                        <div className='flex flex-col gap-4'>
                            <h1 className='font-mono text-4xl font-semibold'>
                                Today&apos;s Target
                            </h1>
                            <p className='font-mono text-6xl font-bold text-primary'>
                                {target}
                            </p>
                        </div>

                        <div className='mx-auto flex max-w-2xl flex-col gap-6 text-left text-muted-foreground'>
                            <div>
                                <h2 className='mb-3 font-mono text-xl font-semibold text-foreground'>
                                    How It Works
                                </h2>
                                <div className='space-y-4 font-mono text-sm'>
                                    <p>
                                        Purng is a year-long pushup challenge
                                        that gets progressively harder. Each
                                        day, you&apos;ll have a unique target
                                        number of pushups to complete.
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
                                                Day 60: Random number between
                                                0-60 pushups
                                            </li>
                                            <li>
                                                Day 365: Random number between
                                                0-365 pushups
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
                                            starts at 0% in January and
                                            gradually increases to 20% by
                                            December, giving you more recovery
                                            time as the challenge gets harder.
                                        </p>
                                    </div>
                                    <p className='text-foreground'>
                                        Everyone gets the same target for each
                                        day, so you&apos;re all in this
                                        together!
                                    </p>
                                </div>
                            </div>

                            <a
                                href='/auth/signin'
                                className='mt-2 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 font-mono text-sm font-medium text-primary-foreground hover:bg-primary/90'
                            >
                                Sign in to start tracking
                            </a>
                        </div>
                    </div>
                </main>
                <div className='mt-4 w-full max-w-2xl px-4 text-left md:mx-auto md:px-0'>
                    <h2 className='mb-4 font-mono text-xl font-semibold text-foreground'>
                        Recent Activity
                    </h2>
                    <ActivityFeed
                        initialEntries={homeData.initialFeed.entries}
                        initialCursor={homeData.initialFeed.nextCursor}
                    />
                </div>
            </div>
        )
    }

    return (
        <div className='flex min-h-screen flex-col'>
            <Header initialStats={statsData} />
            <main className='flex flex-1 flex-col items-center justify-center gap-6 px-4 py-8 sm:px-6'>
                <div className='mx-auto flex w-full max-w-4xl flex-col items-center gap-6'>
                    <PushupForm
                        initialTarget={homeData.targetData.target}
                        initialCurrent={homeData.targetData.current}
                    />
                </div>
            </main>
        </div>
    )
}
