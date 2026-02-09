import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { SearchInput } from '@/components/SearchInput'
import { ErrorDisplay } from '@/components/ErrorDisplay'
import { PackageSuggestions } from '@/components/PackageSuggestions'
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
  Loader2,
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
      <div 
        className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8" 
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <h1 
          className="mb-6 text-2xl font-bold" 
          style={{ color: 'var(--text-primary)' }}
        >
          Compare Packages
        </h1>

        {/* Search Inputs */}
        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label 
              className="mb-2 block text-sm font-medium" 
              style={{ color: 'var(--text-secondary)' }}
            >
              Package 1
            </label>
            <SearchInput
              onSearch={setP1}
              placeholder="Enter first package name..."
            />
          </div>
          <div>
            <label 
              className="mb-2 block text-sm font-medium" 
              style={{ color: 'var(--text-secondary)' }}
            >
              Package 2
            </label>
            <SearchInput
              onSearch={setP2}
              placeholder="Enter second package name..."
            />
          </div>
        </div>

        {/* Suggestions - shown outside the grid to avoid layout issues */}
        {p1 && !p2 && (
          <div className="mb-6">
            <PackageSuggestions
              packageName={p1}
              onSelectSuggestion={setP2}
            />
          </div>
        )}

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
  const { data, loading: packageLoading, error } = usePackageData(packageName)
  const overview = usePackageOverview(data)
  const compatibility = useCompatibilityMatrix(data)
  const { stats, loading: statsLoading } = useDownloadStats(packageName)
  const health = useHealthScore(overview, compatibility, stats)

  // Check if stats are loading or health is being computed
  const isLoading = packageLoading || statsLoading
  const isHealthLoading = isLoading || (health.score === 0 && !data)

  if (packageLoading) {
    return (
      <div 
        className="h-96 animate-pulse rounded-lg" 
        style={{ backgroundColor: 'var(--bg-tertiary)' }}
      />
    )
  }

  if (error) {
    return <ErrorDisplay error={error} />
  }

  if (!overview) return null

  return (
    <div 
      className="rounded-lg p-6 shadow-sm" 
      style={{ backgroundColor: 'var(--card-bg)' }}
    >
      <div 
        className="mb-4 border-b pb-4" 
        style={{ borderColor: 'var(--border)' }}
      >
        <h2 
          className="text-xl font-bold" 
          style={{ color: 'var(--text-primary)' }}
        >
          {overview.name}
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>{overview.summary}</p>
      </div>

      {/* Health Score */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <span 
            className="text-sm font-medium" 
            style={{ color: 'var(--text-secondary)' }}
          >
            Health Score
          </span>
          {isHealthLoading ? (
            <span 
              className="inline-flex items-center text-sm" 
              style={{ color: 'var(--text-muted)' }}
            >
              <Loader2 className="mr-1 inline h-4 w-4 animate-spin" />
              Computing...
            </span>
          ) : (
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
          )}
        </div>
        <div 
          className="h-2 rounded-full" 
          style={{ backgroundColor: 'var(--bg-tertiary)' }}
        >
          {isHealthLoading ? (
            <div 
              className="h-full w-full animate-pulse rounded-full" 
              style={{ backgroundColor: 'var(--border)' }}
            />
          ) : (
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
          )}
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
          value={statsLoading ? 'Loading...' : formatNumber(stats?.monthly || 0)}
          isLoading={statsLoading}
        />
        <ComparisonStat
          icon={<Package className="h-4 w-4" />}
          label="Version"
          value={overview.version}
        />
      </div>

      {/* Platform Support */}
      <div className="mb-4">
        <h4 
          className="mb-2 text-sm font-medium" 
          style={{ color: 'var(--text-secondary)' }}
        >
          Platform Support
        </h4>
        <div className="flex gap-2">
          <PlatformIcon supported={compatibility.platforms.linux} icon={<Container className="h-4 w-4" />} label="Linux" />
          <PlatformIcon supported={compatibility.platforms.macos} icon={<Apple className="h-4 w-4" />} label="macOS" />
          <PlatformIcon supported={compatibility.platforms.windows} icon={<Monitor className="h-4 w-4" />} label="Windows" />
        </div>
      </div>

      {/* Warnings */}
      {!isHealthLoading && health.warnings.length > 0 && (
        <div 
          className="rounded-md p-3" 
          style={{ backgroundColor: 'var(--warning-light)' }}
        >
          <div className="mb-1 flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" style={{ color: 'var(--warning)' }} />
            <span 
              className="text-xs font-medium" 
              style={{ color: 'var(--warning)' }}
            >
              Warnings
            </span>
          </div>
          <ul 
            className="list-inside list-disc text-xs" 
            style={{ color: 'var(--warning)' }}
          >
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
  isLoading = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  isLoading?: boolean
}) {
  return (
    <div 
      className="rounded-md p-3" 
      style={{ backgroundColor: 'var(--bg-tertiary)' }}
    >
      <div 
        className="mb-1 flex items-center gap-1" 
        style={{ color: 'var(--text-muted)' }}
      >
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p 
        className={`text-sm font-medium ${isLoading ? 'animate-pulse' : ''}`} 
        style={{ color: 'var(--text-primary)' }}
      >
        {value}
      </p>
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
        supported 
          ? 'bg-green-100 text-green-800' 
          : 'text-gray-500'
      )}
      style={{
        backgroundColor: supported ? 'var(--success-light)' : 'var(--bg-tertiary)',
        color: supported ? 'var(--success)' : 'var(--text-muted)'
      }}
    >
      {icon}
      {label}
    </div>
  )
}
