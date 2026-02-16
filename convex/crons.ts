import { cronJobs } from 'convex/server'
import { internal } from './_generated/api'

const crons = cronJobs()

// Morning push reminder at 09:00 UTC for users who haven't completed today's challenge
crons.daily(
    'daily-push-reminder-morning',
    { hourUTC: 9, minuteUTC: 0 },
    internal.sendPush.sendDailyReminders
)

// Evening push reminder at 19:00 UTC for users who haven't completed today's challenge
crons.daily(
    'daily-push-reminder-evening',
    { hourUTC: 19, minuteUTC: 0 },
    internal.sendPush.sendDailyReminders
)

export default crons
