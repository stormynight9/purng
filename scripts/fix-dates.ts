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

async function fixDatesAndTimestamps() {
    console.log('Fixing dates and timestamps in pushup entries...')
    console.log(`Using Convex URL: ${process.env.NEXT_PUBLIC_CONVEX_URL}`)

    const result = await client.mutation(
        api.migrations.fixDates.fixDatesAndTimestamps,
        {}
    )

    console.log(
        `✅ Fixed ${result.fixedDates} dates and ${result.fixedTimestamps} timestamps out of ${result.total} entries`
    )
}

fixDatesAndTimestamps().catch(console.error)
