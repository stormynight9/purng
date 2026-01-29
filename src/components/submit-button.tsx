'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Loader2Icon } from 'lucide-react'

interface SubmitButtonProps {
    children: React.ReactNode
    variant?:
        | 'default'
        | 'destructive'
        | 'outline'
        | 'secondary'
        | 'ghost'
        | 'link'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    className?: string
    showSpinner?: boolean
}

export function SubmitButton({
    children,
    variant = 'default',
    size = 'default',
    className,
    showSpinner = true,
}: SubmitButtonProps) {
    const { pending } = useFormStatus()

    return (
        <Button
            type='submit'
            variant={variant}
            size={size}
            className={className}
            disabled={pending}
        >
            {pending && showSpinner ? (
                <span className='inline-flex items-center gap-2'>
                    <Loader2Icon className='h-4 w-4 shrink-0 animate-spin' />
                    {children}
                </span>
            ) : (
                children
            )}
        </Button>
    )
}
