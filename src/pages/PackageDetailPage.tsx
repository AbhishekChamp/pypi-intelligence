import { useState, useEffect, lazy, Suspense } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  usePackageOverview,
  useReleaseHistory,
  useCompatibilityMatrix,
  useHealthScore,
  useSearchHistory,
  useFavorites,
} from '@/hooks'
import { usePackageDataQuery, useDownloadStatsQuery, useDailyStatsQuery, useChangelogQuery } from '@/hooks/useQueryHooks'
import { usePackageSuggestions } from '@/hooks/usePackageSuggestions'
import { useURLState } from '@/hooks/useURLState'
import { Layout } from '@/components/Layout'
import { Tabs } from '@/components/Tabs'
import { SearchInput } from '@/components/SearchInput'
import { ErrorDisplay } from '@/components/ErrorDisplay'
import { PackageOverviewSkeleton, TabContentSkeleton } from '@/components/Skeleton'
import type { TabId, DownloadStats } from '@/types'
import { ArrowLeft, GitCompare, Heart } from 'lucide-react'
import { extractGitHubUrl, analyzeBundleStats } from '@/utils'

// Lazy load heavy components
const OverviewTab = lazy(() => import('@/components/OverviewTab').then(m => ({ default: m.OverviewTab })))
const VersionsTab = lazy(() => import('@/components/VersionsTab').then(m => ({ default: m.VersionsTab })))
const CompatibilityTab = lazy(() => import('@/components/CompatibilityTab').then(m => ({ default: m.CompatibilityTab })))
const DownloadsTab = lazy(() => import('@/components/DownloadsTab').then(m => ({ default: m.DownloadsTab })))
const HealthTab = lazy(() => import('@/components/HealthTab').then(m => ({ default: m.HealthTab })))
const InstallationTab = lazy(() => import('@/components/InstallationTab').then(m => ({ default: m.InstallationTab })))
const SecurityTab = lazy(() => import('@/components/SecurityTab').then(m => ({ default: m.SecurityTab })))
const DependenciesTab = lazy(() => import('@/components/DependenciesTab').then(m => ({ default: m.DependenciesTab })))
const ExportActions = lazy(() => import('@/components/ExportActions').then(m => ({ default: m.ExportActions })))
const MarkdownExportButton = lazy(() => import('@/components/MarkdownExport').then(m => ({ default: m.MarkdownExportButton })))
const ChangelogTab = lazy(() => import('@/components/ChangelogTab').then(m => ({ default: m.ChangelogTab })))
const BundleAnalysisTab = lazy(() => import('@/components/BundleAnalysisTab').then(m => ({ default: m.BundleAnalysisTab })))

