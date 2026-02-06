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
        <div className="h-48 animate-pulse rounded-lg bg-gray-200" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="rounded-lg bg-gray-50 p-8 text-center">
        <p className="text-gray-500">No download statistics available</p>
      </div>
    )
  }

  const trendIcon =
    stats.trend === 'up' ? (
      <TrendingUp className="h-5 w-5 text-green-500" />
    ) : stats.trend === 'down' ? (
      <TrendingDown className="h-5 w-5 text-red-500" />
    ) : (
      <Minus className="h-5 w-5 text-gray-400" />
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
      <div className="rounded-lg bg-white p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full',
              stats.trend === 'up' && 'bg-green-100',
              stats.trend === 'down' && 'bg-red-100',
              stats.trend === 'stable' && 'bg-gray-100'
            )}
          >
            {trendIcon}
          </div>
          <div>
            <p className="text-sm text-gray-500">30-Day Trend</p>
            <p
              className={cn(
                'text-lg font-semibold',
                stats.trend === 'up' && 'text-green-600',
                stats.trend === 'down' && 'text-red-600',
                stats.trend === 'stable' && 'text-gray-600'
              )}
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
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Download History (30 Days)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickMargin={8}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickFormatter={(value: number) => formatNumber(value)}
                />
                <Tooltip
                  formatter={(value: number) => [formatNumber(value), 'Downloads']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="downloads"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-gray-50 p-6 text-center">
          <p className="text-gray-500">Download history chart not available</p>
          <p className="mt-1 text-sm text-gray-400">Historical data temporarily unavailable</p>
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
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
