'use client'
import { Clock } from '@/components/clock'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'

export function Header() {
    return (
        <header className='flex items-center justify-between p-4'>
            <Clock />
            <Button variant='ghost' size='sm' onClick={() => signOut()}>
                Logout
            </Button>
        </header>
    )
}
