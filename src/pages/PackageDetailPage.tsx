import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  usePackageData,
  usePackageOverview,
  useReleaseHistory,
  useCompatibilityMatrix,
  useDownloadStats,
  useHealthScore,
  useSearchHistory,
  useFavorites,
} from '@/hooks'
import { usePackageSuggestions } from '@/hooks/usePackageSuggestions'
import { Layout } from '@/components/Layout'
import { Tabs } from '@/components/Tabs'
import { SearchInput } from '@/components/SearchInput'
import { ErrorDisplay } from '@/components/ErrorDisplay'
import { OverviewTab } from '@/components/OverviewTab'
import { VersionsTab } from '@/components/VersionsTab'
import { CompatibilityTab } from '@/components/CompatibilityTab'
import { DownloadsTab } from '@/components/DownloadsTab'
import { HealthTab } from '@/components/HealthTab'
import { InstallationTab } from '@/components/InstallationTab'
import { SecurityTab } from '@/components/SecurityTab'
import { DependenciesTab } from '@/components/DependenciesTab'
import { ExportActions } from '@/components/ExportActions'
import type { TabId } from '@/types'
import { ArrowLeft, GitCompare, Heart } from 'lucide-react'

export function PackageDetailPage() {
  const { packageName } = useParams<{ packageName: string }>()
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  const { data, loading: packageLoading, error } = usePackageData(packageName || null)
  const overview = usePackageOverview(data)
  const releases = useReleaseHistory(data)
  const compatibility = useCompatibilityMatrix(data)
  const { stats, loading: statsLoading } = useDownloadStats(packageName || null)
  const health = useHealthScore(overview, compatibility, stats)
  const { addToHistory } = useSearchHistory()
  const { toggleFavorite, isFavorite } = useFavorites()

  // Add to history when package loads successfully
  useEffect(() => {
    if (data && packageName) {
      addToHistory({
        packageName: packageName,
        description: data.info.summary,
        version: data.info.version,
      })
    }
  }, [data, packageName, addToHistory])

  // Compute suggestions when package loads
  usePackageSuggestions(packageName || null)

  const handleSearch = (query: string) => {
    window.location.href = `/package/${query}`
  }

  const handleToggleFavorite = () => {
    if (packageName && data) {
      toggleFavorite({
        packageName: packageName,
        description: data.info.summary,
        version: data.info.version,
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
            error={error} 
            packageName={packageName}
            onSuggestionClick={(suggestion) => window.location.href = `/package/${suggestion}`}
          />
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
                {data && (
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
              </div>
            </div>

            {/* Tabs Navigation */}
            {overview && <Tabs activeTab={activeTab} onTabChange={setActiveTab} />}

            {/* Tab Content */}
            <div className="py-4">
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
                  version={data?.info.version}
                  onPackageClick={(name) => window.location.href = `/package/${name}`}
                />
              )}
              {activeTab === 'security' && (
                <SecurityTab 
                  packageName={packageName || ''} 
                  version={data?.info.version}
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
              {activeTab === 'install' && <InstallationTab data={data} />}
            </div>

            {/* Export Actions - shown when data is loaded */}
            {data && (
              <div className="mt-8">
                <ExportActions packageData={data} />
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
