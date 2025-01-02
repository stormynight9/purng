import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { PushupForm } from '@/components/pushup-form'
import { Clock } from '@/components/clock'

export default async function Home() {
    const session = await auth()
    if (!session?.user) {
        redirect('/auth/signin')
    }

    return (
        <div>
            <Clock />
            <main className='flex h-screen flex-col items-center justify-center gap-6'>
                <div className='flex flex-col items-center gap-2'>
                    <PushupForm />
                </div>
            </main>
        </div>
    )
}
