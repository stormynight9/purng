import { Clock } from '@/components/clock'
import { HeaderStats } from './header-stats'
import { HeaderNav } from './header-nav'
import { PushNotificationToggle } from './push-notification-toggle'
import { signOutAction } from '@/lib/actions'

export function Header() {
    return (
        <header className='p-4'>
            <div className='flex items-center justify-between gap-1'>
                <Clock />
                <div className='flex items-center gap-2'>
                    <PushNotificationToggle />
                    <HeaderNav signOut={signOutAction} />
                </div>
            </div>
            <HeaderStats />
        </header>
    )
}
