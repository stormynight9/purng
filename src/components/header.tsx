import { Clock } from '@/components/clock'
import { Button } from '@/components/ui/button'
import { signIn } from 'next-auth/react'
import { TotalCommunityPushups } from './total-community-pushups'

export function Header() {
    return (
        <header className='flex items-center justify-between p-4'>
            <div className='flex flex-col gap-1'>
                <Clock />
                <TotalCommunityPushups />
            </div>
            <form
                action={async () => {
                    'use server'
                    await signIn()
                }}
            >
                <Button variant='ghost' size='sm'>
                    Logout
                </Button>
            </form>
        </header>
    )
}