export function PackageDetailPage() {
  const { packageName } = useParams<{ packageName: string }>()
  const [activeTab, setActiveTab] = useURLState<TabId>('tab', 'overview')

  // Use TanStack Query
  const { packageData, isLoading: packageLoading, error } = usePackageDataQuery(packageName || null)
  const { data: downloadStats, isLoading: downloadStatsLoading } = useDownloadStatsQuery(packageName || null)
  const { data: dailyStats, isLoading: dailyStatsLoading } = useDailyStatsQuery(packageName || null)
  const overview = usePackageOverview(packageData || null)
  const releases = useReleaseHistory(packageData || null)
  const compatibility = useCompatibilityMatrix(packageData || null)
  
  // Combine stats from both queries
  const [stats, setStats] = useState<DownloadStats | null>(null)
  
  useEffect(() => {
    if (downloadStats && dailyStats) {
      const history = dailyStats.data?.map((d: { date: string; downloads: number }) => ({
        date: d.date,
        downloads: d.downloads,
      })) || []
      
      // Calculate trend from history
      let trend: 'up' | 'down' | 'stable' = 'stable'
      let trendPercentage = 0
      
      if (history.length > 0) {
        const halfLength = Math.floor(history.length / 2)
        const firstHalf = history.slice(0, halfLength).reduce((sum: number, d: { downloads: number }) => sum + d.downloads, 0)
        const secondHalf = history.slice(halfLength).reduce((sum: number, d: { downloads: number }) => sum + d.downloads, 0)
        if (firstHalf > 0) {
          const change = ((secondHalf - firstHalf) / firstHalf) * 100
          trendPercentage = Math.abs(change)
          trend = change > 5 ? 'up' : change < -5 ? 'down' : 'stable'
        }
      }
      
      // Get API values
      let daily = downloadStats.data?.last_day ?? 0
      let weekly = downloadStats.data?.last_week ?? 0
      let monthly = downloadStats.data?.last_month ?? 0
      
      // Fallback: Calculate from history if API returns zeros
      if (history.length > 0) {
        if (weekly === 0) {
          // Sum last 7 days
          const last7Days = history.slice(-7)
          weekly = last7Days.reduce((sum: number, d: { downloads: number }) => sum + d.downloads, 0)
        }
        if (monthly === 0) {
          // Sum last 30 days
          const last30Days = history.slice(-30)
          monthly = last30Days.reduce((sum: number, d: { downloads: number }) => sum + d.downloads, 0)
        }
        if (daily === 0 && history.length > 0) {
          // Use last day's value
          daily = history[history.length - 1]?.downloads ?? 0
        }
      }
      
      setStats({
        daily,
        weekly,
        monthly,
        history,
        trend,
        trendPercentage,
      })
    } else {
      setStats(null)
    }
  }, [downloadStats, dailyStats])
  
  const statsLoading = downloadStatsLoading || dailyStatsLoading
  const health = useHealthScore(overview, compatibility, stats)
  const { addToHistory } = useSearchHistory()
  const { toggleFavorite, isFavorite } = useFavorites()
  
  // Fetch changelog
  const { data: changelog, isLoading: changelogLoading, error: changelogError } = useChangelogQuery(
    packageName || null,
    packageData || null
  )
  
  // Get GitHub URL for changelog
  const githubUrl = packageData ? extractGitHubUrl(packageData.info.project_urls || {}) : null

  // Add to history when package loads successfully
  useEffect(() => {
    if (packageData && packageName) {
      addToHistory({
        packageName: packageName,
        description: packageData.info.summary,
        version: packageData.info.version,
      })
    }
  }, [packageData, packageName, addToHistory])

  // Compute suggestions when package loads
  usePackageSuggestions(packageName || null)

  const handleSearch = (query: string) => {
    window.location.href = `/package/${query}`
  }

  const handleToggleFavorite = () => {
    if (packageName && packageData) {
      toggleFavorite({
        packageName: packageName,
        description: packageData.info.summary,
        version: packageData.info.version,
      })
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="mb-6">
          <SearchInput onSearch={handleSearch} loading={packageLoading} />
        </div>

        {error ? (
          <ErrorDisplay
            error={error instanceof Error ? error.message : String(error)}
            packageName={packageName}
            onSuggestionClick={(suggestion) => window.location.href = `/package/${suggestion}`}
          />
        ) : packageLoading ? (
          <PackageOverviewSkeleton />
        ) : (
          <div className="space-y-6">
            {/* Back Link & Compare & Favorite */}
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to search
              </Link>
              <div className="flex items-center gap-2">
                {packageData && (
                  <button
                    onClick={handleToggleFavorite}
                    className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                      isFavorite(packageName || '')
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite(packageName || '') ? 'fill-red-500' : ''}`} />
                    {isFavorite(packageName || '') ? 'Remove from Favorites' : 'Add to Favorites'}
                  </button>
                )}
                {overview && (
                  <Link
                    to={`/compare?p1=${overview.name}`}
                    className="flex items-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                  >
                    <GitCompare className="h-4 w-4" />
                    Compare
                  </Link>
                )}
                {packageData && (
                  <Suspense fallback={<div className="h-9 w-32 animate-pulse rounded-md bg-(--bg-tertiary)" />}>
                    <MarkdownExportButton packageData={packageData} healthScore={health} variant="outline" />
                  </Suspense>
                )}
              </div>
            </div>

            {/* Tabs Navigation */}
            {overview && <Tabs activeTab={activeTab} onTabChange={setActiveTab} />}

            {/* Tab Content */}
            <div className="py-4">
              <Suspense fallback={<TabContentSkeleton />}>
                {activeTab === 'overview' && (
                  <OverviewTab 
                    overview={overview} 
                    health={health} 
                    healthLoading={packageLoading || statsLoading}
                  />
                )}
                {activeTab === 'versions' && <VersionsTab releases={releases} />}
                {activeTab === 'dependencies' && (
                  <DependenciesTab 
                    packageName={packageName || ''} 
                    version={packageData?.info.version}
                    onPackageClick={(name) => window.location.href = `/package/${name}`}
                  />
                )}
                {activeTab === 'security' && (
                  <SecurityTab 
                    packageName={packageName || ''} 
                    version={packageData?.info.version}
                  />
                )}
                {activeTab === 'compatibility' && (
                  <CompatibilityTab compatibility={compatibility} />
                )}
                {activeTab === 'downloads' && (
                  <DownloadsTab stats={stats} loading={statsLoading} />
                )}
                {activeTab === 'health' && (
                  <HealthTab 
                    health={health} 
                    loading={packageLoading || statsLoading}
                  />
                )}
                {activeTab === 'install' && <InstallationTab data={packageData || null} />}
                {activeTab === 'changelog' && (
                  <ChangelogTab 
                    changelog={changelog || null}
                    loading={changelogLoading}
                    error={changelogError instanceof Error ? changelogError : null}
                    githubUrl={githubUrl}
                  />
                )}
                {activeTab === 'bundle' && (
                  <BundleAnalysisTab 
                    stats={packageData ? analyzeBundleStats(packageData.releases, packageData.info.version) : null}
                    releases={packageData?.releases || {}}
                    currentVersion={packageData?.info.version || ''}
                    loading={packageLoading}
                  />
                )}
              </Suspense>
            </div>

            {/* Export Actions - shown when data is loaded */}
            {packageData && (
              <div className="mt-8">
                <Suspense fallback={<div className="h-10 w-full animate-pulse rounded-md bg-(--bg-tertiary)" />}>
                  <ExportActions packageData={packageData} />
                </Suspense>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
