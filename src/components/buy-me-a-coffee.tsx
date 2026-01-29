import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BuyMeACoffeeProps {
    message?: string
    className?: string
}

const DEFAULT_MESSAGE =
    'Enjoying Purng? Buy me a coffee to support the project. ❤️ '

export function BuyMeACoffee({
    message = DEFAULT_MESSAGE,
    className,
}: BuyMeACoffeeProps) {
    const href =
        process.env.NEXT_PUBLIC_BUYMEACOFFEE_URL ?? 'https://buymeacoffee.com'

    return (
        <div className={cn('flex flex-col items-center', className)}>
            <p className='mb-3 text-center font-mono text-sm text-muted-foreground'>
                {message}
            </p>
            <Button
                variant='outline'
                size='default'
                className='font-mono'
                asChild
            >
                <Link href={href} target='_blank' rel='noopener noreferrer'>
                    Buy me a coffee ☕
                </Link>
            </Button>
        </div>
    )
}
