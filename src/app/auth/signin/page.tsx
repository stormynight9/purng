import { SubmitButton } from '@/components/submit-button'
import { auth, signIn } from '@/auth'
import { redirect } from 'next/navigation'
import { Icons } from '@/components/icons'

export default async function SignIn() {
    const session = await auth()

    if (session?.user) {
        redirect('/')
    }

    return (
        <div className='flex h-screen w-full items-center justify-center px-5'>
            <div className='mx-auto flex w-full max-w-sm flex-col justify-center space-y-6'>
                <div className='flex flex-col space-y-2 text-center'>
                    <h1 className='text-2xl font-semibold tracking-tight'>
                        Welcome to Purng
                    </h1>
                    <p className='text-sm text-muted-foreground'>
                        Sign in to track your daily pushup progress
                    </p>
                </div>
                <div className='flex flex-col gap-2'>
                    <form
                        action={async () => {
                            'use server'
                            await signIn('github')
                        }}
                    >
                        <SubmitButton
                            className='w-full gap-2'
                            variant='outline'
                        >
                            <Icons.github className='h-4 w-4' />
                            Sign in with GitHub
                        </SubmitButton>
                    </form>
                    <form
                        action={async () => {
                            'use server'
                            await signIn('google')
                        }}
                    >
                        <SubmitButton
                            variant='outline'
                            className='w-full gap-2'
                        >
                            <Icons.google className='h-4 w-4' />
                            Sign in with Google
                        </SubmitButton>
                    </form>
                </div>
            </div>
        </div>
    )
}
