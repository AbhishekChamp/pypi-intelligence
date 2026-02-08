import type { PyPIPackage, PyPIStatsRecent, PyPIStatsDaily } from '@/types'
import { getPackageSuggestions } from '@/utils'

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const MAX_CACHE_SIZE = 100 // Maximum number of cached items
const API_TIMEOUT = 10000 // 10 seconds
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second base delay

const cache = new Map<string, { data: unknown; timestamp: number }>()

function getCached<T>(key: string): T | null {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T
  }
  // Remove expired entries
  if (cached) {
    cache.delete(key)
  }
  return null
}

function setCache<T>(key: string, data: T): void {
  // Implement LRU eviction if cache is full
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value
    if (firstKey !== undefined) {
      cache.delete(firstKey)
    }
  }
  cache.set(key, { data, timestamp: Date.now() })
}

// Fetch with timeout wrapper
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = API_TIMEOUT
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`)
    }
    throw error
  }
}

// Fetch with retry logic
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries: number = MAX_RETRIES
): Promise<Response> {
  let lastError: Error | null = null
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetchWithTimeout(url, options)
      
      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After')
        const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : RETRY_DELAY * Math.pow(2, i)
        console.warn(`Rate limited. Retrying after ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      
      return response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // Don't retry on client errors (4xx except 429)
      if (error instanceof Response && error.status >= 400 && error.status < 500 && error.status !== 429) {
        throw lastError
      }
      
      if (i < retries - 1) {
        const delay = RETRY_DELAY * Math.pow(2, i) // Exponential backoff
        console.warn(`Request failed, retrying in ${delay}ms... (attempt ${i + 1}/${retries})`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError || new Error('Request failed after all retries')
}

export async function fetchPackageInfo(packageName: string): Promise<PyPIPackage> {
  const cacheKey = `pypi:${packageName.toLowerCase()}`
  const cached = getCached<PyPIPackage>(cacheKey)
  if (cached) return cached

  try {
    const response = await fetchWithRetry(`https://pypi.org/pypi/${packageName}/json`)
    
    if (!response.ok) {
      if (response.status === 404) {
        const suggestions = getPackageSuggestions(packageName)
        const suggestionMessage = suggestions.length > 0 
          ? ` Did you mean: ${suggestions.join(', ')}?`
          : ''
        throw new Error(`Package "${packageName}" not found on PyPI.${suggestionMessage}`)
      }
      if (response.status === 429) {
        throw new Error('Rate limited by PyPI API. Please try again later.')
      }
      throw new Error(`Failed to fetch package info: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    setCache(cacheKey, data)
    return data as PyPIPackage
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new Error(`Request timed out while fetching "${packageName}". Please check your connection.`)
      }
      if (error.message.includes('fetch')) {
        throw new Error(`Network error while fetching "${packageName}". Please check your connection.`)
      }
      throw error
    }
    throw new Error(`Failed to fetch package "${packageName}"`)
  }
}

export async function fetchDownloadStats(packageName: string): Promise<PyPIStatsRecent> {
  const cacheKey = `stats:recent:${packageName.toLowerCase()}`
  const cached = getCached<PyPIStatsRecent>(cacheKey)
  if (cached) return cached

  try {
    // Use Vite proxy to avoid CORS issues
    const response = await fetchWithRetry(
      `/api/pypistats/packages/${packageName}/recent`,
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
    // Use Vite proxy to avoid CORS issues
    const response = await fetchWithRetry(
      `/api/pypistats/packages/${packageName}/overall?mirrors=true&period=day&days=${days}`,
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

// Get cache statistics for debugging
export function getCacheStats(): { size: number; maxSize: number } {
  return { size: cache.size, maxSize: MAX_CACHE_SIZE }
}

// OSV API Types
export interface OSVVulnerability {
  id: string
  summary: string
  details: string
  severity: Array<{
    type: string
    score: string
  }>
  aliases: string[]
  modified: string
  published: string
  affected: Array<{
    package: {
      name: string
      ecosystem: string
    }
    ranges: Array<{
      type: string
      events: Array<{
        introduced?: string
        fixed?: string
      }>
    }>
    versions: string[]
  }>
}

export interface OSVQueryResponse {
  vulns?: OSVVulnerability[]
}

// Fetch security vulnerabilities from OSV API
export async function fetchSecurityVulnerabilities(
  packageName: string,
  version?: string
): Promise<OSVVulnerability[]> {
  const cacheKey = `osv:${packageName.toLowerCase()}:${version || 'all'}`
  const cached = getCached<OSVVulnerability[]>(cacheKey)
  if (cached) return cached

  try {
    const response = await fetchWithRetry('https://api.osv.dev/v1/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        package: {
          name: packageName,
          ecosystem: 'PyPI',
        },
        version: version,
      }),
    })

    if (!response.ok) {
      console.warn(`OSV API failed for ${packageName}: ${response.status}`)
      return []
    }

    const data: OSVQueryResponse = await response.json()
    const vulnerabilities = data.vulns || []
    
    setCache(cacheKey, vulnerabilities)
    return vulnerabilities
  } catch (error) {
    console.warn(`Security check failed for ${packageName}:`, error)
    return []
  }
}

// Dependency Tree Types
export interface DependencyNode {
  name: string
  version: string | null
  specifier: string
  isOptional: boolean
  extras: string[]
  children: DependencyNode[]
  error?: string
}

// Parse dependency string from requires_dist
function parseDependency(depString: string): {
  name: string
  specifier: string
  extras: string[]
  isOptional: boolean
  environment: string | null
} {
  // Handle extras like package[extra1,extra2]>=1.0
  const extrasMatch = depString.match(/\[([^\]]+)\]/)
  const extras = extrasMatch ? extrasMatch[1].split(',').map(e => e.trim()) : []
  
  // Remove extras from string for further parsing
  let cleanDep = depString.replace(/\[[^\]]+\]/, '')
  
  // Check for environment markers (after semicolon)
  const markerMatch = cleanDep.match(/;\s*(.+)$/)
  const environment = markerMatch ? markerMatch[1].trim() : null
  cleanDep = cleanDep.replace(/;\s*.+$/, '')
  
  // Extract name and version specifier
  const match = cleanDep.match(/^([a-zA-Z0-9_-]+)(.*)$/)
  const name = match ? match[1] : cleanDep.trim()
  const specifier = match ? match[2].trim() : ''
  
  // Check if optional (usually indicated by extra markers)
  const isOptional = depString.includes('extra ==') || depString.includes('extra==')
  
  return { name, specifier, extras, isOptional, environment }
}

// Fetch dependency tree (2 levels deep)
export async function fetchDependencyTree(
  packageName: string,
  version?: string
): Promise<DependencyNode[]> {
  const cacheKey = `deps:${packageName.toLowerCase()}:${version || 'latest'}`
  const cached = getCached<DependencyNode[]>(cacheKey)
  if (cached) return cached

  try {
    const response = await fetchWithRetry(
      `https://pypi.org/pypi/${packageName}${version ? `/${version}` : ''}/json`
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch package info: ${response.status}`)
    }

    const data = await response.json()
    const requiresDist = data.info.requires_dist || []
    
    const dependencies: DependencyNode[] = []
    
    // Process only first 20 dependencies to avoid too many API calls
    for (const depString of requiresDist.slice(0, 20)) {
      const parsed = parseDependency(depString)
      
      const node: DependencyNode = {
        name: parsed.name,
        version: null,
        specifier: parsed.specifier,
        isOptional: parsed.isOptional,
        extras: parsed.extras,
        children: [],
      }
      
      // Fetch second level dependencies (limit to 5 per dependency)
      try {
        const depResponse = await fetchWithRetry(`https://pypi.org/pypi/${parsed.name}/json`)
        if (depResponse.ok) {
          const depData = await depResponse.json()
          node.version = depData.info.version
          
          const childDeps = depData.info.requires_dist || []
          for (const childDepString of childDeps.slice(0, 5)) {
            const childParsed = parseDependency(childDepString)
            node.children.push({
              name: childParsed.name,
              version: null,
              specifier: childParsed.specifier,
              isOptional: childParsed.isOptional,
              extras: childParsed.extras,
              children: [],
            })
          }
        }
  } catch {
    node.error = 'Failed to fetch dependency info'
      }
      
      dependencies.push(node)
    }
    
    setCache(cacheKey, dependencies)
    return dependencies
  } catch (error) {
    console.warn(`Dependency tree fetch failed for ${packageName}:`, error)
    return []
  }
}

// Calculate dependency stats
export function calculateDependencyStats(dependencies: DependencyNode[]): {
  total: number
  direct: number
  transitive: number
  optional: number
  withErrors: number
} {
  const direct = dependencies.length
  const transitive = dependencies.reduce((acc, dep) => acc + dep.children.length, 0)
  const optional = dependencies.filter(d => d.isOptional).length
  const withErrors = dependencies.filter(d => d.error).length
  
  return {
    total: direct + transitive,
    direct,
    transitive,
    optional,
    withErrors,
  }
}
