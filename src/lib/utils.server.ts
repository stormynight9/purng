import 'server-only'

export function getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0)
    const diff = date.getTime() - start.getTime()
    const oneDay = 1000 * 60 * 60 * 24
    return Math.floor(diff / oneDay)
}

export function getDailyTarget(date: Date): number {
    const dayOfYear = getDayOfYear(date)

    // Use the date and secret as a seed for the random number generator
    const dateString = date.toISOString().split('T')[0]
    const secret = process.env.RANDOM_SEED || 'default-secret'
    let seed = 0

    // Combine date and secret for the seed
    const seedString = dateString + secret
    for (let i = 0; i < seedString.length; i++) {
        seed += seedString.charCodeAt(i)
    }

    // Create a seeded random number
    const x = Math.sin(seed++) * 10000
    const random = x - Math.floor(x)

    // Calculate target (random number between 0 and dayOfYear)
    return Math.floor(random * (dayOfYear + 1))
}
