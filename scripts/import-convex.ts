/**
 * Script to import data from migration-data.json into Convex
 *
 * Usage:
 * 1. Make sure you have migration-data.json in the project root
 * 2. Run: npx tsx scripts/import-convex.ts
 *
 * This script uses the ConvexHttpClient to call internal mutations
 */

import { config } from 'dotenv'
// Load both .env and .env.local
config({ path: '.env' })
config({ path: '.env.local' })

import { ConvexHttpClient } from 'convex/browser'
import { api } from '../convex/_generated/api'
import fs from 'fs'
import path from 'path'

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    console.error(
        'Error: NEXT_PUBLIC_CONVEX_URL environment variable is not set'
    )
    process.exit(1)
}

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL)

async function importData() {
    console.log('Starting data import to Convex...')

    try {
        // Read migration data
        const dataPath = path.join(process.cwd(), 'migration-data.json')
        if (!fs.existsSync(dataPath)) {
            console.error(
                'Error: migration-data.json not found. Please run export-neon.ts first.'
            )
            process.exit(1)
        }

        const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
        console.log(
            `Found ${data.users.length} users, ${data.pushupEntries.length} entries`
        )

        // Import users first
        console.log('\n📥 Importing users...')
        const userIdMap = await client.mutation(
            api.migrations.importData.importUsers,
            { users: data.users }
        )
        console.log(`✅ Imported ${Object.keys(userIdMap).length} users`)

        // Import pushup entries
        console.log('\n📥 Importing pushup entries...')
        const entriesResult = await client.mutation(
            api.migrations.importData.importPushupEntries,
            { entries: data.pushupEntries, userIdMap }
        )
        console.log(`✅ Imported ${entriesResult.imported} pushup entries`)

        // Import accounts
        if (data.accounts && data.accounts.length > 0) {
            console.log('\n📥 Importing accounts...')
            const accountsResult = await client.mutation(
                api.migrations.importData.importAccounts,
                { accounts: data.accounts, userIdMap }
            )
            console.log(`✅ Imported ${accountsResult.imported} accounts`)
        }

        // Import sessions
        if (data.sessions && data.sessions.length > 0) {
            console.log('\n📥 Importing sessions...')
            const sessionsResult = await client.mutation(
                api.migrations.importData.importSessions,
                { sessions: data.sessions, userIdMap }
            )
            console.log(`✅ Imported ${sessionsResult.imported} sessions`)
        }

        console.log('\n✅ Migration completed successfully!')
    } catch (error) {
        console.error('Error importing data:', error)
        process.exit(1)
    }
}

importData()
