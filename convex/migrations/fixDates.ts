import { mutation } from '../_generated/server'

// Fix timestamps only (run this if dates are already fixed)
export const fixTimestamps = mutation({
    args: {},
    handler: async (ctx) => {
        const entries = await ctx.db.query('pushupEntries').collect()
        let fixed = 0

        for (const entry of entries) {
            // Add 1 hour to correct UTC offset
            await ctx.db.patch(entry._id, {
                createdAt: entry.createdAt + 60 * 60 * 1000,
            })
            fixed++
        }

        return { fixed, total: entries.length }
    },
})

// Fix both dates and timestamps (run this if neither is fixed)
export const fixDatesAndTimestamps = mutation({
    args: {},
    handler: async (ctx) => {
        const entries = await ctx.db.query('pushupEntries').collect()
        let fixedDates = 0
        let fixedTimestamps = 0

        for (const entry of entries) {
            const updates: { date?: string; createdAt?: number } = {}

            // Fix date format: "2025-01-17T23:00:00.000Z" -> "2025-01-18"
            if (entry.date.includes('T')) {
                const d = new Date(entry.date)
                d.setTime(d.getTime() + 60 * 60 * 1000) // Add 1 hour

                const year = d.getUTCFullYear()
                const month = String(d.getUTCMonth() + 1).padStart(2, '0')
                const day = String(d.getUTCDate()).padStart(2, '0')
                updates.date = `${year}-${month}-${day}`
                fixedDates++
            }

            // Fix createdAt timestamp: add 1 hour for timezone correction
            updates.createdAt = entry.createdAt + 60 * 60 * 1000
            fixedTimestamps++

            await ctx.db.patch(entry._id, updates)
        }

        return { fixedDates, fixedTimestamps, total: entries.length }
    },
})
