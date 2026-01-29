import { auth } from '@/auth'
import { FeedbackForm } from './feedback-form'

export default async function FeedbackPage() {
    const session = await auth()
    const userEmail = session?.user?.email ?? null
    const userName = session?.user?.name ?? null

    return <FeedbackForm userEmail={userEmail} userName={userName} />
}
