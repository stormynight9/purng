/**
 * One-time script to backfill yearlyCommunityStats and userYearlyStats
 * from existing pushupEntries. Run after deploying the stats tables.
 *
 * Usage: npx tsx scripts/backfill-stats.ts
 */

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

async function backfill() {
    console.log('Backfilling yearlyCommunityStats and userYearlyStats...')
    console.log(`Using Convex URL: ${process.env.NEXT_PUBLIC_CONVEX_URL}`)

    const result = await client.mutation(
        api.migrations.backfillStats.backfillStats,
        {}
    )

    console.log(`✅ Processed ${result.entriesProcessed} entries`)
    console.log(`   Years (community): ${result.yearsUpdated}`)
    console.log(`   User-years: ${result.userYearsUpdated}`)
}

backfill().catch(console.error)
