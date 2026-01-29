import { cronJobs } from 'convex/server'
import { internal } from './_generated/api'

const crons = cronJobs()

// Daily push reminder at 14:00 UTC for users who haven't logged today
crons.daily(
    'daily-push-reminder',
    { hourUTC: 14, minuteUTC: 0 },
    internal.sendPush.sendDailyReminders
)

export default crons
