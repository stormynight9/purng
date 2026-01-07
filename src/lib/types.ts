export interface PushupFormData {
    count: number
}

export interface ActionResponse {
    success: boolean
    message: string
    errors?: {
        count?: string[]
    }
    total?: number
}

export interface MissedDay {
    date: string
    target: number
    completed: number
    missed: number
}

export type DayStatus = 'future' | 'today' | 'completed' | 'missed' | 'rest'

export interface YearDay {
    date: string
    dayOfMonth: number
    month: number
    status: DayStatus
    target: number
    completed: number
}

export type ActivityType = 'regular' | 'recovery' | 'completed'

export interface ActivityEntry {
    id: string
    userName: string
    count: number
    date: string
    createdAt: Date
    type: ActivityType
    target: number
}

export interface StatsData {
    dayNumber: number
    year: number
    myTotal: number
    communityTotal: number
    completionCount: number
    missedPushups: number
}
