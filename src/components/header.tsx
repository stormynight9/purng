import { Clock } from '@/components/clock'
import { Button } from '@/components/ui/button'
import { HeaderStats } from './header-stats'
import { signOut } from '@/auth'
import Link from 'next/link'

export function Header() {
    return (
        <header className='p-4'>
            <div className='flex items-center justify-between gap-1'>
                <Clock />
                <div className='flex items-center gap-2'>
                    <Link href='/logs'>
                        <Button variant='ghost' size='sm'>
                            Logs
                        </Button>
                    </Link>
                    <Link href='/year'>
                        <Button variant='ghost' size='sm'>
                            Year View
                        </Button>
                    </Link>
                    <Link href='/leaderboard'>
                        <Button variant='ghost' size='sm'>
                            Leaderboard
                        </Button>
                    </Link>
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
            </div>
            <HeaderStats />
        </header>
    )
}
