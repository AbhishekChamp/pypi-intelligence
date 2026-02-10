import { useState, useMemo } from 'react'
import type { DownloadStats } from '@/types'

export type TimeRange = '7d' | '30d' | '90d' | '180d'

export const TIME_RANGE_OPTIONS = [
  { value: '7d' as TimeRange, label: '1 Week', days: 7 },
  { value: '30d' as TimeRange, label: '1 Month', days: 30 },
  { value: '90d' as TimeRange, label: '3 Months', days: 90 },
  { value: '180d' as TimeRange, label: '6 Months', days: 180 },
]

interface FilteredDownloadStats {
  total: number
  history: Array<{ date: string; downloads: number }>
  trend: 'up' | 'down' | 'stable'
  trendPercentage: number
}

export function useDownloadFilter(stats: DownloadStats | null) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('30d')

  const filteredStats = useMemo<FilteredDownloadStats | null>(() => {
    if (!stats || !stats.history.length) return null

    const rangeOption = TIME_RANGE_OPTIONS.find(r => r.value === selectedRange)
    if (!rangeOption) return null

    // Get the last N days of history
    const daysToShow = Math.min(rangeOption.days, stats.history.length)
    const filteredHistory = stats.history.slice(-daysToShow)

    // Calculate total downloads for the period
    const total = filteredHistory.reduce((sum, day) => sum + day.downloads, 0)

    // Calculate trend
    let trend: 'up' | 'down' | 'stable' = 'stable'
    let trendPercentage = 0

    if (filteredHistory.length >= 2) {
      const halfLength = Math.floor(filteredHistory.length / 2)
      const firstHalf = filteredHistory.slice(0, halfLength).reduce((sum, d) => sum + d.downloads, 0)
      const secondHalf = filteredHistory.slice(halfLength).reduce((sum, d) => sum + d.downloads, 0)

      if (firstHalf > 0) {
        const change = ((secondHalf - firstHalf) / firstHalf) * 100
        trendPercentage = Math.abs(change)
        trend = change > 5 ? 'up' : change < -5 ? 'down' : 'stable'
      }
    }

    return {
      total,
      history: filteredHistory,
      trend,
      trendPercentage,
    }
  }, [stats, selectedRange])

  return {
    selectedRange,
    setSelectedRange,
    filteredStats,
    TIME_RANGE_OPTIONS,
  }
}
