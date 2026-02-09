import { useState, useEffect, useCallback } from 'react'
import { fetchPackageInfo, fetchDownloadStats, fetchDailyStats } from '@/api/pypi'
import type {
  PyPIPackage,
  PackageOverview,
  ReleaseInfo,
  CompatibilityMatrix,
  DownloadStats,
  HealthScore,
} from '@/types'
import {
  extractMaintainers,
  extractAuthorName,
  parsePythonVersion,
  calculateTrendPercentage,
  formatLicense,
  isValidDate,
} from '@/utils'

// Re-export other hooks
export { useExportPackage } from './useExportPackage'
export { useSearchHistory } from './useSearchHistory'
export { useFavorites } from './useFavorites'

// Hook for fetching package data
export function usePackageData(packageName: string | null) {
  const [data, setData] = useState<PyPIPackage | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!packageName) {
      setData(null)
      setError(null)
      return
    }

    let cancelled = false

    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        const result = await fetchPackageInfo(packageName!)
        if (!cancelled) {
          setData(result)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch package')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [packageName])

  return { data, loading, error }
}

// Hook for debounced search
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Transform PyPI data to PackageOverview
export function usePackageOverview(
  data: PyPIPackage | null
): PackageOverview | null {
  if (!data) return null

  const { info } = data

  // Find the most recent upload across all releases
  let lastReleaseDate: Date | null = null
  
  // Helper to safely parse date
  const safeParseDate = (dateStr: string): Date | null => {
    try {
      const date = new Date(dateStr)
      if (isValidDate(date)) {
        return date
      }
      console.warn('Invalid date string:', dateStr)
      return null
    } catch (error) {
      console.warn('Error parsing date:', dateStr, error)
      return null
    }
  }
  
  // First, try to find files matching the current version (info.version)
  const currentVersionFiles = data.releases[info.version]
  if (currentVersionFiles && currentVersionFiles.length > 0) {
    const latestFile = currentVersionFiles[currentVersionFiles.length - 1]
    if (latestFile?.upload_time) {
      lastReleaseDate = safeParseDate(latestFile.upload_time)
    }
  }
  
  // Fallback: iterate through all releases to find the most recent upload
  if (!lastReleaseDate) {
    Object.values(data.releases).forEach(files => {
      files.forEach(file => {
        if (file.upload_time) {
          const uploadDate = safeParseDate(file.upload_time)
          if (uploadDate && (!lastReleaseDate || uploadDate > lastReleaseDate)) {
            lastReleaseDate = uploadDate
          }
        }
      })
    })
  }

  const maintainerCount = extractMaintainers({
    author: info.author,
    author_email: info.author_email,
    maintainer: info.maintainer,
    maintainer_email: info.maintainer_email,
  }).length

  // Extract author name from author field or author_email
  const authorName = extractAuthorName({
    author: info.author,
    author_email: info.author_email,
  })

  return {
    name: info.name,
    version: info.version,
    summary: info.summary || 'No summary available',
    description: info.description || '',
    license: formatLicense(info.license, info.license_expression, info.classifiers),
    author: authorName,
    maintainer: info.maintainer,
    maintainerCount,
    lastReleaseDate,
    projectUrls: info.project_urls || {},
    isYanked: info.yanked,
  }
}

// Transform PyPI data to ReleaseInfo[]
export function useReleaseHistory(data: PyPIPackage | null): ReleaseInfo[] {
  if (!data) return []

  // Helper to safely parse date
  const safeParseDate = (dateStr: string): Date | null => {
    try {
      const date = new Date(dateStr)
      if (isValidDate(date)) {
        return date
      }
      return null
    } catch {
      return null
    }
  }

  return Object.entries(data.releases)
    .map(([version, files]) => {
      const latestFile = files[files.length - 1]
      const isYanked = files.some(f => f.yanked) || false
      const yankedReason = files.find(f => f.yanked)?.yanked_reason || null

      // Safely parse the date
      let parsedDate: Date | null = null
      if (latestFile?.upload_time) {
        parsedDate = safeParseDate(latestFile.upload_time)
        if (!parsedDate) {
          console.warn(`Invalid upload_time for ${version}:`, latestFile.upload_time)
        }
      }

      return {
        version,
        date: parsedDate,
        isYanked,
        yankedReason,
        files,
      }
    })
    .sort((a, b) => {
      // Handle null dates - put them at the end
      if (!a.date && !b.date) return 0
      if (!a.date) return 1
      if (!b.date) return -1
      return b.date.getTime() - a.date.getTime()
    })
}

