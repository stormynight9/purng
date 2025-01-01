import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Purng',
    description: 'Purng is a tool for tracking daily pushups.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en' className='h-full w-full'>
            <body
                className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
            >
                {children}
            </body>
        </html>
    );
}
