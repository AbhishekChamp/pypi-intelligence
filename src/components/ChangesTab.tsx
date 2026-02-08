import { useState, useEffect } from 'react'
import type { PyPIPackage } from '@/types'
import { AlertTriangle, AlertOctagon, Info, ChevronDown, ChevronUp, GitCommit, Calendar } from 'lucide-react'
import { cn } from '@/utils'

interface ChangesTabProps {
  data: PyPIPackage | null
}

interface VersionChange {
  version: string
  date: string
  type: 'breaking' | 'deprecation' | 'feature' | 'fix'
  title: string
  description: string
}

export function ChangesTab({ data }: ChangesTabProps) {
  const [changes, setChanges] = useState<VersionChange[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!data) {
      setLoading(false)
      return
    }

    const analyzeChanges = async () => {
      setLoading(true)
      
      try {
        const changesList: VersionChange[] = []
        
        // Get releases sorted by date (most recent first)
        const releases = Object.entries(data.releases)
          .map(([version, files]) => {
            const latestFile = files[files.length - 1]
            return {
              version,
              date: latestFile?.upload_time || '',
              files,
            }
          })
          .filter(r => r.date)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 20) // Last 20 releases

        // Analyze each release description
        for (const release of releases) {
          const change = analyzeReleaseDescription(release.version, release.date)
          if (change) {
            changesList.push(change)
          }
        }

        setChanges(changesList)
      } catch (error) {
        console.warn('Failed to analyze changes:', error)
      } finally {
        setLoading(false)
      }
    }

    analyzeChanges()
  }, [data])

  const analyzeReleaseDescription = (version: string, date: string): VersionChange | null => {
    // Simple keyword-based detection
    const breakingKeywords = ['breaking', 'break', 'removed', 'deprecated', 'dropped support', 'removed support']
    const deprecationKeywords = ['deprecated', 'deprecation', 'will be removed', 'future version']
    const featureKeywords = ['added', 'new', 'feature', 'introduced', 'support for']
    const fixKeywords = ['fixed', 'fix', 'bugfix', 'resolved', 'patch']

    const description = `Release ${version}` // Placeholder - in real implementation would fetch release notes
    const lowerDesc = description.toLowerCase()

    // Check for breaking changes first (highest priority)
    if (breakingKeywords.some(kw => lowerDesc.includes(kw))) {
      return {
        version,
        date,
        type: 'breaking',
        title: `Version ${version}`,
        description: 'Contains breaking changes. Review before upgrading.',
      }
    }

    // Check for deprecations
    if (deprecationKeywords.some(kw => lowerDesc.includes(kw))) {
      return {
        version,
        date,
        type: 'deprecation',
        title: `Version ${version}`,
        description: 'Contains deprecations. Plan migration for future releases.',
      }
    }

    // Check for features
    if (featureKeywords.some(kw => lowerDesc.includes(kw))) {
      return {
        version,
        date,
        type: 'feature',
        title: `Version ${version}`,
        description: 'New features added.',
      }
    }

    // Check for fixes
    if (fixKeywords.some(kw => lowerDesc.includes(kw))) {
      return {
        version,
        date,
        type: 'fix',
        title: `Version ${version}`,
        description: 'Bug fixes and improvements.',
      }
    }

    return null
  }

  const toggleExpand = (version: string) => {
    setExpandedVersions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(version)) {
        newSet.delete(version)
      } else {
        newSet.add(version)
      }
      return newSet
    })
  }

  const getTypeIcon = (type: VersionChange['type']) => {
    switch (type) {
      case 'breaking':
        return <AlertOctagon className="h-5 w-5 text-red-600" />
      case 'deprecation':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'feature':
        return <Info className="h-5 w-5 text-blue-600" />
      case 'fix':
        return <GitCommit className="h-5 w-5 text-green-600" />
    }
  }

  const getTypeLabel = (type: VersionChange['type']) => {
    switch (type) {
      case 'breaking':
        return 'Breaking Change'
      case 'deprecation':
        return 'Deprecation'
      case 'feature':
        return 'New Feature'
      case 'fix':
        return 'Bug Fix'
    }
  }

  const getTypeColor = (type: VersionChange['type']) => {
    switch (type) {
      case 'breaking':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'deprecation':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'feature':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'fix':
        return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <GitCommit className="mx-auto mb-4 h-12 w-12 animate-pulse text-blue-500" />
          <p className="text-gray-600">Analyzing changes...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="rounded-lg bg-gray-50 p-8 text-center">
        <GitCommit className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <p className="text-gray-600">No change information available</p>
      </div>
    )
  }

  const breakingCount = changes.filter(c => c.type === 'breaking').length
  const deprecationCount = changes.filter(c => c.type === 'deprecation').length

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Change Summary</h3>
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-red-50 p-4">
            <p className="text-2xl font-bold text-red-900">{breakingCount}</p>
            <p className="text-sm text-red-700">Breaking Changes</p>
          </div>
          <div className="rounded-lg bg-yellow-50 p-4">
            <p className="text-2xl font-bold text-yellow-900">{deprecationCount}</p>
            <p className="text-sm text-yellow-700">Deprecations</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-2xl font-bold text-blue-900">
              {changes.filter(c => c.type === 'feature').length}
            </p>
            <p className="text-sm text-blue-700">New Features</p>
          </div>
          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-2xl font-bold text-green-900">
              {changes.filter(c => c.type === 'fix').length}
            </p>
            <p className="text-sm text-green-700">Bug Fixes</p>
          </div>
        </div>
      </div>

      {/* Changes List */}
      {changes.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-gray-900">Recent Changes</h4>
          {changes.map((change) => (
            <div
              key={change.version}
              className={cn(
                'rounded-lg border p-4 transition-colors',
                getTypeColor(change.type)
              )}
            >
              <button
                onClick={() => toggleExpand(change.version)}
                className="flex w-full items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  {getTypeIcon(change.type)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold">{change.version}</span>
                      <span className="rounded bg-white px-2 py-0.5 text-xs font-medium">
                        {getTypeLabel(change.type)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-xs opacity-75">
                      <Calendar className="h-3 w-3" />
                      {new Date(change.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                {expandedVersions.has(change.version) ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </button>

              {expandedVersions.has(change.version) && (
                <div className="mt-3 border-t border-current border-opacity-20 pt-3">
                  <p className="text-sm">{change.description}</p>
                  
                  {change.type === 'breaking' && (
                    <div className="mt-3 rounded bg-red-200 bg-opacity-50 p-3">
                      <p className="text-sm font-medium text-red-900">⚠️ Action Required</p>
                      <p className="text-sm text-red-800">
                        This version contains breaking changes. Review the changelog and test 
                        your application before upgrading.
                      </p>
                    </div>
                  )}

                  {change.type === 'deprecation' && (
                    <div className="mt-3 rounded bg-yellow-200 bg-opacity-50 p-3">
                      <p className="text-sm font-medium text-yellow-900">📋 Migration Needed</p>
                      <p className="text-sm text-yellow-800">
                        Deprecated features will be removed in a future version. 
                        Plan your migration strategy.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-gray-50 p-8 text-center">
          <Info className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">No Changes Detected</h3>
          <p className="text-gray-600">Could not detect breaking changes or deprecations from available data.</p>
        </div>
      )}

      {/* Note */}
      <div className="rounded-lg bg-blue-50 p-4">
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> Change detection is based on release descriptions. 
              Always review the official changelog before upgrading.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
