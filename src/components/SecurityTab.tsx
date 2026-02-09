import { useState, useEffect } from 'react'
import { fetchSecurityVulnerabilities, type OSVVulnerability } from '@/api/pypi'
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/utils'

interface SecurityTabProps {
  packageName: string
  version?: string
}

type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

interface GroupedVulnerabilities {
  CRITICAL: OSVVulnerability[]
  HIGH: OSVVulnerability[]
  MEDIUM: OSVVulnerability[]
  LOW: OSVVulnerability[]
}

export function SecurityTab({ packageName, version }: SecurityTabProps) {
  const [vulnerabilities, setVulnerabilities] = useState<OSVVulnerability[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedVulns, setExpandedVulns] = useState<Set<string>>(new Set())

  useEffect(() => {
    const checkSecurity = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const vulns = await fetchSecurityVulnerabilities(packageName, version)
        setVulnerabilities(vulns)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check security')
      } finally {
        setLoading(false)
      }
    }

    checkSecurity()
  }, [packageName, version])

  const toggleExpand = (vulnId: string) => {
    setExpandedVulns(prev => {
      const newSet = new Set(prev)
      if (newSet.has(vulnId)) {
        newSet.delete(vulnId)
      } else {
        newSet.add(vulnId)
      }
      return newSet
    })
  }

  const getSeverityLevel = (vuln: OSVVulnerability): SeverityLevel => {
    if (!vuln.severity || vuln.severity.length === 0) return 'MEDIUM'
    
    const score = vuln.severity[0]?.score || ''
    const scoreNum = parseFloat(score)
    
    if (scoreNum >= 9.0) return 'CRITICAL'
    if (scoreNum >= 7.0) return 'HIGH'
    if (scoreNum >= 4.0) return 'MEDIUM'
    return 'LOW'
  }

  const groupedVulns: GroupedVulnerabilities = {
    CRITICAL: [],
    HIGH: [],
    MEDIUM: [],
    LOW: [],
  }

  vulnerabilities.forEach(vuln => {
    const severity = getSeverityLevel(vuln)
    groupedVulns[severity].push(vuln)
  })

  const totalVulns = vulnerabilities.length
  const hasCritical = groupedVulns.CRITICAL.length > 0
  const hasHigh = groupedVulns.HIGH.length > 0

  const getSeverityColor = (severity: SeverityLevel) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-600 text-white'
      case 'HIGH':
        return 'bg-orange-500 text-white'
      case 'MEDIUM':
        return 'bg-yellow-500 text-white'
      case 'LOW':
        return 'bg-blue-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Shield className="mx-auto mb-4 h-12 w-12 animate-pulse text-blue-500" />
          <p style={{ color: 'var(--text-secondary)' }}>Checking for security vulnerabilities...</p>
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
            <h3 className="font-medium text-yellow-900">Security Check Unavailable</h3>
            <p className="text-sm text-yellow-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Security Summary */}
      <div className={cn(
        'rounded-lg p-6',
        totalVulns === 0 
          ? 'bg-green-50 border border-green-200' 
          : hasCritical 
            ? 'bg-red-50 border border-red-200'
            : hasHigh
              ? 'bg-orange-50 border border-orange-200'
              : 'bg-yellow-50 border border-yellow-200'
      )}>
        <div className="flex items-start gap-4">
          {totalVulns === 0 ? (
            <ShieldCheck className="h-10 w-10 text-green-600" />
          ) : (
            <ShieldAlert className={cn(
              'h-10 w-10',
              hasCritical ? 'text-red-600' : hasHigh ? 'text-orange-600' : 'text-yellow-600'
            )} />
          )}
          <div>
            <h3 className={cn(
              'text-lg font-semibold',
              totalVulns === 0 
                ? 'text-green-900' 
                : hasCritical 
                  ? 'text-red-900'
                  : hasHigh
                    ? 'text-orange-900'
                    : 'text-yellow-900'
            )}>
              {totalVulns === 0 
                ? 'No Known Vulnerabilities' 
                : `${totalVulns} Known Vulnerabilit${totalVulns === 1 ? 'y' : 'ies'}`}
            </h3>
            <p className={cn(
              'mt-1 text-sm',
              totalVulns === 0 
                ? 'text-green-700' 
                : hasCritical 
                  ? 'text-red-700'
                  : hasHigh
                    ? 'text-orange-700'
                    : 'text-yellow-700'
            )}>
              {totalVulns === 0 
                ? 'OSV database shows no security issues for this package.'
                : 'Review the vulnerabilities below and consider updating to a fixed version.'}
            </p>
            
            {totalVulns > 0 && (
              <div className="mt-3 flex gap-2">
                {groupedVulns.CRITICAL.length > 0 && (
                  <span className="rounded-full bg-red-600 px-2 py-1 text-xs font-medium text-white">
                    {groupedVulns.CRITICAL.length} Critical
                  </span>
                )}
                {groupedVulns.HIGH.length > 0 && (
                  <span className="rounded-full bg-orange-500 px-2 py-1 text-xs font-medium text-white">
                    {groupedVulns.HIGH.length} High
                  </span>
                )}
                {groupedVulns.MEDIUM.length > 0 && (
                  <span className="rounded-full bg-yellow-500 px-2 py-1 text-xs font-medium text-white">
                    {groupedVulns.MEDIUM.length} Medium
                  </span>
                )}
                {groupedVulns.LOW.length > 0 && (
                  <span className="rounded-full bg-blue-500 px-2 py-1 text-xs font-medium text-white">
                    {groupedVulns.LOW.length} Low
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vulnerabilities List */}
      {totalVulns > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Vulnerability Details</h4>
          
          {(Object.keys(groupedVulns) as SeverityLevel[]).map(severity => 
            groupedVulns[severity].map(vuln => (
              <div 
                key={vuln.id}
                className="rounded-lg overflow-hidden"
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', borderWidth: '1px' }}
              >
                <button
                  onClick={() => toggleExpand(vuln.id)}
                  className="flex w-full items-center justify-between p-4 text-left hover:opacity-90"
                  style={{ backgroundColor: 'var(--card-bg)' }}
                >
                  <div className="flex items-center gap-3">
                    <span className={cn('rounded px-2 py-1 text-xs font-bold', getSeverityColor(severity))}>
                      {severity}
                    </span>
                    <span className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>{vuln.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://osv.dev/vulnerability/${vuln.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-sm hover:underline"
                      style={{ color: 'var(--accent)' }}
                    >
                      View on OSV
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    {expandedVulns.has(vuln.id) ? (
                      <ChevronUp className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
                    ) : (
                      <ChevronDown className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
                    )}
                  </div>
                </button>
                
                {expandedVulns.has(vuln.id) && (
                  <div className="border-t p-4" style={{ borderColor: 'var(--border)' }}>
                    <h5 className="mb-2 font-semibold" style={{ color: 'var(--text-primary)' }}>{vuln.summary}</h5>
                    <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{vuln.details}</p>
                    
                    {vuln.aliases && vuln.aliases.length > 0 && (
                      <div className="mb-3">
                        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Also known as:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {vuln.aliases.map(alias => (
                            <span key={alias} className="rounded px-2 py-1 text-xs" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                              {alias}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {vuln.affected && vuln.affected.length > 0 && (
                      <div>
                        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Affected versions:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {vuln.affected[0].versions?.slice(0, 10).map(v => (
                            <span key={v} className="rounded px-2 py-1 text-xs" style={{ backgroundColor: 'var(--error-light)', color: 'var(--error)' }}>
                              {v}
                            </span>
                          ))}
                          {vuln.affected[0].versions && vuln.affected[0].versions.length > 10 && (
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              +{vuln.affected[0].versions.length - 10} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      Published: {new Date(vuln.published).toLocaleDateString()}
                      {vuln.modified && (
                        <span className="ml-3">
                          Modified: {new Date(vuln.modified).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Data Source Info */}
      <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Security data provided by{' '}
            <a 
              href="https://osv.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: 'var(--accent)' }}
            >
              OSV (Open Source Vulnerabilities)
            </a>
          </span>
        </div>
      </div>
    </div>
  )
}
