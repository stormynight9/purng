import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
})

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
})

export const metadata: Metadata = {
    title: 'Purng',
    description: 'The 2025 Pushup Challenge',
    openGraph: {
        title: 'Purng - The 2025 Pushup Challenge',
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
                alt: 'Purng - The 2025 Pushup Challenge',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Purng - The 2025 Pushup Challenge',
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
            className='dark h-full w-full'
            style={{ colorScheme: 'dark' }}
        >
            <head>
                <Analytics />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} min-h-screen font-[family-name:var(--font-geist-mono)] antialiased`}
            >
                {children}
            </body>
        </html>
    )
}
