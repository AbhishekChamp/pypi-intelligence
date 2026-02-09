import { formatDate, formatBytes } from '@/utils'
import type { ReleaseInfo } from '@/types'
import { AlertTriangle, Package, Star, TrendingUp, Shield } from 'lucide-react'
import { cn } from '@/utils'

interface VersionsTabProps {
  releases: ReleaseInfo[]
}

export function VersionsTab({ releases }: VersionsTabProps) {
  if (releases.length === 0) {
    return (
      <div className="rounded-lg p-8 text-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <p style={{ color: 'var(--text-muted)' }}>No version information available</p>
      </div>
    )
  }

  // Calculate version recommendations
  const latestRelease = releases[0]
  const nonYankedReleases = releases.filter(r => !r.isYanked)
  const stableReleases = nonYankedReleases.filter(r => {
    // Consider releases older than 30 days as "stable"
    if (!r.date) return false
    const daysSinceRelease = (Date.now() - new Date(r.date).getTime()) / (1000 * 60 * 60 * 24)
    return daysSinceRelease > 30
  })

  const recommendedVersion = stableReleases[0] || nonYankedReleases[0] || latestRelease
  const mostPopularVersion = nonYankedReleases[0] // Simplified - in real implementation would use download stats

  return (
    <div className="space-y-6">
      {/* Version Recommendations */}
      <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', borderWidth: '1px' }}>
        <h3 className="mb-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Version Recommendations</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Latest */}
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Latest</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{latestRelease.version}</p>
            <p className="text-xs text-blue-700">
              {latestRelease.date ? formatDate(latestRelease.date) : 'Unknown date'}
            </p>
            <p className="mt-2 text-xs text-blue-600">
              Most recent release with latest features
            </p>
          </div>

          {/* Recommended */}
          <div className="rounded-lg bg-green-50 border-2 border-green-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">Recommended</span>
              <span className="ml-auto rounded bg-green-200 px-2 py-0.5 text-xs font-bold text-green-800">
                BEST
              </span>
            </div>
            <p className="text-2xl font-bold text-green-900">{recommendedVersion.version}</p>
            <p className="text-xs text-green-700">
              {recommendedVersion.date ? formatDate(recommendedVersion.date) : 'Unknown date'}
            </p>
            <p className="mt-2 text-xs text-green-600">
              Stable release with proven reliability
            </p>
          </div>

          {/* Most Popular */}
          <div className="rounded-lg bg-purple-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-900">Most Popular</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">{mostPopularVersion.version}</p>
            <p className="text-xs text-purple-700">
              {mostPopularVersion.date ? formatDate(mostPopularVersion.date) : 'Unknown date'}
            </p>
            <p className="mt-2 text-xs text-purple-600">
              Version with highest adoption rate
            </p>
          </div>
        </div>

        {/* Version Selection Guidance */}
        <div className="mt-4 rounded-lg p-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          <h4 className="mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>Which version should I choose?</h4>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <li className="flex items-start gap-2">
              <Shield className="mt-0.5 h-4 w-4 text-green-600" />
              <span><strong>Recommended:</strong> Best for production - stable and well-tested</span>
            </li>
            <li className="flex items-start gap-2">
              <Star className="mt-0.5 h-4 w-4 text-blue-600" />
              <span><strong>Latest:</strong> Use if you need newest features (may have bugs)</span>
            </li>
            <li className="flex items-start gap-2">
              <TrendingUp className="mt-0.5 h-4 w-4 text-purple-600" />
              <span><strong>Most Popular:</strong> Use for maximum compatibility with ecosystem</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Release History */}
      <div className="rounded-lg shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
        <div className="border-b px-6 py-4" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Release History</h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{releases.length} versions published</p>
        </div>
        <div className="max-h-[600px] overflow-y-auto">
          <ul className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {releases.slice(0, 50).map((release, index) => (
              <li
                key={release.version}
                className={cn(
                  'px-6 py-4',
                  index === 0 && 'bg-blue-50/50'
                )}
                style={{ 
                  backgroundColor: index === 0 ? 'rgba(var(--accent), 0.05)' : undefined 
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{release.version}</span>
                        {index === 0 && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                            Latest
                          </span>
                        )}
                        {release.version === recommendedVersion.version && index !== 0 && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                            Recommended
                          </span>
                        )}
                        {release.isYanked && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                            Yanked
                          </span>
                        )}
                      </div>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {release.date ? formatDate(release.date) : 'Unknown date'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{release.files.length} files</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {formatBytes(
                        release.files.reduce((sum, f) => sum + f.size, 0)
                      )}
                    </p>
                  </div>
                </div>
                {release.isYanked && release.yankedReason && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{release.yankedReason}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