// Analyze compatibility matrix
export function useCompatibilityMatrix(
  data: PyPIPackage | null
): CompatibilityMatrix {
  if (!data) {
    return {
      pythonVersions: [],
      platforms: { linux: false, macos: false, windows: false },
      wheelsAvailable: false,
      purePython: false,
      sourceOnly: true,
    }
  }

  const pythonVersions = parsePythonVersion(data.info.classifiers)
  
  // Check all releases for platform support, not just current version
  let wheelsAvailable = false
  let purePython = false
  let hasLinux = false
  let hasMacos = false
  let hasWindows = false
  let hasSource = false

  // Iterate through all releases to find wheels
  Object.values(data.releases).forEach(files => {
    files.forEach(file => {
      if (file.packagetype === 'bdist_wheel') {
        wheelsAvailable = true
        const filename = file.filename.toLowerCase()
        
        // Check for pure Python wheels (universal)
        if (filename.includes('py2.py3') || filename.includes('py3-none-any')) {
          purePython = true
        }
        
        // Check platform tags
        if (filename.includes('linux') || filename.includes('manylinux')) {
          hasLinux = true
        }
        if (filename.includes('macosx') || filename.includes('darwin')) {
          hasMacos = true
        }
        if (filename.includes('win32') || filename.includes('win_amd64') || filename.includes('-win_')) {
          hasWindows = true
        }
      } else if (file.packagetype === 'sdist') {
        hasSource = true
      }
    })
  })

  // If we have pure Python wheels, they work on all platforms
  if (purePython) {
    hasLinux = true
    hasMacos = true
    hasWindows = true
  }

  // If we have wheels but no specific platform detected, assume universal
  if (wheelsAvailable && !hasLinux && !hasMacos && !hasWindows) {
    hasLinux = true
    hasMacos = true
    hasWindows = true
  }

  const sourceOnly = !wheelsAvailable && hasSource

  return {
    pythonVersions,
    platforms: {
      linux: hasLinux,
      macos: hasMacos,
      windows: hasWindows,
    },
    wheelsAvailable,
    purePython,
    sourceOnly,
  }
}

// Hook for download stats
export function useDownloadStats(packageName: string | null) {
  const [stats, setStats] = useState<DownloadStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!packageName) {
      setStats(null)
      return
    }

    let cancelled = false

    async function fetchStats() {
      setLoading(true)
      setError(null)

      try {
        const [recent, daily] = await Promise.all([
          fetchDownloadStats(packageName!),
          fetchDailyStats(packageName!, 30),
        ])

        if (cancelled) return

        const history =
          daily.data?.map(d => ({
            date: d.date,
            downloads: d.downloads,
          })) || []

        // Calculate trend using last 7 days vs previous 7 days
        const last7Days = history.slice(-7).reduce((sum, d) => sum + d.downloads, 0)
        const prev7Days = history.slice(-14, -7).reduce((sum, d) => sum + d.downloads, 0)
        const { trend, percentage } = calculateTrendPercentage(last7Days, prev7Days)

        setStats({
          daily: recent.data.last_day,
          weekly: recent.data.last_week,
          monthly: recent.data.last_month,
          history,
          trend,
          trendPercentage: percentage,
        })
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch stats')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchStats()

    return () => {
      cancelled = true
    }
  }, [packageName])

  return { stats, loading, error }
}

