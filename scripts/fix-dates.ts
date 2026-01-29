import { config } from 'dotenv'
config({ path: '.env' })
config({ path: '.env.local' })

import { ConvexHttpClient } from 'convex/browser'
import { api } from '../convex/_generated/api'

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    console.error('NEXT_PUBLIC_CONVEX_URL not set')
    process.exit(1)
}

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL)

async function fixTimestamps() {
    console.log('Fixing timestamps in pushup entries (adding 1 hour)...')

    const result = await client.mutation(
        api.migrations.fixDates.fixTimestamps,
        {}
    )

    console.log(`✅ Fixed ${result.fixed} out of ${result.total} entries`)
}

fixTimestamps().catch(console.error)
