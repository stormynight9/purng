import { Clock } from '@/components/clock'
import { Button } from '@/components/ui/button'
import { SubmitButton } from '@/components/submit-button'
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
                    <form
                        action={async () => {
                            'use server'
                            await signOut()
                        }}
                    >
                        <SubmitButton variant='ghost' size='sm'>
                            Logout
                        </SubmitButton>
                    </form>
                </div>
            </div>
            <HeaderStats />
        </header>
    )
}
