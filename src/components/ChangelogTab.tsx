import { useState } from 'react'
import type { ChangelogData, ChangelogEntry } from '@/types'
import { 
  FileText, 
  AlertTriangle, 
  Shield, 
  Sparkles, 
  Bug, 
  ChevronDown, 
  ChevronUp,
  Github,
  History,
  ExternalLink,
  AlertCircle
} from 'lucide-react'
import { formatDate } from '@/utils'

interface ChangelogTabProps {
  changelog: ChangelogData | null
  loading: boolean
  error: Error | null
  githubUrl: string | null
}

export function ChangelogTab({ changelog, loading, error, githubUrl }: ChangelogTabProps) {
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set())

  const toggleVersion = (version: string) => {
    const newSet = new Set(expandedVersions)
    if (newSet.has(version)) {
      newSet.delete(version)
    } else {
      newSet.add(version)
    }
    setExpandedVersions(newSet)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg p-4 shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--card-bg)' }}>
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-700 mb-1">Failed to Load Changelog</h3>
            <p className="text-sm text-red-600 mb-4">
              We couldn't fetch the changelog from the repository. This might be due to network issues or rate limiting.
            </p>
            {githubUrl && (
              <a
                href={`${githubUrl}/releases`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors text-sm font-medium"
              >
                <ExternalLink className="h-4 w-4" />
                View Releases on GitHub
              </a>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!changelog || changelog.entries.length === 0) {
    return (
      <div className="rounded-lg p-6 text-center" style={{ backgroundColor: 'var(--card-bg)' }}>
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" style={{ color: 'var(--text-muted)' }} />
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          No Changelog Available
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          We couldn't find a changelog file in the repository. The project may not maintain a formal changelog.
        </p>
        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
          >
            <Github className="h-4 w-4" />
            Visit Repository
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    )
  }

  const breakingChanges = changelog.entries.filter(e => e.isBreaking)
  const securityFixes = changelog.entries.filter(e => e.isSecurity)
  const features = changelog.entries.filter(e => e.isFeature)
  const fixes = changelog.entries.filter(e => e.isFix)

  return (
    <div className="space-y-6">
      {/* Source indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          {changelog.source === 'github' ? (
            <>
              <Github className="h-4 w-4" />
              <span>Fetched from GitHub</span>
            </>
          ) : (
            <>
              <History className="h-4 w-4" />
              <span>Generated from PyPI releases</span>
            </>
          )}
        </div>
        {githubUrl && changelog.source !== 'github' && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            View on GitHub
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
          label="Breaking Changes"
          value={breakingChanges.length.toString()}
          color="red"
        />
        <StatCard 
          icon={<Shield className="h-4 w-4 text-green-500" />}
          label="Security Fixes"
          value={securityFixes.length.toString()}
          color="green"
        />
        <StatCard 
          icon={<Sparkles className="h-4 w-4 text-purple-500" />}
          label="New Features"
          value={features.length.toString()}
          color="purple"
        />
        <StatCard 
          icon={<Bug className="h-4 w-4 text-orange-500" />}
          label="Bug Fixes"
          value={fixes.length.toString()}
          color="orange"
        />
      </div>

      {/* Changelog entries */}
      <div className="space-y-3">
        {changelog.entries.map((entry) => (
          <ChangelogEntryCard 
            key={entry.version}
            entry={entry}
            isExpanded={expandedVersions.has(entry.version)}
            onToggle={() => toggleVersion(entry.version)}
          />
        ))}
      </div>

      {changelog.entries.length === 0 && (
        <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
          <p>No changelog entries found</p>
        </div>
      )}
    </div>
  )
}

function StatCard({ 
  icon, 
  label, 
  value,
  color 
}: { 
  icon: React.ReactNode
  label: string
  value: string
  color: string
}) {
  const bgColors: Record<string, string> = {
    red: 'bg-red-50',
    green: 'bg-green-50',
    purple: 'bg-purple-50',
    orange: 'bg-orange-50',
    blue: 'bg-blue-50',
  }

  return (
    <div className={`rounded-lg p-3 ${bgColors[color] || 'bg-gray-50'}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs font-medium opacity-70">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

function ChangelogEntryCard({ 
  entry, 
  isExpanded, 
  onToggle 
}: { 
  entry: ChangelogEntry
  isExpanded: boolean
  onToggle: () => void
}) {
  const getChangeTypeIcon = () => {
    if (entry.isBreaking) return <AlertTriangle className="h-4 w-4 text-red-500" />
    if (entry.isSecurity) return <Shield className="h-4 w-4 text-green-500" />
    if (entry.isFeature) return <Sparkles className="h-4 w-4 text-purple-500" />
    if (entry.isFix) return <Bug className="h-4 w-4 text-orange-500" />
    return <FileText className="h-4 w-4 text-gray-400" />
  }

  const getChangeTypeLabel = () => {
    if (entry.isBreaking) return { text: 'Breaking', class: 'bg-red-100 text-red-700' }
    if (entry.isSecurity) return { text: 'Security', class: 'bg-green-100 text-green-700' }
    if (entry.isFeature) return { text: 'Feature', class: 'bg-purple-100 text-purple-700' }
    if (entry.isFix) return { text: 'Bug Fix', class: 'bg-orange-100 text-orange-700' }
    return { text: 'Other', class: 'bg-gray-100 text-gray-700' }
  }

  const changeType = getChangeTypeLabel()

  return (
    <div 
      className="rounded-lg shadow-sm overflow-hidden"
      style={{ backgroundColor: 'var(--card-bg)' }}
    >
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-3">
          {getChangeTypeIcon()}
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                v{entry.version}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${changeType.class}`}>
                {changeType.text}
              </span>
            </div>
            {entry.date && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {formatDate(entry.date)}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {entry.changes.length} change{entry.changes.length !== 1 ? 's' : ''}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
          ) : (
            <ChevronDown className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
          <ul className="space-y-2">
            {entry.changes.map((change, idx) => (
              <li 
                key={idx}
                className="flex items-start gap-2 text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" />
                <span>{change}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}