// Calculate health score
export function useHealthScore(
  overview: PackageOverview | null,
  compatibility: CompatibilityMatrix,
  stats: DownloadStats | null
): HealthScore {
  if (!overview) {
    return {
      score: 0,
      rating: 'poor',
      breakdown: {
        recency: 0,
        maintenance: 0,
        compatibility: 0,
        popularity: 0,
        stability: 0,
      },
      warnings: [],
      recommendations: [],
    }
  }

  const warnings: string[] = []
  const recommendations: string[] = []

  // Recency score (25 points)
  let recencyScore = 25
  const daysSinceRelease = overview.lastReleaseDate
    ? Math.floor(
        (Date.now() - overview.lastReleaseDate.getTime()) / (1000 * 60 * 60 * 24)
      )
    : 365

  if (daysSinceRelease > 365) {
    recencyScore = 5
    warnings.push('Package has not been updated in over a year')
    recommendations.push('Consider checking for actively maintained alternatives')
  } else if (daysSinceRelease > 180) {
    recencyScore = 15
    warnings.push('Package has not been updated in 6 months')
  } else if (daysSinceRelease > 90) {
    recencyScore = 20
  }

  // Maintenance score (20 points)
  let maintenanceScore = 20
  if (overview.maintainerCount === 0) {
    maintenanceScore = 5
    warnings.push('No maintainers listed')
    recommendations.push('Check GitHub repository for contributor activity')
  } else if (overview.maintainerCount === 1) {
    maintenanceScore = 15
    warnings.push('Single maintainer - bus factor risk')
    recommendations.push('Consider contributing or forking if critical')
  }

  // Compatibility score (25 points)
  let compatibilityScore = 25
  if (compatibility.sourceOnly) {
    compatibilityScore = 10
    warnings.push('Source-only distribution - requires build tools')
    recommendations.push('Ensure build dependencies are available')
  } else if (!compatibility.wheelsAvailable) {
    compatibilityScore = 15
    warnings.push('No wheels available')
  } else if (compatibility.pythonVersions.length === 0) {
    compatibilityScore = 20
    warnings.push('Python version compatibility unclear')
  }

  // Popularity score (20 points)
  let popularityScore = 20
  const monthlyDownloads = stats?.monthly || 0
  if (monthlyDownloads < 100) {
    popularityScore = 5
    warnings.push('Very low download count')
    recommendations.push('Verify package is actively used in production')
  } else if (monthlyDownloads < 1000) {
    popularityScore = 10
  } else if (monthlyDownloads < 10000) {
    popularityScore = 15
  }

  // Stability score (10 points)
  let stabilityScore = 10
  if (overview.isYanked) {
    stabilityScore = 0
    warnings.push('Latest version has been yanked')
    recommendations.push('Do not use this version - check for security issues')
  }

  const totalScore =
    recencyScore + maintenanceScore + compatibilityScore + popularityScore + stabilityScore

  const rating: HealthScore['rating'] =
    totalScore >= 85 ? 'excellent' : totalScore >= 70 ? 'good' : totalScore >= 50 ? 'fair' : 'poor'

  return {
    score: totalScore,
    rating,
    breakdown: {
      recency: recencyScore,
      maintenance: maintenanceScore,
      compatibility: compatibilityScore,
      popularity: popularityScore,
      stability: stabilityScore,
    },
    warnings,
    recommendations,
  }
}

// Check if localStorage is available
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__'
    window.localStorage.setItem(test, test)
    window.localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

// Hook for local storage with proper error handling
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storageAvailable] = useState(() => isLocalStorageAvailable())
  const [storageError, setStorageError] = useState<string | null>(null)
  
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!storageAvailable) {
      console.warn('localStorage is not available. Data will not persist.')
      return initialValue
    }
    
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        try {
          return JSON.parse(item) as T
        } catch (parseError) {
          console.warn(`Error parsing localStorage key "${key}":`, parseError)
          // Clear corrupted data
          window.localStorage.removeItem(key)
          return initialValue
        }
      }
      return initialValue
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      console.warn(`Error reading localStorage key "${key}":`, errorMsg)
      setStorageError(`Unable to load saved data: ${errorMsg}`)
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      if (!storageAvailable) {
        console.warn('Cannot save to localStorage: storage is not available')
        setStorageError('Cannot save preferences: private browsing mode or storage disabled')
        // Still update state even if storage fails
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        return
      }

      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        
        const serialized = JSON.stringify(valueToStore)
        
        // Check storage quota
        try {
          window.localStorage.setItem(key, serialized)
          setStorageError(null) // Clear any previous error
        } catch (quotaError) {
          if (quotaError instanceof Error && quotaError.name === 'QuotaExceededError') {
            console.error(`localStorage quota exceeded for key "${key}"`)
            setStorageError('Storage is full. Some preferences may not be saved.')
            
            // Try to clear old items to make space
            try {
              const keysToRemove = []
              for (let i = 0; i < window.localStorage.length; i++) {
                const k = window.localStorage.key(i)
                if (k && k.startsWith('pypi-intelligence:') && k !== key) {
                  keysToRemove.push(k)
                }
              }
              // Remove oldest items (up to 5)
              keysToRemove.slice(0, 5).forEach(k => window.localStorage.removeItem(k))
              
              // Try again
              window.localStorage.setItem(key, serialized)
              setStorageError(null)
            } catch {
              setStorageError('Storage is full. Please clear some browser data.')
            }
          } else {
            throw quotaError
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error'
        console.error(`Error saving to localStorage key "${key}":`, errorMsg)
        setStorageError(`Failed to save: ${errorMsg}`)
      }
    },
    [key, storedValue, storageAvailable]
  )

  const clearValue = useCallback(() => {
    if (storageAvailable) {
      try {
        window.localStorage.removeItem(key)
      } catch (error) {
        console.warn(`Error clearing localStorage key "${key}":`, error)
      }
    }
    setStoredValue(initialValue)
  }, [key, initialValue, storageAvailable])

  return [storedValue, setValue, clearValue, storageError, storageAvailable] as const
}
