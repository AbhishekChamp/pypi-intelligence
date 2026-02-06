import type { PyPIPackage, PyPIStatsRecent, PyPIStatsDaily } from '@/types'

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const cache = new Map<string, { data: unknown; timestamp: number }>()

function getCached<T>(key: string): T | null {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T
  }
  return null
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() })
}

export async function fetchPackageInfo(packageName: string): Promise<PyPIPackage> {
  const cacheKey = `pypi:${packageName.toLowerCase()}`
  const cached = getCached<PyPIPackage>(cacheKey)
  if (cached) return cached

  const response = await fetch(`https://pypi.org/pypi/${packageName}/json`)
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Package "${packageName}" not found on PyPI`)
    }
    throw new Error(`Failed to fetch package info: ${response.statusText}`)
  }

  const data = await response.json()
  setCache(cacheKey, data)
  return data as PyPIPackage
}

export async function fetchDownloadStats(packageName: string): Promise<PyPIStatsRecent> {
  const cacheKey = `stats:recent:${packageName.toLowerCase()}`
  const cached = getCached<PyPIStatsRecent>(cacheKey)
  if (cached) return cached

  try {
    // Try the recent endpoint first
    const response = await fetch(
      `https://pypistats.org/api/packages/${packageName}/recent`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )
    
    if (!response.ok) {
      console.warn(`PyPIStats recent API failed for ${packageName}: ${response.status}`)
      throw new Error(`Failed to fetch download stats: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Validate response structure
    if (!data.data || typeof data.data.last_day !== 'number') {
      console.warn(`Invalid PyPIStats response structure for ${packageName}:`, data)
      throw new Error('Invalid response structure')
    }
    
    setCache(cacheKey, data)
    return data as PyPIStatsRecent
  } catch (error) {
    console.warn(`Download stats fetch failed for ${packageName}:`, error)
    // Return default stats if API fails
    return {
      data: { last_day: 0, last_week: 0, last_month: 0 },
      package: packageName,
      type: 'recent_downloads',
    }
  }
}

export async function fetchDailyStats(
  packageName: string,
  days: number = 30
): Promise<PyPIStatsDaily> {
  const cacheKey = `stats:daily:${packageName.toLowerCase()}:${days}`
  const cached = getCached<PyPIStatsDaily>(cacheKey)
  if (cached) return cached

  try {
    const response = await fetch(
      `https://pypistats.org/api/packages/${packageName}/overall?mirrors=true&period=day&days=${days}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )
    
    if (!response.ok) {
      console.warn(`PyPIStats daily API failed for ${packageName}: ${response.status}`)
      throw new Error(`Failed to fetch daily stats: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Validate response structure
    if (!data.data || !Array.isArray(data.data)) {
      console.warn(`Invalid PyPIStats daily response structure for ${packageName}:`, data)
      throw new Error('Invalid response structure')
    }
    
    setCache(cacheKey, data)
    return data as PyPIStatsDaily
  } catch (error) {
    console.warn(`Daily stats fetch failed for ${packageName}:`, error)
    // Return empty data if API fails
    return {
      data: [],
      package: packageName,
      type: 'overall_downloads',
    }
  }
}

export function clearCache(): void {
  cache.clear()
}
