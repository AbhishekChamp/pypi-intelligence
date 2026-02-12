import { useState, useCallback } from 'react'
import { Upload, AlertTriangle, CheckCircle, RefreshCw, Search, X } from 'lucide-react'
import { cn } from '@/utils'

interface AnalyzedPackage {
  name: string
  version: string
  latestVersion?: string
  isOutdated: boolean
  isVulnerable: boolean
  vulnerabilities: string[]
  size?: string
  hasWheel: boolean
  pythonCompatibility: string[]
  license?: string
}

interface EnvironmentAnalysis {
  totalPackages: number
  outdatedPackages: AnalyzedPackage[]
  vulnerablePackages: AnalyzedPackage[]
  packagesWithoutWheels: AnalyzedPackage[]
  licenseIssues: AnalyzedPackage[]
  totalSize?: string
}

export function VirtualEnvironmentAnalyzer() {
  const [isDragging, setIsDragging] = useState(false)
  const [analysis, setAnalysis] = useState<EnvironmentAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [filter, setFilter] = useState<'all' | 'outdated' | 'vulnerable' | 'no-wheels'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const parsePipFreeze = (content: string): Array<{ name: string; version: string }> => {
    const packages: Array<{ name: string; version: string }> = []
    const lines = content.split('\n')

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('-')) continue

      // Handle format: package==1.0.0 or package===1.0.0 (URL-based installs)
      const match = trimmed.match(/^([a-zA-Z0-9][a-zA-Z0-9._-]*)===?(.+)$/)
      if (match) {
        packages.push({
          name: match[1],
          version: match[2].replace(/\s*;.*/, '').trim() // Remove environment markers
        })
      }
    }

    return packages
  }

  const analyzePackage = async (name: string, version: string): Promise<AnalyzedPackage> => {
    const result: AnalyzedPackage = {
      name,
      version,
      isOutdated: false,
      isVulnerable: false,
      vulnerabilities: [],
      hasWheel: false,
      pythonCompatibility: []
    }

    try {
      const response = await fetch(`https://pypi.org/pypi/${name}/json`)
      if (!response.ok) return result

      const data = await response.json()
      
      result.latestVersion = data.info.version
      result.isOutdated = data.info.version !== version
      result.license = data.info.license

      // Check for wheels
      const currentVersionFiles = data.releases[version] || []
      result.hasWheel = currentVersionFiles.some((f: { packagetype: string }) => f.packagetype === 'bdist_wheel')

      // Parse Python compatibility
      const classifiers = data.info.classifiers || []
      const versionRegex = /Programming Language :: Python :: (\d+\.\d+)/
      classifiers.forEach((c: string) => {
        const match = c.match(versionRegex)
        if (match && !result.pythonCompatibility.includes(match[1])) {
          result.pythonCompatibility.push(match[1])
        }
      })

      // Check security (simplified - in real implementation would call OSV API)
      // This is a placeholder - real implementation would check OSV
      result.isVulnerable = false

    } catch {
      // Package not found or network error
    }

    return result
  }

  const handleFileUpload = useCallback(async (uploadedFiles: FileList | null) => {
    if (!uploadedFiles) return

    const file = uploadedFiles[0]
    const content = await file.text()
    const packages = parsePipFreeze(content)

    setIsAnalyzing(true)
    setProgress({ current: 0, total: packages.length })

    const analyzed: AnalyzedPackage[] = []
    
    for (let i = 0; i < packages.length; i++) {
      const pkg = packages[i]
      setProgress({ current: i + 1, total: packages.length })
      
      const analysis = await analyzePackage(pkg.name, pkg.version)
      analyzed.push(analysis)
    }

    const analysisResult: EnvironmentAnalysis = {
      totalPackages: analyzed.length,
      outdatedPackages: analyzed.filter(p => p.isOutdated),
      vulnerablePackages: analyzed.filter(p => p.isVulnerable),
      packagesWithoutWheels: analyzed.filter(p => !p.hasWheel),
      licenseIssues: analyzed.filter(p => !p.license || p.license === 'Unknown')
    }

    setAnalysis(analysisResult)
    setIsAnalyzing(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileUpload(e.dataTransfer.files)
  }, [handleFileUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const getFilteredPackages = () => {
    if (!analysis) return []

    let packages: AnalyzedPackage[] = []
    switch (filter) {
      case 'outdated':
        packages = analysis.outdatedPackages
        break
      case 'vulnerable':
        packages = analysis.vulnerablePackages
        break
      case 'no-wheels':
        packages = analysis.packagesWithoutWheels
        break
      default:
        packages = [
          ...analysis.outdatedPackages,
          ...analysis.vulnerablePackages,
          ...analysis.packagesWithoutWheels
        ]
    }

    if (searchTerm) {
      packages = packages.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return packages
  }

  const filteredPackages = getFilteredPackages()

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      {!analysis && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'rounded-lg border-2 border-dashed p-8 text-center transition-colors',
            isDragging
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-(--border) hover:border-(--accent)'
          )}
          style={{ backgroundColor: 'var(--card-bg)' }}
        >
          <Upload className="mx-auto mb-4 h-12 w-12" style={{ color: 'var(--text-muted)' }} />
          <p className="mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>
            Drop your pip freeze output here
          </p>
          <p className="mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>
            Run &quot;pip freeze &gt; requirements.txt&quot; and upload the file
          </p>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-(--accent) px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90">
            <RefreshCw className="h-4 w-4" />
            Select File
            <input
              type="file"
              accept=".txt"
              className="hidden"
              onChange={e => handleFileUpload(e.target.files)}
            />
          </label>
        </div>
      )}

      {/* Progress */}
      {isAnalyzing && (
        <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
          <div className="mb-4 flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" style={{ color: 'var(--accent)' }} />
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
              Analyzing environment... ({progress.current} / {progress.total})
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-(--bg-tertiary)">
            <div
              className="h-full rounded-full bg-(--accent) transition-all"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Results Summary */}
      {analysis && !isAnalyzing && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div 
              className="rounded-lg border p-4 cursor-pointer transition-colors"
              style={{ 
                backgroundColor: filter === 'all' ? 'var(--accent-light)' : 'var(--card-bg)',
                borderColor: 'var(--border)'
              }}
              onClick={() => setFilter('all')}
            >
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {analysis.totalPackages}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Packages</p>
            </div>
            
            <div 
              className="rounded-lg border p-4 cursor-pointer transition-colors"
              style={{ 
                backgroundColor: filter === 'outdated' ? 'var(--warning-light)' : 'var(--card-bg)',
                borderColor: analysis.outdatedPackages.length > 0 ? 'var(--warning)' : 'var(--border)'
              }}
              onClick={() => setFilter('outdated')}
            >
              <p className="text-2xl font-bold" style={{ color: analysis.outdatedPackages.length > 0 ? 'var(--warning)' : 'var(--success)' }}>
                {analysis.outdatedPackages.length}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Outdated</p>
            </div>
            
            <div 
              className="rounded-lg border p-4 cursor-pointer transition-colors"
              style={{ 
                backgroundColor: filter === 'vulnerable' ? 'var(--error-light)' : 'var(--card-bg)',
                borderColor: analysis.vulnerablePackages.length > 0 ? 'var(--error)' : 'var(--border)'
              }}
              onClick={() => setFilter('vulnerable')}
            >
              <p className="text-2xl font-bold" style={{ color: analysis.vulnerablePackages.length > 0 ? 'var(--error)' : 'var(--success)' }}>
                {analysis.vulnerablePackages.length}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Vulnerable</p>
            </div>
            
            <div 
              className="rounded-lg border p-4 cursor-pointer transition-colors"
              style={{ 
                backgroundColor: filter === 'no-wheels' ? 'var(--warning-light)' : 'var(--card-bg)',
                borderColor: analysis.packagesWithoutWheels.length > 0 ? 'var(--warning)' : 'var(--border)'
              }}
              onClick={() => setFilter('no-wheels')}
            >
              <p className="text-2xl font-bold" style={{ color: analysis.packagesWithoutWheels.length > 0 ? 'var(--warning)' : 'var(--success)' }}>
                {analysis.packagesWithoutWheels.length}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No Wheels</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search packages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border py-2 pl-10 pr-4 text-sm"
              style={{ 
                backgroundColor: 'var(--bg-tertiary)', 
                borderColor: 'var(--border)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          {/* Package List */}
          <div className="rounded-lg border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
            <div className="border-b px-4 py-3" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {filter === 'all' ? 'All Issues' : filter === 'outdated' ? 'Outdated Packages' : filter === 'vulnerable' ? 'Vulnerable Packages' : 'Packages Without Wheels'}
                </h3>
                <button
                  onClick={() => { setAnalysis(null); setFilter('all'); setSearchTerm(''); }}
                  className="rounded p-1 hover:bg-(--bg-tertiary)"
                >
                  <X className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {filteredPackages.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle className="mx-auto mb-2 h-12 w-12" style={{ color: 'var(--success)' }} />
                  <p style={{ color: 'var(--text-muted)' }}>No issues found!</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="sticky top-0" style={{ backgroundColor: 'var(--card-bg)' }}>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th className="px-4 py-2 text-left text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Package</th>
                      <th className="px-4 py-2 text-left text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Current</th>
                      <th className="px-4 py-2 text-left text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Latest</th>
                      <th className="px-4 py-2 text-left text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Issues</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPackages.map((pkg, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td className="px-4 py-3 font-mono text-sm" style={{ color: 'var(--text-primary)' }}>
                          {pkg.name}
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {pkg.version}
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {pkg.latestVersion || 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {pkg.isOutdated && (
                              <span 
                                className="rounded px-2 py-1 text-xs"
                                style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning)' }}
                              >
                                Outdated
                              </span>
                            )}
                            {!pkg.hasWheel && (
                              <span 
                                className="rounded px-2 py-1 text-xs"
                                style={{ backgroundColor: 'var(--error-light)', color: 'var(--error)' }}
                              >
                                No Wheel
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Recommendations */}
          {(analysis.outdatedPackages.length > 0 || analysis.packagesWithoutWheels.length > 0) && (
            <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
              <h4 className="mb-3 flex items-center gap-2 font-semibold" style={{ color: 'var(--text-primary)' }}>
                <AlertTriangle className="h-5 w-5" style={{ color: 'var(--warning)' }} />
                Recommendations
              </h4>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                {analysis.outdatedPackages.length > 0 && (
                  <li>• Update {analysis.outdatedPackages.length} outdated packages to their latest versions</li>
                )}
                {analysis.packagesWithoutWheels.length > 0 && (
                  <li>• {analysis.packagesWithoutWheels.length} packages lack wheel distributions - these may require build tools</li>
                )}
                <li>• Consider using `pip-audit` for comprehensive security scanning</li>
                <li>• Use `pip-review` to automatically check for outdated packages</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}