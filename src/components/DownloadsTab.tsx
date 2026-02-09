import { formatNumber, cn } from '@/utils'
import type { DownloadStats } from '@/types'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  Calendar,
  Activity,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface DownloadsTabProps {
  stats: DownloadStats | null
  loading?: boolean
}

export function DownloadsTab({ stats, loading }: DownloadsTabProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-48 animate-pulse rounded-lg" style={{ backgroundColor: 'var(--border)' }} />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 animate-pulse rounded-lg" style={{ backgroundColor: 'var(--border)' }} />
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="rounded-lg p-8 text-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <p style={{ color: 'var(--text-muted)' }}>No download statistics available</p>
      </div>
    )
  }

  const trendIcon =
    stats.trend === 'up' ? (
      <TrendingUp className="h-5 w-5" style={{ color: 'var(--success)' }} />
    ) : stats.trend === 'down' ? (
      <TrendingDown className="h-5 w-5" style={{ color: 'var(--error)' }} />
    ) : (
      <Minus className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
    )

  const chartData = stats.history.map(h => ({
    date: new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    downloads: h.downloads,
  }))

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Download className="h-5 w-5 text-blue-500" />}
          label="Daily Downloads"
          value={formatNumber(stats.daily)}
        />
        <StatCard
          icon={<Calendar className="h-5 w-5 text-purple-500" />}
          label="Weekly Downloads"
          value={formatNumber(stats.weekly)}
        />
        <StatCard
          icon={<Activity className="h-5 w-5 text-green-500" />}
          label="Monthly Downloads"
          value={formatNumber(stats.monthly)}
        />
      </div>

      {/* Trend Indicator */}
      <div className="rounded-lg p-4 shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full'
            )}
            style={{
              backgroundColor: stats.trend === 'up' ? 'var(--success-light)' : stats.trend === 'down' ? 'var(--error-light)' : 'var(--bg-tertiary)'
            }}
          >
            {trendIcon}
          </div>
          <div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>30-Day Trend</p>
            <p
              className="text-lg font-semibold"
              style={{
                color: stats.trend === 'up' ? 'var(--success)' : stats.trend === 'down' ? 'var(--error)' : 'var(--text-secondary)'
              }}
            >
              {stats.trend === 'up' && '↑'}
              {stats.trend === 'down' && '↓'}
              {stats.trend === 'stable' && '→'} {stats.trendPercentage.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 ? (
        <div className="rounded-lg p-6 shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
          <h3 className="mb-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Download History (30 Days)</h3>
          <div className="h-[300px]">
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
                <Tooltip
                  formatter={(value: number) => [formatNumber(value), 'Downloads']}
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--text-primary)'
                  }}
                />
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
        <div className="rounded-lg p-6 text-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          <p style={{ color: 'var(--text-muted)' }}>Download history chart not available</p>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>Historical data temporarily unavailable</p>
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg p-4 shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</span>
      </div>
      <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
    </div>
  )
}
