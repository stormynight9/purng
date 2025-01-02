import { getTotalPushups } from '@/lib/actions'

export async function TotalPushups() {
    const total = await getTotalPushups()

    return (
        <div className='flex flex-col items-center gap-1'>
            <p className='text-sm font-medium text-muted-foreground'>
                Total Pushups Completed
            </p>
            <p className='text-2xl font-bold'>{total}</p>
        </div>
    )
}
