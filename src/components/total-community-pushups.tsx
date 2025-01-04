import { getAllUsersTotalPushups } from '@/lib/actions'

export async function TotalCommunityPushups() {
    const total = await getAllUsersTotalPushups()

    return (
        <div className='text-sm text-muted-foreground'>
            Total community pushups: {total.toLocaleString()}
        </div>
    )
}
