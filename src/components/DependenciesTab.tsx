import { useState, useEffect } from 'react'
import { fetchDependencyTree, calculateDependencyStats, type DependencyNode } from '@/api/pypi'
import { Package, AlertTriangle, ChevronRight, ChevronDown, Loader2 } from 'lucide-react'
import { cn } from '@/utils'

interface DependenciesTabProps {
  packageName: string
  version?: string
  onPackageClick?: (packageName: string) => void
}

export function DependenciesTab({ packageName, version, onPackageClick }: DependenciesTabProps) {
  const [dependencies, setDependencies] = useState<DependencyNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [stats, setStats] = useState<{
    total: number
    direct: number
    transitive: number
    optional: number
    withErrors: number
  } | null>(null)

  useEffect(() => {
    const loadDependencies = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const deps = await fetchDependencyTree(packageName, version)
        // Filter out duplicates based on package name (case-insensitive)
        const seenPackages = new Set<string>()
        const uniqueDeps = deps.filter(dep => {
          const lowerName = dep.name.toLowerCase()
          if (seenPackages.has(lowerName)) {
            return false
          }
          seenPackages.add(lowerName)
          return true
        })
        setDependencies(uniqueDeps)
        setStats(calculateDependencyStats(uniqueDeps))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dependencies')
      } finally {
        setLoading(false)
      }
    }

    loadDependencies()
  }, [packageName, version])

  const toggleNode = (nodeName: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(nodeName)) {
        newSet.delete(nodeName)
      } else {
        newSet.add(nodeName)
      }
      return newSet
    })
  }

  const handlePackageClick = (name: string) => {
    if (onPackageClick) {
      onPackageClick(name)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-500" />
          <p style={{ color: 'var(--text-secondary)' }}>Analyzing dependency tree...</p>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>This may take a moment for packages with many dependencies</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-yellow-50 p-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-yellow-600" />
          <div>
            <h3 className="font-medium text-yellow-900">Dependency Analysis Failed</h3>
            <p className="text-sm text-yellow-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (dependencies.length === 0) {
    return (
      <div className="rounded-lg p-8 text-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <Package className="mx-auto mb-4 h-12 w-12" style={{ color: 'var(--text-muted)' }} />
        <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>No Dependencies</h3>
        <p style={{ color: 'var(--text-secondary)' }}>This package has no declared dependencies.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            <p className="text-sm text-blue-700">Total Dependencies</p>
          </div>
          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-2xl font-bold text-green-900">{stats.direct}</p>
            <p className="text-sm text-green-700">Direct</p>
          </div>
          <div className="rounded-lg bg-purple-50 p-4">
            <p className="text-2xl font-bold text-purple-900">{stats.transitive}</p>
            <p className="text-sm text-purple-700">Transitive</p>
          </div>
          <div className="rounded-lg bg-yellow-50 p-4">
            <p className="text-2xl font-bold text-yellow-900">{stats.optional}</p>
            <p className="text-sm text-yellow-700">Optional</p>
          </div>
          <div className="rounded-lg bg-red-50 p-4">
            <p className="text-2xl font-bold text-red-900">{stats.withErrors}</p>
            <p className="text-sm text-red-700">Unresolved</p>
          </div>
        </div>
      )}

      {/* Dependency Tree */}
      <div className="rounded-lg" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', borderWidth: '1px' }}>
        <div className="border-b px-4 py-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-tertiary)' }}>
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Dependency Tree (2 Levels)</h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Click package names to view details. Click arrows to expand transitive dependencies.</p>
        </div>
        
        <div className="p-4">
          <div className="space-y-2">
            {dependencies.map((dep, index) => (
              <DependencyNodeComponent
                key={`${dep.name}-${index}`}
                node={dep}
                level={0}
                isExpanded={expandedNodes.has(dep.name)}
                onToggle={() => toggleNode(dep.name)}
                onPackageClick={handlePackageClick}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
        <div className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-full bg-green-500"></span>
          <span>Direct dependency</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: 'var(--text-muted)' }}></span>
          <span>Transitive dependency</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="rounded px-1" style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning)' }}>optional</span>
          <span>Optional dependency</span>
        </div>
        <div className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3 text-red-500" />
          <span>Failed to resolve</span>
        </div>
      </div>
    </div>
  )
}

interface DependencyNodeComponentProps {
  node: DependencyNode
  level: number
  isExpanded: boolean
  onToggle: () => void
  onPackageClick: (name: string) => void
  seenPackages?: Set<string>
}

function DependencyNodeComponent({
  node,
  level,
  isExpanded,
  onToggle,
  onPackageClick,
  seenPackages = new Set(),
}: DependencyNodeComponentProps) {
  const hasChildren = node.children && node.children.length > 0
  
  // Filter out duplicate children
  const uniqueChildren = node.children?.filter(child => {
    const lowerName = child.name.toLowerCase()
    if (seenPackages.has(lowerName)) {
      return false
    }
    seenPackages.add(lowerName)
    return true
  }) || []

  return (
    <div className={cn('rounded-lg')} style={{ backgroundColor: level === 0 ? 'var(--bg-tertiary)' : 'var(--card-bg)' }}>
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg px-3 py-2',
          'transition-colors'
        )}
        style={{ marginLeft: level * 24, backgroundColor: 'transparent' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = level === 0 ? 'var(--border-light)' : 'var(--bg-tertiary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        {/* Expand/Collapse Button */}
        {hasChildren ? (
          <button
            onClick={onToggle}
            className="flex h-5 w-5 items-center justify-center rounded hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <span className="h-5 w-5" />
        )}

        {/* Package Icon/Indicator */}
        {level === 0 ? (
          <Package className="h-4 w-4 text-green-600" />
        ) : (
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--text-muted)' }} />
        )}

        {/* Package Name (Clickable) */}
        <button
          onClick={() => onPackageClick(node.name)}
          className="font-mono text-sm font-medium hover:underline"
          style={{ color: 'var(--accent)' }}
        >
          {node.name}
        </button>

        {/* Version */}
        {node.version && (
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{node.version}</span>
        )}

        {/* Specifier */}
        {node.specifier && (
          <code className="rounded px-1.5 py-0.5 text-xs" style={{ backgroundColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            {node.specifier}
          </code>
        )}

        {/* Optional Badge */}
        {node.isOptional && (
          <span className="rounded px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning)' }}>
            optional
          </span>
        )}

        {/* Error Indicator */}
        {node.error && (
          <div className="flex items-center gap-1" style={{ color: 'var(--error)' }} title={node.error}>
            <AlertTriangle className="h-3 w-3" />
            <span className="text-xs">unresolved</span>
          </div>
        )}

        {/* Child Count */}
        {uniqueChildren.length > 0 && !isExpanded && (
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            +{uniqueChildren.length} more
          </span>
        )}
      </div>

      {/* Child Dependencies */}
      {isExpanded && uniqueChildren.length > 0 && (
        <div className="mt-1 space-y-1">
          {uniqueChildren.map((child, index) => (
            <DependencyNodeComponent
              key={`${child.name}-${index}`}
              node={child}
              level={level + 1}
              isExpanded={false}
              onToggle={() => {}}
              onPackageClick={onPackageClick}
              seenPackages={seenPackages}
            />
          ))}
        </div>
      )}
    </div>
  )
}
