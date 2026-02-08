import { useState, useEffect } from 'react'

const STORAGE_KEY = 'pypi-intelligence:suggestions'
const STORAGE_EXPIRY = 5 * 60 * 1000 // 5 minutes

interface SuggestionCache {
  packageName: string
  suggestions: Array<{
    name: string
    score: number
    sharedClassifiers: string[]
  }>
  timestamp: number
}

/**
 * Hook to manage package suggestions
 * Computes suggestions and stores them in sessionStorage
 */
export function usePackageSuggestions(packageName: string | null) {
  const [suggestions, setSuggestions] = useState<SuggestionCache | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!packageName) {
      setSuggestions(null)
      return
    }

    // Check sessionStorage for cached suggestions
    try {
      const cached = sessionStorage.getItem(STORAGE_KEY)
      if (cached) {
        const parsed: SuggestionCache = JSON.parse(cached)
        if (
          parsed.packageName.toLowerCase() === packageName.toLowerCase() &&
          Date.now() - parsed.timestamp < STORAGE_EXPIRY
        ) {
          setSuggestions(parsed)
          return
        }
      }
    } catch {
      // Ignore storage errors
    }

    // Compute suggestions by fetching similar packages
    const computeSuggestions = async () => {
      setLoading(true)
      try {
        // Get classifiers for the current package
        const response = await fetch(`https://pypi.org/pypi/${packageName}/json`)
        if (!response.ok) {
          setSuggestions(null)
          return
        }

        const targetPackage = await response.json()
        const targetClassifiers = targetPackage.info.classifiers

        // Since PyPI doesn't have a good search API for this, we'll use a category-based approach
        // Find packages in the same category/framework
        const categorySuggestions = await findPackagesInSameCategory(
          targetClassifiers,
          packageName
        )

        if (categorySuggestions.length > 0) {
          const suggestionCache: SuggestionCache = {
            packageName,
            suggestions: categorySuggestions,
            timestamp: Date.now(),
          }

          try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(suggestionCache))
          } catch {
            // Ignore storage errors
          }

          setSuggestions(suggestionCache)
        } else {
          setSuggestions(null)
        }
      } catch (error) {
        console.warn('Error computing suggestions:', error)
        setSuggestions(null)
      } finally {
        setLoading(false)
      }
    }

    computeSuggestions()
  }, [packageName])

  return { suggestions, loading }
}

/**
 * Get cached suggestions for a package
 */
export function getCachedSuggestions(packageName: string): SuggestionCache | null {
  try {
    const cached = sessionStorage.getItem(STORAGE_KEY)
    if (cached) {
      const parsed: SuggestionCache = JSON.parse(cached)
      if (
        parsed.packageName.toLowerCase() === packageName.toLowerCase() &&
        Date.now() - parsed.timestamp < STORAGE_EXPIRY
      ) {
        return parsed
      }
    }
  } catch {
    // Ignore storage errors
  }
  return null
}

/**
 * Clear cached suggestions
 */
export function clearSuggestions(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore storage errors
  }
}

/**
 * Find packages in the same category by fetching known packages
 */
async function findPackagesInSameCategory(
  targetClassifiers: string[],
  excludePackage: string
): Promise<Array<{ name: string; score: number; sharedClassifiers: string[] }>> {
  const results: Array<{ name: string; score: number; sharedClassifiers: string[] }> = []

  // Define known packages by category
  const knownPackages: Record<string, string[]> = {
    'web framework': [
      'flask', 'django', 'fastapi', 'tornado', 'sanic', 'starlette', 'quart', 'falcon'
    ],
    'data science': [
      'numpy', 'pandas', 'scipy', 'matplotlib', 'seaborn', 'scikit-learn', 'tensorflow', 'pytorch'
    ],
    'http client': [
      'requests', 'httpx', 'aiohttp', 'urllib3', 'httplib2', 'treq'
    ],
    'testing': [
      'pytest', 'unittest', 'nose', 'hypothesis', 'tox', 'coverage'
    ],
    'cli': [
      'click', 'typer', 'argparse', 'docopt', 'fire', 'cement'
    ],
    'database': [
      'sqlalchemy', 'django', 'peewee', 'tortoise-orm', 'prisma', 'pony'
    ],
    'async': [
      'asyncio', 'trio', 'anyio', 'aiohttp', 'fastapi', 'tornado'
    ],
  }

  // Determine category from classifiers
  let category: string | null = null
  if (targetClassifiers.some(c => c.includes('WWW/HTTP') || c.includes('Web Environment'))) {
    category = 'web framework'
  } else if (targetClassifiers.some(c => c.includes('Scientific') || c.includes('Data'))) {
    category = 'data science'
  } else if (targetClassifiers.some(c => c.includes('HTTP') && !c.includes('WWW'))) {
    category = 'http client'
  } else if (targetClassifiers.some(c => c.includes('Testing'))) {
    category = 'testing'
  } else if (targetClassifiers.some(c => c.includes('Console'))) {
    category = 'cli'
  } else if (targetClassifiers.some(c => c.includes('Database'))) {
    category = 'database'
  } else if (targetClassifiers.some(c => c.includes('AsyncIO'))) {
    category = 'async'
  }

  if (!category) {
    return results
  }

  // Fetch details for packages in the same category
  const packagesToFetch = knownPackages[category] || []
  const excludeLower = excludePackage.toLowerCase()

  for (const pkgName of packagesToFetch) {
    if (pkgName.toLowerCase() === excludeLower) continue

    try {
      const response = await fetch(`https://pypi.org/pypi/${pkgName}/json`)
      if (!response.ok) continue

      const pkg = await response.json()
      const pkgClassifiers = pkg.info.classifiers

      // Calculate overlap
      const sharedClassifiers = targetClassifiers.filter(c =>
        pkgClassifiers.includes(c) &&
        (c.startsWith('Framework :: ') ||
         c.startsWith('Topic :: ') ||
         c.startsWith('Intended Audience :: ') ||
         c.startsWith('Environment :: '))
      )

      if (sharedClassifiers.length > 0) {
        // Calculate score based on classifier overlap
        const score = sharedClassifiers.reduce((acc, c) => {
          if (c.startsWith('Framework :: ')) return acc + 100
          if (c.startsWith('Topic :: ')) return acc + 80
          if (c.startsWith('Intended Audience :: ')) return acc + 60
          if (c.startsWith('Environment :: ')) return acc + 40
          return acc + 10
        }, 0)

        results.push({
          name: pkg.info.name,
          score,
          sharedClassifiers,
        })
      }
    } catch {
      // Skip packages that fail to load
    }
  }

  // Sort by score descending and return top 3
  return results.sort((a, b) => b.score - a.score).slice(0, 3)
}
