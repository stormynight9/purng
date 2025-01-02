import { getCompletionCount } from '@/lib/actions'
import { getDailyTarget } from '@/lib/utils.server'

export async function CompletionCount() {
    const today = new Date().toISOString().split('T')[0]
    const target = getDailyTarget(new Date(today))

    if (target === 0) {
        return (
            <p className='py-4 text-center text-sm text-muted-foreground'>
                It&apos;s a rest day! Everyone has completed today&apos;s target
                🎉
            </p>
        )
    }

    const count = Number(await getCompletionCount(today))

    return (
        <p className='py-4 text-center text-sm text-muted-foreground'>
            {count} {count === 1 ? 'person has' : 'people have'} completed
            today&apos;s target
        </p>
    )
}
