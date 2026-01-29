import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ActivityFeed } from '@/components/activity-feed'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function LogsPage() {
    const session = await auth()
    if (!session?.user) redirect('/auth/signin')
    return (
        <div className='flex min-h-screen flex-col'>
            <Header />
            <main className='flex-1 p-4 sm:p-6'>
                <div className='mx-auto max-w-4xl'>
                    <div className='mb-4 flex items-center justify-between'>
                        <h1 className='font-mono text-xl font-semibold'>
                            Logs
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

                    <ActivityFeed />
                </div>
            </main>
        </div>
    )
}
