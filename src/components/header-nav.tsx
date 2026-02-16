'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer'
import { Menu } from 'lucide-react'

interface HeaderNavProps {
    signOut: () => Promise<void>
}

const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/logs', label: 'Logs' },
    { href: '/year', label: 'Year View' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/how-it-works', label: 'How it works' },
    { href: '/feedback', label: 'Feedback' },
] as const

export function HeaderNav({ signOut }: HeaderNavProps) {
    return (
        <>
            {/* Desktop: visible from md up */}
            <div className='hidden items-center gap-2 md:flex'>
                {navLinks.map(({ href, label }) => (
                    <Link key={href} href={href}>
                        <Button variant='ghost' size='sm'>
                            {label}
                        </Button>
                    </Link>
                ))}
                <form action={signOut}>
                    <Button variant='ghost' size='sm' type='submit'>
                        Logout
                    </Button>
                </form>
            </div>

            {/* Mobile: bottom drawer */}
            <Drawer direction='bottom'>
                <DrawerTrigger asChild>
                    <Button
                        variant='ghost'
                        size='icon'
                        className='md:hidden'
                        aria-label='Open menu'
                    >
                        <Menu />
                    </Button>
                </DrawerTrigger>
                <DrawerContent className='max-h-[85vh]'>
                    <DrawerHeader>
                        <DrawerTitle>Menu</DrawerTitle>
                    </DrawerHeader>
                    <nav className='flex flex-col gap-1 px-4 pb-6'>
                        {navLinks.map(({ href, label }) => (
                            <DrawerClose key={href} asChild>
                                <Link href={href}>
                                    <Button
                                        variant='ghost'
                                        className='w-full justify-start'
                                    >
                                        {label}
                                    </Button>
                                </Link>
                            </DrawerClose>
                        ))}
                        <form action={signOut} className='mt-2 border-t pt-2'>
                            <DrawerClose asChild>
                                <button
                                    type='submit'
                                    className='w-full rounded-md px-3 py-2 text-left text-sm font-medium hover:bg-muted'
                                >
                                    Logout
                                </button>
                            </DrawerClose>
                        </form>
                    </nav>
                </DrawerContent>
            </Drawer>
        </>
    )
}
