import fs from 'fs'
import 'dotenv/config'

async function exportData() {
    console.log('Starting data export from Neon...')

    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL not found in environment')
        process.exit(1)
    }

    // Dynamic import to avoid issues
    const { neon } = await import('@neondatabase/serverless')
    const sql = neon(process.env.DATABASE_URL)

    try {
        const allUsers = await sql`SELECT * FROM "user"`
        const allEntries = await sql`SELECT * FROM "pushup_entry"`
        const allAccounts = await sql`SELECT * FROM "account"`
        const allSessions = await sql`SELECT * FROM "session"`

        const data = {
            users: allUsers,
            pushupEntries: allEntries,
            accounts: allAccounts,
            sessions: allSessions,
            exportedAt: new Date().toISOString(),
        }

        fs.writeFileSync('migration-data.json', JSON.stringify(data, null, 2))
        console.log(
            `✅ Exported ${allUsers.length} users, ${allEntries.length} entries, ${allAccounts.length} accounts, ${allSessions.length} sessions`
        )
        console.log('Data saved to migration-data.json')
    } catch (error) {
        console.error('Error exporting data:', error)
        process.exit(1)
    }
}

exportData()
