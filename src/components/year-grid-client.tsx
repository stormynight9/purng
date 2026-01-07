'use client'

import { useCallback, useState } from 'react'
import { YearGrid } from './year-grid'
import { getYearData } from '@/lib/actions'
import { getLocalDateString } from '@/lib/utils'
import type { YearDay } from '@/lib/types'

interface YearGridClientProps {
    initialDays: YearDay[]
}

export function YearGridClient({ initialDays }: YearGridClientProps) {
    const [days, setDays] = useState<YearDay[]>(initialDays)

    const refreshData = useCallback(async () => {
        const today = new Date()
        const dateString = getLocalDateString(today)
        const newData = await getYearData(dateString)
        setDays(newData)
    }, [])

    return <YearGrid days={days} onRecoverySuccess={refreshData} />
}
