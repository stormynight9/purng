'use client'

import {
    ConvexProvider as ConvexProviderBase,
    ConvexReactClient,
} from 'convex/react'

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    throw new Error('NEXT_PUBLIC_CONVEX_URL environment variable is not set')
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL)

export function ConvexProvider({ children }: { children: React.ReactNode }) {
    return <ConvexProviderBase client={convex}>{children}</ConvexProviderBase>
}
