import { cn } from '@/utils'
import type { HealthScore } from '@/types'
import {
  Clock,
  Users,
  Cpu,
  TrendingUp,
  Shield,
  CheckCircle,
  AlertTriangle,
  Activity,
} from 'lucide-react'

interface HealthTabProps {
  health: HealthScore
  loading?: boolean
}

export function HealthTab({ health, loading = false }: HealthTabProps) {
  // Show loading state while computing health
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto mb-6 h-24 w-24">
            <Activity className="h-24 w-24 animate-pulse" style={{ color: 'var(--accent)' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 animate-spin rounded-full border-4" style={{ borderColor: 'var(--accent-light)', borderTopColor: 'var(--accent)' }} />
            </div>
          </div>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Computing Health Score...</h3>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Analyzing package metrics, download trends, and compatibility
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <span className="h-2 w-2 animate-bounce rounded-full" style={{ backgroundColor: 'var(--accent)', animationDelay: '0ms' }} />
            <span className="h-2 w-2 animate-bounce rounded-full" style={{ backgroundColor: 'var(--accent)', animationDelay: '150ms' }} />
            <span className="h-2 w-2 animate-bounce rounded-full" style={{ backgroundColor: 'var(--accent)', animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    )
  }
  const scoreColor =
    health.rating === 'excellent'
      ? 'text-green-600'
      : health.rating === 'good'
        ? 'text-blue-600'
        : health.rating === 'fair'
          ? 'text-yellow-600'
          : 'text-red-600'

  const scoreBg =
    health.rating === 'excellent'
      ? 'bg-green-100'
      : health.rating === 'good'
        ? 'bg-blue-100'
        : health.rating === 'fair'
          ? 'bg-yellow-100'
          : 'bg-red-100'

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className={cn('rounded-xl p-8 text-center')} style={{ backgroundColor: scoreBg === 'bg-green-100' ? 'var(--success-light)' : scoreBg === 'bg-blue-100' ? 'var(--accent-light)' : scoreBg === 'bg-yellow-100' ? 'var(--warning-light)' : 'var(--error-light)' }}>
        <div className="mb-4 inline-flex h-32 w-32 items-center justify-center rounded-full shadow-lg" style={{ backgroundColor: 'var(--card-bg)' }}>
          <span className={cn('text-5xl font-bold')} style={{ color: scoreColor === 'text-green-600' ? 'var(--success)' : scoreColor === 'text-blue-600' ? 'var(--accent)' : scoreColor === 'text-yellow-600' ? 'var(--warning)' : 'var(--error)' }}>{health.score}</span>
        </div>
        <h3 className={cn('text-2xl font-bold capitalize')} style={{ color: scoreColor === 'text-green-600' ? 'var(--success)' : scoreColor === 'text-blue-600' ? 'var(--accent)' : scoreColor === 'text-yellow-600' ? 'var(--warning)' : 'var(--error)' }}>{health.rating}</h3>
        <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
          {health.rating === 'excellent' && 'This package is production-ready with excellent metrics'}
          {health.rating === 'good' && 'This package is suitable for production use'}
          {health.rating === 'fair' && 'This package has some concerns - review before use'}
          {health.rating === 'poor' && 'This package has significant issues - use with caution'}
        </p>
      </div>

      {/* Score Breakdown */}
      <div className="rounded-lg p-6 shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
        <h3 className="mb-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Score Breakdown</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <ScoreItem
            icon={<Clock className="h-5 w-5" />}
            label="Recency"
            score={health.breakdown.recency}
            max={25}
            description="Based on last release date"
          />
          <ScoreItem
            icon={<Users className="h-5 w-5" />}
            label="Maintenance"
            score={health.breakdown.maintenance}
            max={20}
            description="Based on maintainer count"
          />
          <ScoreItem
            icon={<Cpu className="h-5 w-5" />}
            label="Compatibility"
            score={health.breakdown.compatibility}
            max={25}
            description="Based on wheel availability"
          />
          <ScoreItem
            icon={<TrendingUp className="h-5 w-5" />}
            label="Popularity"
            score={health.breakdown.popularity}
            max={20}
            description="Based on download stats"
          />
          <ScoreItem
            icon={<Shield className="h-5 w-5" />}
            label="Stability"
            score={health.breakdown.stability}
            max={10}
            description="Based on yanked status"
          />
        </div>
      </div>

      {/* Warnings */}
      {health.warnings.length > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-900">Warnings</h3>
          </div>
          <ul className="space-y-2">
            {health.warnings.map((warning, i) => (
              <li key={i} className="flex items-start gap-2 text-yellow-800">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-yellow-600" />
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {health.recommendations.length > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Recommendations</h3>
          </div>
          <ul className="space-y-2">
            {health.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-blue-800">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Rating Legend */}
      <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <h4 className="mb-3 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Rating Scale</h4>
        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span style={{ color: 'var(--text-primary)' }}>85-100: Excellent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span style={{ color: 'var(--text-primary)' }}>70-84: Good</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <span style={{ color: 'var(--text-primary)' }}>50-69: Fair</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span style={{ color: 'var(--text-primary)' }}>0-49: Poor</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScoreItem({
  icon,
  label,
  score,
  max,
  description,
}: {
  icon: React.ReactNode
  label: string
  score: number
  max: number
  description: string
}) {
  const percentage = (score / max) * 100
  const color =
    percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-blue-500' : 'bg-yellow-500'
  const colorVar =
    percentage >= 80 ? 'var(--success)' : percentage >= 60 ? 'var(--accent)' : 'var(--warning)'

  return (
    <div className="rounded-lg p-4" style={{ borderColor: 'var(--border)', borderWidth: '1px' }}>
      <div className="mb-2 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="mb-1 flex items-baseline gap-1">
        <span
          className={cn('text-2xl font-bold')}
          style={{ color: colorVar }}
        >
          {score}
        </span>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/{max}</span>
      </div>
      <div className="mb-2 h-2 rounded-full" style={{ backgroundColor: 'var(--border)' }}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{description}</p>
    </div>
  )
}
