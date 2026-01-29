'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

            {/* Mobile: dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant='ghost'
                        size='icon'
                        className='md:hidden'
                        aria-label='Open menu'
                    >
                        <Menu />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-44'>
                    {navLinks.map(({ href, label }) => (
                        <DropdownMenuItem key={href} asChild>
                            <Link href={href}>{label}</Link>
                        </DropdownMenuItem>
                    ))}
                    <form action={signOut}>
                        <DropdownMenuItem asChild>
                            <button
                                type='submit'
                                className='w-full cursor-default'
                            >
                                Logout
                            </button>
                        </DropdownMenuItem>
                    </form>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
