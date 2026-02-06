import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  usePackageData,
  usePackageOverview,
  useReleaseHistory,
  useCompatibilityMatrix,
  useDownloadStats,
  useHealthScore,
} from '@/hooks'
import { Layout } from '@/components/Layout'
import { Tabs } from '@/components/Tabs'
import { SearchInput } from '@/components/SearchInput'
import { ErrorDisplay } from '@/components/ErrorDisplay'
import { OverviewTab } from '@/components/OverviewTab'
import { VersionsTab } from '@/components/VersionsTab'
import { CompatibilityTab } from '@/components/CompatibilityTab'
import { DownloadsTab } from '@/components/DownloadsTab'
import { HealthTab } from '@/components/HealthTab'
import type { TabId } from '@/types'
import { ArrowLeft, GitCompare } from 'lucide-react'

export function PackageDetailPage() {
  const { packageName } = useParams<{ packageName: string }>()
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  const { data, loading: packageLoading, error } = usePackageData(packageName || null)
  const overview = usePackageOverview(data)
  const releases = useReleaseHistory(data)
  const compatibility = useCompatibilityMatrix(data)
  const { stats, loading: statsLoading } = useDownloadStats(packageName || null)
  const health = useHealthScore(overview, compatibility, stats)

  const handleSearch = (query: string) => {
    window.location.href = `/package/${query}`
  }

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="mb-6">
          <SearchInput onSearch={handleSearch} loading={packageLoading} />
        </div>

        {error ? (
          <ErrorDisplay error={error} />
        ) : (
          <div className="space-y-6">
            {/* Back Link & Compare */}
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to search
              </Link>
              {overview && (
                <Link
                  to={`/compare?p1=${overview.name}`}
                  className="flex items-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  <GitCompare className="h-4 w-4" />
                  Compare with another package
                </Link>
              )}
            </div>

            {/* Tabs Navigation */}
            {overview && <Tabs activeTab={activeTab} onTabChange={setActiveTab} />}

            {/* Tab Content */}
            <div className="py-4">
              {activeTab === 'overview' && (
                <OverviewTab overview={overview} health={health} />
              )}
              {activeTab === 'versions' && <VersionsTab releases={releases} />}
              {activeTab === 'compatibility' && (
                <CompatibilityTab compatibility={compatibility} />
              )}
              {activeTab === 'downloads' && (
                <DownloadsTab stats={stats} loading={statsLoading} />
              )}
              {activeTab === 'health' && <HealthTab health={health} />}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
