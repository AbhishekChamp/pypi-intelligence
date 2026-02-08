import { cn, formatDate, timeAgo } from '@/utils'
import type { PackageOverview, HealthScore } from '@/types'
import {
  User,
  Clock,
  Shield,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Users,
  Loader2,
} from 'lucide-react'

interface OverviewTabProps {
  overview: PackageOverview | null
  health: HealthScore
  healthLoading?: boolean
}

export function OverviewTab({ overview, health, healthLoading = false }: OverviewTabProps) {
  if (!overview) return null

  // Check if health is still being computed (score is 0 and no meaningful data yet)
  const isHealthLoading = healthLoading || (health.score === 0 && health.breakdown.popularity === 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{overview.name}</h2>
            <p className="mt-1 text-lg text-gray-600">{overview.summary}</p>
          </div>
          <div className="flex items-center gap-2">
            {isHealthLoading ? (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                <Loader2 className="mr-1 inline h-4 w-4 animate-spin" />
                Computing Health...
              </span>
            ) : (
              <span
                className={cn(
                  'rounded-full px-3 py-1 text-sm font-medium',
                  health.rating === 'excellent' && 'bg-green-100 text-green-800',
                  health.rating === 'good' && 'bg-blue-100 text-blue-800',
                  health.rating === 'fair' && 'bg-yellow-100 text-yellow-800',
                  health.rating === 'poor' && 'bg-red-100 text-red-800'
                )}
              >
                {health.rating === 'excellent' && <CheckCircle className="mr-1 inline h-4 w-4" />}
                {health.rating === 'poor' && <AlertTriangle className="mr-1 inline h-4 w-4" />}
                Health: {health.score}/100
              </span>
            )}
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
              v{overview.version}
            </span>
          </div>
        </div>

        {overview.isYanked && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <p className="ml-3 text-sm font-medium text-red-800">
                This version has been yanked from PyPI
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Clock className="h-5 w-5 text-blue-500" />}
          label="Last Release"
          value={timeAgo(overview.lastReleaseDate)}
          subtext={formatDate(overview.lastReleaseDate)}
        />
        <StatCard
          icon={<Users className="h-5 w-5 text-purple-500" />}
          label="Maintainers"
          value={overview.maintainerCount.toString()}
          subtext={overview.maintainerCount === 1 ? 'Single maintainer' : 'Active team'}
        />
        <StatCard
          icon={<Shield className="h-5 w-5 text-green-500" />}
          label="License"
          value={overview.license || 'Unknown'}
        />
        <StatCard
          icon={<User className="h-5 w-5 text-orange-500" />}
          label="Author"
          value={overview.author || 'Unknown'}
        />
      </div>

      {/* Project Links */}
      {Object.keys(overview.projectUrls).length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Project Links</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(overview.projectUrls).map(([label, url]) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                {label}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Warnings & Recommendations */}
      {!isHealthLoading && (health.warnings.length > 0 || health.recommendations.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {health.warnings.length > 0 && (
            <div className="rounded-lg bg-yellow-50 p-4">
              <h4 className="mb-2 font-semibold text-yellow-900">Warnings</h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-yellow-800">
                {health.warnings.map((warning, i) => (
                  <li key={i}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
          {health.recommendations.length > 0 && (
            <div className="rounded-lg bg-blue-50 p-4">
              <h4 className="mb-2 font-semibold text-blue-900">Recommendations</h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-blue-800">
                {health.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  subtext,
}: {
  icon: React.ReactNode
  label: string
  value: string
  subtext?: string
}) {
  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
      {subtext && <p className="text-xs text-gray-400">{subtext}</p>}
    </div>
  )
}
