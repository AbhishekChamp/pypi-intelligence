import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { SearchInput } from '@/components/SearchInput'
import { ErrorDisplay } from '@/components/ErrorDisplay'
import {
  usePackageData,
  usePackageOverview,
  useCompatibilityMatrix,
  useDownloadStats,
  useHealthScore,
} from '@/hooks'

import { cn, formatNumber, formatDate } from '@/utils'
import {
  AlertTriangle,
  Package,
  Clock,
  Users,
  Download,
  Container,
  Apple,
  Monitor,
} from 'lucide-react'

export function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [p1, setP1] = useState(searchParams.get('p1') || '')
  const [p2, setP2] = useState(searchParams.get('p2') || '')

  useEffect(() => {
    const params = new URLSearchParams()
    if (p1) params.set('p1', p1)
    if (p2) params.set('p2', p2)
    setSearchParams(params)
  }, [p1, p2, setSearchParams])

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Compare Packages</h1>

        {/* Search Inputs */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Package 1</label>
            <SearchInput
              onSearch={setP1}
              placeholder="Enter first package name..."
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Package 2</label>
            <SearchInput
              onSearch={setP2}
              placeholder="Enter second package name..."
            />
          </div>
        </div>

        {/* Comparison Results */}
        {(p1 || p2) && (
          <div className="grid gap-4 lg:grid-cols-2">
            {p1 && <PackageComparisonCard packageName={p1} />}
            {p2 && <PackageComparisonCard packageName={p2} />}
          </div>
        )}
      </div>
    </Layout>
  )
}

function PackageComparisonCard({ packageName }: { packageName: string }) {
  const { data, loading, error } = usePackageData(packageName)
  const overview = usePackageOverview(data)
  const compatibility = useCompatibilityMatrix(data)
  const { stats } = useDownloadStats(packageName)
  const health = useHealthScore(overview, compatibility, stats)

  if (loading) {
    return (
      <div className="h-96 animate-pulse rounded-lg bg-gray-200" />
    )
  }

  if (error) {
    return <ErrorDisplay error={error} />
  }

  if (!overview) return null

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-4 border-b pb-4">
        <h2 className="text-xl font-bold text-gray-900">{overview.name}</h2>
        <p className="text-gray-600">{overview.summary}</p>
      </div>

      {/* Health Score */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Health Score</span>
          <span
            className={cn(
              'text-lg font-bold',
              health.rating === 'excellent' && 'text-green-600',
              health.rating === 'good' && 'text-blue-600',
              health.rating === 'fair' && 'text-yellow-600',
              health.rating === 'poor' && 'text-red-600'
            )}
          >
            {health.score}/100
          </span>
        </div>
        <div className="h-2 rounded-full bg-gray-200">
          <div
            className={cn(
              'h-full rounded-full',
              health.rating === 'excellent' && 'bg-green-500',
              health.rating === 'good' && 'bg-blue-500',
              health.rating === 'fair' && 'bg-yellow-500',
              health.rating === 'poor' && 'bg-red-500'
            )}
            style={{ width: `${health.score}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <ComparisonStat
          icon={<Clock className="h-4 w-4" />}
          label="Last Release"
          value={formatDate(overview.lastReleaseDate)}
        />
        <ComparisonStat
          icon={<Users className="h-4 w-4" />}
          label="Maintainers"
          value={overview.maintainerCount.toString()}
        />
        <ComparisonStat
          icon={<Download className="h-4 w-4" />}
          label="Monthly Downloads"
          value={formatNumber(stats?.monthly || 0)}
        />
        <ComparisonStat
          icon={<Package className="h-4 w-4" />}
          label="Version"
          value={overview.version}
        />
      </div>

      {/* Platform Support */}
      <div className="mb-4">
        <h4 className="mb-2 text-sm font-medium text-gray-700">Platform Support</h4>
        <div className="flex gap-2">
          <PlatformIcon supported={compatibility.platforms.linux} icon={<Container className="h-4 w-4" />} label="Linux" />
          <PlatformIcon supported={compatibility.platforms.macos} icon={<Apple className="h-4 w-4" />} label="macOS" />
          <PlatformIcon supported={compatibility.platforms.windows} icon={<Monitor className="h-4 w-4" />} label="Windows" />
        </div>
      </div>

      {/* Warnings */}
      {health.warnings.length > 0 && (
        <div className="rounded-md bg-yellow-50 p-3">
          <div className="mb-1 flex items-center gap-1">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-xs font-medium text-yellow-900">Warnings</span>
          </div>
          <ul className="list-inside list-disc text-xs text-yellow-800">
            {health.warnings.slice(0, 2).map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function ComparisonStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-md bg-gray-50 p-3">
      <div className="mb-1 flex items-center gap-1 text-gray-500">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  )
}

function PlatformIcon({
  supported,
  icon,
  label,
}: {
  supported: boolean
  icon: React.ReactNode
  label: string
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded px-2 py-1 text-xs',
        supported ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
      )}
    >
      {icon}
      {label}
    </div>
  )
}
