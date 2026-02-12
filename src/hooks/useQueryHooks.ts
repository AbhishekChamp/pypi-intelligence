import { useQuery } from '@tanstack/react-query'
import {
  fetchPackageInfo,
  fetchDownloadStats,
  fetchDailyStats,
  fetchDependencyTree,
  fetchSecurityVulnerabilities,
} from '@/api/pypi'
import type { PyPIPackage } from '@/types'
import type { OSVVulnerability } from '@/api/pypi'

// Query keys for cache management
export const queryKeys = {
  package: (name: string) => ['package', name.toLowerCase()],
  downloadStats: (name: string) => ['downloadStats', name.toLowerCase()],
  dailyStats: (name: string) => ['dailyStats', name.toLowerCase()],
  dependencies: (name: string, version?: string) => ['dependencies', name.toLowerCase(), version || 'latest'],
  security: (name: string, version?: string) => ['security', name.toLowerCase(), version || 'all'],
}

// Hook for fetching package info with TanStack Query
export function usePackageQuery(packageName: string | null) {
  return useQuery<PyPIPackage>({
    queryKey: queryKeys.package(packageName || ''),
    queryFn: () => fetchPackageInfo(packageName!),
    enabled: !!packageName && packageName.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Hook for fetching download statistics
export function useDownloadStatsQuery(packageName: string | null) {
  return useQuery({
    queryKey: queryKeys.downloadStats(packageName || ''),
    queryFn: () => fetchDownloadStats(packageName!),
    enabled: !!packageName && packageName.length > 0,
    staleTime: 1000 * 60 * 10, // 10 minutes for stats
    // Retry failed requests up to 3 times with exponential backoff
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('404')) {
        return false // Don't retry 404s
      }
      return failureCount < 3
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  })
}

// Hook for fetching daily download history
export function useDailyStatsQuery(packageName: string | null) {
  return useQuery({
    queryKey: queryKeys.dailyStats(packageName || ''),
    queryFn: () => fetchDailyStats(packageName!),
    enabled: !!packageName && packageName.length > 0,
    staleTime: 1000 * 60 * 30, // 30 minutes for historical data
  })
}

// Combined hook for all package-related queries
export function usePackageDataQuery(packageName: string | null) {
  const packageQuery = usePackageQuery(packageName)
  const downloadStatsQuery = useDownloadStatsQuery(packageName)
  const dailyStatsQuery = useDailyStatsQuery(packageName)

  const isLoading = packageQuery.isLoading || downloadStatsQuery.isLoading || dailyStatsQuery.isLoading
  const isError = packageQuery.isError || downloadStatsQuery.isError || dailyStatsQuery.isError
  const error = packageQuery.error || downloadStatsQuery.error || dailyStatsQuery.error

  return {
    packageData: packageQuery.data,
    downloadStats: downloadStatsQuery.data,
    dailyStats: dailyStatsQuery.data,
    isLoading,
    isError,
    error,
    refetch: () => {
      packageQuery.refetch()
      downloadStatsQuery.refetch()
      dailyStatsQuery.refetch()
    },
  }
}

// Hook for fetching dependency tree
export function useDependencyTreeQuery(packageName: string | null, version?: string) {
  return useQuery({
    queryKey: queryKeys.dependencies(packageName || '', version),
    queryFn: () => fetchDependencyTree(packageName!, version),
    enabled: !!packageName && packageName.length > 0,
    staleTime: 1000 * 60 * 60, // 1 hour for dependencies
  })
}

// Hook for fetching security vulnerabilities
export function useSecurityQuery(packageName: string | null, version?: string) {
  return useQuery<OSVVulnerability[]>({
    queryKey: queryKeys.security(packageName || '', version),
    queryFn: () => fetchSecurityVulnerabilities(packageName!, version),
    enabled: !!packageName && packageName.length > 0,
    staleTime: 1000 * 60 * 15, // 15 minutes for security data
  })
}

// Prefetch helpers for hover/preloading
import { queryClient } from '@/providers/QueryProvider'

export function prefetchPackage(packageName: string) {
  return queryClient.prefetchQuery({
    queryKey: queryKeys.package(packageName),
    queryFn: () => fetchPackageInfo(packageName),
    staleTime: 1000 * 60 * 5,
  })
}