import { useState, useEffect } from 'react'
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

export function DownloadTrendComparison() {
  const [packages, setPackages] = useState<string[]>([])
  const [newPackage, setNewPackage] = useState('')
  const [trends, setTrends] = useState<PackageTrend[]>([])
  const [loading, setLoading] = useState(false)
  const [chartData, setChartData] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<'line' | 'area'>('line')

  const addPackage = async () => {
    if (!newPackage.trim() || packages.includes(newPackage.trim().toLowerCase())) return

    const pkgName = newPackage.trim().toLowerCase()
    setPackages([...packages, pkgName])
    setNewPackage('')
    setLoading(true)

    try {
      const data = await fetchDailyStats(pkgName, 30)
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

  // Process data for chart
  useEffect(() => {
    if (trends.length === 0) {
      setChartData([])
      return
    }

    // Get all unique dates
    const allDates = new Set<string>()
    trends.forEach(trend => {
      trend.data.data.forEach(day => {
        allDates.add(day.date)
      })
    })

    // Sort dates
    const sortedDates = Array.from(allDates).sort()

    // Build chart data
    const data = sortedDates.map(date => {
      const point: any = { date }
      trends.forEach(trend => {
        const dayData = trend.data.data.find(d => d.date === date)
        point[trend.name] = dayData?.downloads || 0
      })
      return point
    })

    setChartData(data)
  }, [trends])

  const calculateTrend = (trend: PackageTrend): { direction: 'up' | 'down' | 'stable'; percentage: number } => {
    const data = trend.data.data
    if (data.length < 2) return { direction: 'stable', percentage: 0 }

    const firstWeek = data.slice(0, 7).reduce((sum, d) => sum + d.downloads, 0) / 7
    const lastWeek = data.slice(-7).reduce((sum, d) => sum + d.downloads, 0) / 7

    if (firstWeek === 0) return { direction: 'stable', percentage: 0 }

    const change = ((lastWeek - firstWeek) / firstWeek) * 100
    const direction = change > 5 ? 'up' : change < -5 ? 'down' : 'stable'

    return { direction, percentage: Math.abs(change) }
  }

  const getTotalDownloads = (trend: PackageTrend): number => {
    return trend.data.data.reduce((sum, day) => sum + day.downloads, 0)
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
        <div className="flex items-center justify-between">
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
          </div>
          <button
            onClick={exportData}
            className="flex items-center gap-2 rounded-lg bg-(--bg-tertiary) px-3 py-1.5 text-sm transition-colors hover:bg-(--accent-light)"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
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
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                  itemStyle={{ color: 'var(--text-secondary)' }}
                />
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
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                  itemStyle={{ color: 'var(--text-secondary)' }}
                />
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
            const trendInfo = calculateTrend(trend)
            const total = getTotalDownloads(trend)

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
                      Total Downloads (30d)
                    </span>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {total.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Trend</span>
                    <div className="flex items-center gap-1">
                      {trendInfo.direction === 'up' && (
                        <>
                          <TrendingUp className="h-4 w-4" style={{ color: 'var(--success)' }} />
                          <span style={{ color: 'var(--success)' }}>+{trendInfo.percentage.toFixed(1)}%</span>
                        </>
                      )}
                      {trendInfo.direction === 'down' && (
                        <>
                          <TrendingDown className="h-4 w-4" style={{ color: 'var(--error)' }} />
                          <span style={{ color: 'var(--error)' }}>-{trendInfo.percentage.toFixed(1)}%</span>
                        </>
                      )}
                      {trendInfo.direction === 'stable' && (
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
                      {Math.round(total / 30).toLocaleString()}
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
            Add packages above to compare their download statistics over the last 30 days
          </p>
        </div>
      )}
    </div>
  )
}
