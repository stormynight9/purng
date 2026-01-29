import { Analytics } from '@vercel/analytics/react'
import type { Metadata } from 'next'
import { Geist_Mono } from 'next/font/google'
import { ConvexProvider } from '@/components/convex-provider'
import { SessionProvider } from 'next-auth/react'
import './globals.css'

const geistMono = Geist_Mono({
    subsets: ['latin'],
})

export const metadata: Metadata = {
    title: 'Purng',
    description: 'The 2026 Pushup Challenge',
    openGraph: {
        title: 'Purng - The 2026 Pushup Challenge',
        description:
            'A progressive daily pushup challenge that increases throughout the year. Track your progress and join others in building strength consistently.',
        type: 'website',
        url: 'https://purng.nader.run',
        siteName: 'Purng',
        images: [
            {
                url: '/opengraph-image.png',
                width: 1200,
                height: 630,
                alt: 'Purng - The 2026 Pushup Challenge',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Purng - The 2026 Pushup Challenge',
        description:
            'A progressive daily pushup challenge that increases throughout the year. Track your progress and join others in building strength consistently.',
        images: ['/opengraph-image.png'],
    },
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html
            lang='en'
            className={`dark h-full w-full ${geistMono.className}`}
            style={{ colorScheme: 'dark' }}
        >
            <head>
                <Analytics />
            </head>
            <body className='min-h-screen antialiased'>
                {/* <div className='w-full border-b bg-amber-900/10 py-2 text-center text-sm text-amber-500'>
                    Maintenance: Some features may be unavailable while we
                    upgrade the site. Thanks for your patience!
                </div> */}
                <SessionProvider>
                    <ConvexProvider>{children}</ConvexProvider>
                </SessionProvider>
            </body>
        </html>
    )
}
