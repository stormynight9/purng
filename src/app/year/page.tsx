import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { YearContent } from './year-content'

export default async function YearPage() {
    const session = await auth()
    if (!session?.user) redirect('/auth/signin')
    return <YearContent userEmail={session.user.email ?? undefined} />
}
