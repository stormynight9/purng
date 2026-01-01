import { ActivityFeed } from '@/components/activity-feed'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function LogsPage() {
    return (
        <main className='min-h-screen p-4 sm:p-6'>
            <div className='mx-auto max-w-4xl'>
                <div className='mb-4 flex items-center justify-between'>
                    <h1 className='font-mono text-xl font-semibold'>Logs</h1>
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
    )
}
