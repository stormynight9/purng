import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { LeaderboardContent } from './leaderboard-content'

export default async function LeaderboardPage() {
    const session = await auth()
    if (!session?.user) redirect('/auth/signin')
    return <LeaderboardContent />
}
