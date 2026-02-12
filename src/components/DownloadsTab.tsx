import { formatNumber, cn } from '@/utils'
import { StatCardWithNumber, NumberDisplay } from './NumberDisplay'
import { useDownloadFilter, TIME_RANGE_OPTIONS } from '@/hooks'
import type { DownloadStats } from '@/types'
import { TrendingUp, TrendingDown, Minus, Download, Calendar, Activity } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts'

interface DownloadsTabProps {
  stats: DownloadStats | null
  loading?: boolean
}

// Custom tooltip component for the chart
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (active && payload && payload.length) {
    const value = payload[0].value
    return (
      <div
        className="rounded-md px-3 py-2 shadow-lg"
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border)',
        }}
      >
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {label}
        </p>
        <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          {value.toLocaleString()} Downloads
        </p>
      </div>
    )
  }
  return null
}

export function DownloadsTab({ stats, loading }: DownloadsTabProps) {
  const { selectedRange, setSelectedRange, filteredStats } = useDownloadFilter(stats)

  if (loading) {
    return (
      <div className="space-y-6">
        <div
          className="h-48 animate-pulse rounded-lg"
          style={{ backgroundColor: 'var(--border)' }}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg"
              style={{ backgroundColor: 'var(--border)' }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (!stats || !filteredStats) {
    return (
      <div className="rounded-lg p-8 text-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <p style={{ color: 'var(--text-muted)' }}>No download statistics available</p>
      </div>
    )
  }

  const trendIcon =
    filteredStats.trend === 'up' ? (
      <TrendingUp className="h-5 w-5" style={{ color: 'var(--success)' }} />
    ) : filteredStats.trend === 'down' ? (
      <TrendingDown className="h-5 w-5" style={{ color: 'var(--error)' }} />
    ) : (
      <Minus className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
    )

  const chartData = filteredStats.history.map(h => ({
    date: new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    downloads: h.downloads,
  }))

  const selectedOption = TIME_RANGE_OPTIONS.find(r => r.value === selectedRange)
  const periodLabel = selectedOption?.label || 'Selected Period'

  return (
    <div className="space-y-6">
      {/* Time Range Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
          Time Range:
        </span>
        <div className="flex flex-wrap gap-1">
          {TIME_RANGE_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => setSelectedRange(option.value)}
              disabled={stats.history.length < option.days}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedRange === option.value
                  ? 'bg-(--accent) text-white'
                  : 'bg-(--bg-tertiary) hover:bg-(--accent-light)'
              } ${stats.history.length < option.days ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{
                color: selectedRange === option.value ? 'white' : 'var(--text-secondary)',
              }}
              title={stats.history.length < option.days ? 'Not enough data available' : ''}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg p-4 shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
          <div className="mb-2 flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-500" />
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {periodLabel} Total
            </span>
          </div>
          <NumberDisplay value={filteredStats.total} className="text-2xl font-bold" />
        </div>
        <StatCardWithNumber
          icon={<Calendar className="h-5 w-5 text-purple-500" />}
          label="Last 7 Days"
          value={stats.weekly || 0}
        />
        <StatCardWithNumber
          icon={<Activity className="h-5 w-5 text-green-500" />}
          label="Last 30 Days"
          value={stats.monthly || 0}
        />
      </div>

      {/* Trend Indicator */}
      <div className="rounded-lg p-4 shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
        <div className="flex items-center gap-4">
          <div
            className={cn('flex h-12 w-12 items-center justify-center rounded-full')}
            style={{
              backgroundColor:
                filteredStats.trend === 'up'
                  ? 'var(--success-light)'
                  : filteredStats.trend === 'down'
                    ? 'var(--error-light)'
                    : 'var(--bg-tertiary)',
            }}
          >
            {trendIcon}
          </div>
          <div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {periodLabel} Trend
            </p>
            <p
              className="text-lg font-semibold"
              style={{
                color:
                  filteredStats.trend === 'up'
                    ? 'var(--success)'
                    : filteredStats.trend === 'down'
                      ? 'var(--error)'
                      : 'var(--text-secondary)',
              }}
            >
              {filteredStats.trend === 'up' && '↑'}
              {filteredStats.trend === 'down' && '↓'}
              {filteredStats.trend === 'stable' && '→'} {filteredStats.trendPercentage.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 ? (
        <div className="rounded-lg p-6 shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
          <h3 className="mb-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Download History ({periodLabel})
          </h3>
          <div className="h-75">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  tickMargin={8}
                />
                <YAxis
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  tickFormatter={(value: number) => formatNumber(value)}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="downloads"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--accent)', strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div
          className="rounded-lg p-6 text-center"
          style={{ backgroundColor: 'var(--bg-tertiary)' }}
        >
          <p style={{ color: 'var(--text-muted)' }}>Download history chart not available</p>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Historical data temporarily unavailable
          </p>
        </div>
      )}
    </div>
  )
}
