import { Clock } from '@/components/clock'
import { Button } from '@/components/ui/button'
import { HeaderStats } from './header-stats'
import { signOut } from '@/auth'

export function Header() {
    return (
        <header className='p-4'>
            <div className='flex items-center justify-between gap-1'>
                <Clock />
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
            </div>
            <HeaderStats />
        </header>
    )
}
