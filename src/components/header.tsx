import { Clock } from '@/components/clock'
import { Button } from '@/components/ui/button'
import { HeaderStats } from './header-stats'
import { signOut } from '@/auth'

export function Header() {
    return (
        <header className='flex justify-between p-4'>
            <div className='flex flex-col gap-1'>
                <Clock />
                <HeaderStats />
            </div>
            <form
                action={async () => {
                    'use server'
                    await signOut()
                }}
            >
                <Button variant='ghost' size='sm'>
                    Logout
                </Button>
            </form>
        </header>
    )
}
