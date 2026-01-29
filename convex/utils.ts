/**
 * Get date string in YYYY-MM-DD format using LOCAL timezone (not UTC)
 */
export function getLocalDateString(date: Date = new Date()): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export function getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0)
    const diff = date.getTime() - start.getTime()
    const oneDay = 1000 * 60 * 60 * 24
    return Math.floor(diff / oneDay)
}

export function isRestDay(date: Date): boolean {
    const dateString = getLocalDateString(date)
    const secret = process.env.RANDOM_SEED || 'default-secret'
    const seedString = 'rest-' + dateString + secret // different prefix for rest days

    let seed = 0
    for (let i = 0; i < seedString.length; i++) {
        seed += seedString.charCodeAt(i)
    }

    const x = Math.sin(seed) * 10000
    const random = x - Math.floor(x)

    // Calculate day of year (1-365 or 1-366 for leap years)
    const dayOfYear = getDayOfYear(date)
    const year = date.getFullYear()
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
    const daysInYear = isLeapYear ? 366 : 365

    // Calculate probability: 0% at day 1, 20% at last day of year
    // Linear interpolation: probability = (dayOfYear / daysInYear) * 0.20
    const restDayProbability = (dayOfYear / daysInYear) * 0.2

    return random < restDayProbability
}

export function getDailyTarget(date: Date): number {
    // Check if it's a rest day first (probability increases from 0% to 20% throughout the year)
    if (isRestDay(date)) {
        return 0
    }

    const dayOfYear = getDayOfYear(date)

    // Use the date and secret as a seed for the random number generator
    const dateString = getLocalDateString(date)
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
