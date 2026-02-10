import { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { X, Plus, TrendingUp, TrendingDown, Minus, Download, Trash2 } from 'lucide-react'
import { fetchDailyStats } from '@/api/pypi'
import { NumberDisplay } from './NumberDisplay'
import { TIME_RANGE_OPTIONS, type TimeRange } from '@/hooks'
import type { PyPIStatsDaily } from '@/types'

interface PackageTrend {
  name: string
  data: PyPIStatsDaily
  color: string
}

const COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#22c55e', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
]

// Custom tooltip for chart
function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number; name: string; color: string }>
  label?: string
}) {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-md px-3 py-2 shadow-lg"
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border)',
        }}
      >
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          {label}
        </p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span style={{ color: 'var(--text-muted)' }}>{entry.name}:</span>
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
              {entry.value?.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function DownloadTrendComparison() {
  const [packages, setPackages] = useState<string[]>([])
  const [newPackage, setNewPackage] = useState('')
  const [trends, setTrends] = useState<PackageTrend[]>([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'line' | 'area'>('line')
  const [selectedRange, setSelectedRange] = useState<TimeRange>('30d')

  const addPackage = async () => {
    if (!newPackage.trim() || packages.includes(newPackage.trim().toLowerCase())) return

    const pkgName = newPackage.trim().toLowerCase()
    setPackages([...packages, pkgName])
    setNewPackage('')
    setLoading(true)

    try {
      const data = await fetchDailyStats(pkgName)
      const color = COLORS[trends.length % COLORS.length]
      setTrends(prev => [...prev, { name: pkgName, data, color }])
    } catch (error) {
      console.error(`Failed to fetch data for ${pkgName}:`, error)
    } finally {
      setLoading(false)
    }
  }

  const removePackage = (index: number) => {
    const newPackages = packages.filter((_, i) => i !== index)
    const newTrends = trends.filter((_, i) => i !== index)
    setPackages(newPackages)
    setTrends(newTrends)
  }

  // Get the minimum data length across all trends to determine available ranges
  const minDataLength = useMemo(() => {
    if (trends.length === 0) return 0
    return Math.min(...trends.map(t => t.data.data.length))
  }, [trends])

  // Filter chart data based on selected range
  const chartData = useMemo(() => {
    if (trends.length === 0) return []

    const rangeOption = TIME_RANGE_OPTIONS.find(r => r.value === selectedRange)
    if (!rangeOption) return []

    // Get the last N days of data
    const daysToShow = Math.min(rangeOption.days, minDataLength)

    // Get all unique dates from the filtered period
    const allDates = new Set<string>()
    trends.forEach(trend => {
      const filteredData = trend.data.data.slice(-daysToShow)
      filteredData.forEach(day => {
        allDates.add(day.date)
      })
    })

    // Sort dates
    const sortedDates = Array.from(allDates).sort()

    // Build chart data
    const data: Record<string, number | string>[] = sortedDates.map(date => {
      const point: Record<string, number | string> = { date }
      trends.forEach(trend => {
        const dayData = trend.data.data.find(d => d.date === date)
        point[trend.name] = dayData?.downloads || 0
      })
      return point
    })

    return data
  }, [trends, selectedRange, minDataLength])

  // Calculate filtered stats for each trend
  const getFilteredStats = (trend: PackageTrend) => {
    const rangeOption = TIME_RANGE_OPTIONS.find(r => r.value === selectedRange)
    if (!rangeOption) return { total: 0, avg: 0, trend: { direction: 'stable' as const, percentage: 0 } }

    const daysToShow = Math.min(rangeOption.days, trend.data.data.length)
    const filteredData = trend.data.data.slice(-daysToShow)

    const total = filteredData.reduce((sum, day) => sum + day.downloads, 0)
    const avg = filteredData.length > 0 ? Math.round(total / filteredData.length) : 0

    // Calculate trend
    let direction: 'up' | 'down' | 'stable' = 'stable'
    let percentage = 0

    if (filteredData.length >= 2) {
      const halfLength = Math.floor(filteredData.length / 2)
      const firstHalf = filteredData.slice(0, halfLength).reduce((sum, d) => sum + d.downloads, 0)
      const secondHalf = filteredData.slice(halfLength).reduce((sum, d) => sum + d.downloads, 0)

      if (firstHalf > 0) {
        const change = ((secondHalf - firstHalf) / firstHalf) * 100
        percentage = Math.abs(change)
        direction = change > 5 ? 'up' : change < -5 ? 'down' : 'stable'
      }
    }

    return { total, avg, trend: { direction, percentage } }
  }

  const exportData = () => {
    const csvContent = [
      ['Date', ...trends.map(t => t.name)].join(','),
      ...chartData.map(row => [row.date, ...trends.map(t => row[t.name] || 0)].join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'download-trends.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const selectedOption = TIME_RANGE_OPTIONS.find(r => r.value === selectedRange)
  const periodLabel = selectedOption?.label || 'Selected Period'

  return (
    <div className="space-y-6">
      {/* Package Input */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newPackage}
          onChange={e => setNewPackage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addPackage()}
          placeholder="Enter package name..."
          className="flex-1 rounded-lg border px-4 py-2"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
        />
        <button
          onClick={addPackage}
          disabled={loading || !newPackage.trim()}
          className="flex items-center gap-2 rounded-lg bg-(--accent) px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {/* Package List */}
      {packages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {packages.map((pkg, index) => (
            <div
              key={pkg}
              className="flex items-center gap-2 rounded-full px-3 py-1 text-sm"
              style={{ backgroundColor: `${COLORS[index % COLORS.length]}20` }}
            >
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span style={{ color: 'var(--text-primary)' }}>{pkg}</span>
              <button
                onClick={() => removePackage(index)}
                className="rounded-full p-0.5 transition-colors hover:bg-(--error-light)"
              >
                <X className="h-3 w-3" style={{ color: 'var(--error)' }} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Chart Controls */}
      {trends.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Time Range Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              Time Range:
            </span>
            <div className="flex flex-wrap gap-1">
              {TIME_RANGE_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => setSelectedRange(option.value)}
                  disabled={minDataLength < option.days}
                  className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                    selectedRange === option.value
                      ? 'bg-(--accent) text-white'
                      : 'bg-(--bg-tertiary) hover:bg-(--accent-light)'
                  } ${minDataLength < option.days ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{
                    color: selectedRange === option.value ? 'white' : 'var(--text-secondary)',
                  }}
                  title={minDataLength < option.days ? 'Not enough data available' : ''}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* View Mode & Export */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('line')}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                viewMode === 'line'
                  ? 'bg-(--accent) text-white'
                  : 'bg-(--bg-tertiary) text-(--text-secondary)'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setViewMode('area')}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                viewMode === 'area'
                  ? 'bg-(--accent) text-white'
                  : 'bg-(--bg-tertiary) text-(--text-secondary)'
              }`}
            >
              Area
            </button>
            <button
              onClick={exportData}
              className="flex items-center gap-2 rounded-lg bg-(--bg-tertiary) px-3 py-1.5 text-sm transition-colors hover:bg-(--accent-light)"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <div
          className="rounded-lg border p-4"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
        >
          <ResponsiveContainer width="100%" height={400}>
            {viewMode === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  tickFormatter={date => new Date(date).toLocaleDateString()}
                />
                <YAxis 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  tickFormatter={(value: number) => {
                    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M'
                    if (value >= 1_000) return (value / 1_000).toFixed(1) + 'k'
                    return value.toString()
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {trends.map((trend) => (
                  <Line
                    key={trend.name}
                    type="monotone"
                    dataKey={trend.name}
                    stroke={trend.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            ) : (
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  tickFormatter={date => new Date(date).toLocaleDateString()}
                />
                <YAxis 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  tickFormatter={(value: number) => {
                    if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M'
                    if (value >= 1_000) return (value / 1_000).toFixed(1) + 'k'
                    return value.toString()
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {trends.map((trend) => (
                  <Area
                    key={trend.name}
                    type="monotone"
                    dataKey={trend.name}
                    stroke={trend.color}
                    fill={trend.color}
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                ))}
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      {/* Stats Summary */}
      {trends.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trends.map((trend, index) => {
            const stats = getFilteredStats(trend)

            return (
              <div
                key={trend.name}
                className="rounded-lg border p-4"
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: trend.color }}
                    />
                    <span className="font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
                      {trend.name}
                    </span>
                  </div>
                  <button
                    onClick={() => removePackage(index)}
                    className="rounded p-1 transition-colors hover:bg-(--error-light)"
                  >
                    <Trash2 className="h-4 w-4" style={{ color: 'var(--error)' }} />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {periodLabel} Total
                    </span>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      <NumberDisplay value={stats.total} />
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Trend</span>
                    <div className="flex items-center gap-1">
                      {stats.trend.direction === 'up' && (
                        <>
                          <TrendingUp className="h-4 w-4" style={{ color: 'var(--success)' }} />
                          <span style={{ color: 'var(--success)' }}>+{stats.trend.percentage.toFixed(1)}%</span>
                        </>
                      )}
                      {stats.trend.direction === 'down' && (
                        <>
                          <TrendingDown className="h-4 w-4" style={{ color: 'var(--error)' }} />
                          <span style={{ color: 'var(--error)' }}>-{stats.trend.percentage.toFixed(1)}%</span>
                        </>
                      )}
                      {stats.trend.direction === 'stable' && (
                        <>
                          <Minus className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                          <span style={{ color: 'var(--text-muted)' }}>Stable</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Daily Avg
                    </span>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      <NumberDisplay value={stats.avg} />
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {trends.length === 0 && (
        <div
          className="rounded-lg border p-12 text-center"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
        >
          <TrendingUp className="mx-auto mb-4 h-12 w-12" style={{ color: 'var(--text-muted)' }} />
          <p className="mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>
            Compare Download Trends
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Add packages above to compare their download statistics
          </p>
        </div>
      )}
    </div>
  )
}
