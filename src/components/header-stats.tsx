import {
    getAllUsersTotalPushups,
    getCompletionCount,
    getTotalPushups,
} from '@/lib/actions'
import { getDayOfYear } from '@/lib/utils.server'

export async function HeaderStats() {
    const total = await getAllUsersTotalPushups()
    const myTotal = await getTotalPushups()
    const today = new Date()
    const dayNumber = getDayOfYear(today)
    const completionCount = await getCompletionCount(
        today.toISOString().split('T')[0]
    )

    return (
        <ul className='my-6 text-sm text-muted-foreground [&>li]:mt-2'>
            <li>
                - This is day:{' '}
                <span className='font-bold text-primary'>
                    {dayNumber}
                    <span className='font-normal text-muted-foreground'>
                        /365
                    </span>
                </span>
            </li>
            <li>
                - My total pushups:{' '}
                <span className='font-bold text-primary'>
                    {myTotal.toLocaleString()}
                </span>
            </li>
            <li>
                - Total community pushups:{' '}
                <span className='font-bold text-primary'>
                    {total.toLocaleString()}
                </span>
            </li>
            <li>
                - People completed today&apos;s target:{' '}
                <span className='font-bold text-primary'>
                    {completionCount.toLocaleString()}
                </span>
            </li>
        </ul>
    )
}
