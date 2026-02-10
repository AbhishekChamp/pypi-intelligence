import { useState, useCallback } from 'react'
import { Upload, FileText, X, AlertCircle, CheckCircle, Loader2, Download } from 'lucide-react'
import { cn } from '@/utils'
import { fetchPackageInfo, fetchDownloadStats, fetchSecurityVulnerabilities, type OSVVulnerability } from '@/api/pypi'
import type { PyPIPackage } from '@/types'

interface PackageAnalysis {
  name: string
  version?: string
  data?: PyPIPackage
  downloads?: { last_day: number; last_week: number; last_month: number }
  vulnerabilities?: OSVVulnerability[]
  healthScore?: number
  error?: string
  status: 'loading' | 'success' | 'error'
}

export function ProjectDependencyScanner() {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [analyses, setAnalyses] = useState<PackageAnalysis[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showReport, setShowReport] = useState(false)

  const parseRequirementsFile = async (content: string): Promise<Array<{ name: string; version?: string }>> => {
    const lines = content.split('\n')
    const packages: Array<{ name: string; version?: string }> = []

    for (const line of lines) {
      const trimmed = line.trim()
      // Skip comments, empty lines, and options
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('-')) continue

      // Parse package specifications
      // Handle formats: package, package==1.0, package>=1.0, package~=1.0, package[extra], package[extra]==1.0
      const match = trimmed.match(/^([a-zA-Z0-9_-]+)(?:\[[^\]]+\])?(.*)$/)
      if (match) {
        const name = match[1]
        const spec = match[2].trim()
        // Extract version from specifier if present
        const versionMatch = spec.match(/==\s*([^\s;]+)/)
        packages.push({
          name,
          version: versionMatch ? versionMatch[1] : undefined
        })
      }
    }

    return packages
  }

  const parsePyProjectToml = async (content: string): Promise<Array<{ name: string; version?: string }>> => {
    const packages: Array<{ name: string; version?: string }> = []
    
    // Simple regex-based parsing for dependencies
    // Match poetry/pdm format: package = "^1.0" or package = {version = "^1.0"}
    const depRegex = /^([a-zA-Z0-9_-]+)\s*=\s*(?:"([^"]+)"|\{[^}]*version\s*=\s*"([^"]+)"[^}]*\})/gm
    let match
    
    while ((match = depRegex.exec(content)) !== null) {
      packages.push({
        name: match[1],
        version: match[2] || match[3] || undefined
      })
    }

    // Also try to match PEP 621 format: dependencies = ["package==1.0"]
    const arrayDepsMatch = content.match(/dependencies\s*=\s*\[([^\]]+)\]/s)
    if (arrayDepsMatch) {
      const depsString = arrayDepsMatch[1]
      const depMatches = depsString.matchAll(/"([^"]+)"/g)
      for (const depMatch of depMatches) {
        const dep = depMatch[1]
        const parsed = await parseRequirementsFile(dep)
        packages.push(...parsed)
      }
    }

    return packages
  }

  const calculateHealthScore = (pkg: PyPIPackage, downloads: { last_month: number }, vulnerabilities: OSVVulnerability[]): number => {
    let score = 100

    // Deduct for vulnerabilities
    if (vulnerabilities.length > 0) {
      score -= Math.min(vulnerabilities.length * 15, 40)
    }

    // Deduct for old packages (no releases in 2 years)
    const lastRelease = pkg.urls[0]?.upload_time
    if (lastRelease) {
      const releaseDate = new Date(lastRelease)
      const twoYearsAgo = new Date()
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)
      if (releaseDate < twoYearsAgo) {
        score -= 20
      }
    }

    // Deduct for low popularity
    if (downloads.last_month < 1000) {
      score -= 10
    }

    // Deduct for yanked versions
    if (pkg.info.yanked) {
      score -= 30
    }

    return Math.max(0, score)
  }

  const analyzePackages = async (packages: Array<{ name: string; version?: string }>) => {
    setIsAnalyzing(true)
    setShowReport(false)
    
    // Initialize analysis states
    const initialAnalyses: PackageAnalysis[] = packages.map(pkg => ({
      name: pkg.name,
      version: pkg.version,
      status: 'loading'
    }))
    setAnalyses(initialAnalyses)

    // Analyze each package
    const results = await Promise.all(
      packages.map(async (pkg) => {
        try {
          const [data, stats, vulnerabilities] = await Promise.all([
            fetchPackageInfo(pkg.name),
            fetchDownloadStats(pkg.name),
            fetchSecurityVulnerabilities(pkg.name, pkg.version)
          ])

          const healthScore = calculateHealthScore(data, stats.data, vulnerabilities)

          return {
            name: pkg.name,
            version: pkg.version,
            data,
            downloads: stats.data,
            vulnerabilities,
            healthScore,
            status: 'success' as const
          }
        } catch (error) {
          return {
            name: pkg.name,
            version: pkg.version,
            error: error instanceof Error ? error.message : 'Unknown error',
            status: 'error' as const
          }
        }
      })
    )

    setAnalyses(results)
    setIsAnalyzing(false)
    setShowReport(true)
  }

  const handleFileUpload = useCallback(async (uploadedFiles: FileList | null) => {
    if (!uploadedFiles) return

    const newFiles = Array.from(uploadedFiles)
    setFiles(prev => [...prev, ...newFiles])

    // Parse all files and collect packages
    const allPackages: Array<{ name: string; version?: string }> = []

    for (const file of newFiles) {
      const content = await file.text()
      const fileName = file.name.toLowerCase()

      let packages: Array<{ name: string; version?: string }> = []
      
      if (fileName === 'requirements.txt' || fileName.endsWith('.txt')) {
        packages = await parseRequirementsFile(content)
      } else if (fileName === 'pyproject.toml' || fileName.endsWith('.toml')) {
        packages = await parsePyProjectToml(content)
      }

      allPackages.push(...packages)
    }

    // Remove duplicates
    const uniquePackages = Array.from(
      new Map(allPackages.map(p => [p.name.toLowerCase(), p])).values()
    )

    if (uniquePackages.length > 0) {
      await analyzePackages(uniquePackages)
    }
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

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const generateReport = () => {
    const successful = analyses.filter(a => a.status === 'success')
    const failed = analyses.filter(a => a.status === 'error')
    const withVulnerabilities = successful.filter(a => (a.vulnerabilities?.length || 0) > 0)
    const avgHealthScore = successful.reduce((sum, a) => sum + (a.healthScore || 0), 0) / successful.length || 0

    return {
      total: analyses.length,
      successful: successful.length,
      failed: failed.length,
      withVulnerabilities: withVulnerabilities.length,
      avgHealthScore: Math.round(avgHealthScore),
      packages: successful
    }
  }

  const report = showReport ? generateReport() : null

  return (
    <div className="space-y-6">
      {/* Upload Area */}
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
          Drop your dependency files here
        </p>
        <p className="mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>
          Supports requirements.txt, pyproject.toml, Pipfile
        </p>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-(--accent) px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90">
          <FileText className="h-4 w-4" />
          Select Files
          <input
            type="file"
            multiple
            accept=".txt,.toml,.lock"
            className="hidden"
            onChange={e => handleFileUpload(e.target.files)}
          />
        </label>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Uploaded Files</h4>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg p-3"
              style={{ backgroundColor: 'var(--bg-tertiary)' }}
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {file.name}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="rounded p-1 transition-colors hover:bg-(--error-light)"
              >
                <X className="h-4 w-4" style={{ color: 'var(--error)' }} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Analysis Progress */}
      {isAnalyzing && (
        <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          <div className="mb-4 flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--accent)' }} />
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
              Analyzing {analyses.length} packages...
            </span>
          </div>
          <div className="space-y-2">
            {analyses.slice(0, 5).map((analysis, index) => (
              <div key={index} className="flex items-center gap-2">
                {analysis.status === 'loading' && (
                  <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--text-muted)' }} />
                )}
                {analysis.status === 'success' && (
                  <CheckCircle className="h-4 w-4" style={{ color: 'var(--success)' }} />
                )}
                {analysis.status === 'error' && (
                  <AlertCircle className="h-4 w-4" style={{ color: 'var(--error)' }} />
                )}
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {analysis.name}
                </span>
              </div>
            ))}
            {analyses.length > 5 && (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                ... and {analyses.length - 5} more
              </p>
            )}
          </div>
        </div>
      )}

      {/* Summary Report */}
      {report && (
        <div className="rounded-lg border p-6" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
          <h3 className="mb-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Dependency Health Report
          </h3>
          
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {report.total}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Packages</p>
            </div>
            <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <p className="text-2xl font-bold" style={{ color: 'var(--success)' }}>
                {report.successful}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Analyzed</p>
            </div>
            <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--error-light)' }}>
              <p className="text-2xl font-bold" style={{ color: 'var(--error)' }}>
                {report.withVulnerabilities}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>With Vulnerabilities</p>
            </div>
            <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <p className="text-2xl font-bold" style={{ color: report.avgHealthScore >= 70 ? 'var(--success)' : report.avgHealthScore >= 40 ? 'var(--warning)' : 'var(--error)' }}>
                {report.avgHealthScore}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Avg Health Score</p>
            </div>
          </div>

          {/* Package Details Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="pb-2 text-left text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Package</th>
                  <th className="pb-2 text-left text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Version</th>
                  <th className="pb-2 text-left text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Health</th>
                  <th className="pb-2 text-left text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Downloads/mo</th>
                  <th className="pb-2 text-left text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Security</th>
                </tr>
              </thead>
              <tbody>
                {report.packages.slice(0, 10).map((pkg, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td className="py-3 font-mono text-sm" style={{ color: 'var(--text-primary)' }}>
                      {pkg.name}
                    </td>
                    <td className="py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {pkg.data?.info.version || pkg.version || 'latest'}
                    </td>
                    <td className="py-3">
                      <span
                        className="rounded px-2 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: (pkg.healthScore || 0) >= 70 ? 'var(--success-light)' : (pkg.healthScore || 0) >= 40 ? 'var(--warning-light)' : 'var(--error-light)',
                          color: (pkg.healthScore || 0) >= 70 ? 'var(--success)' : (pkg.healthScore || 0) >= 40 ? 'var(--warning)' : 'var(--error)'
                        }}
                      >
                        {pkg.healthScore}/100
                      </span>
                    </td>
                    <td className="py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {pkg.downloads?.last_month.toLocaleString() || 'N/A'}
                    </td>
                    <td className="py-3">
                      {(pkg.vulnerabilities?.length || 0) > 0 ? (
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--error)' }}>
                          <AlertCircle className="h-3 w-3" />
                          {pkg.vulnerabilities?.length} issues
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--success)' }}>
                          <CheckCircle className="h-3 w-3" />
                          Clean
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {report.packages.length > 10 && (
              <p className="mt-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                ... and {report.packages.length - 10} more packages
              </p>
            )}
          </div>

          {/* Download Report Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => {
                const reportData = JSON.stringify(report, null, 2)
                const blob = new Blob([reportData], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'dependency-report.json'
                a.click()
                URL.revokeObjectURL(url)
              }}
              className="flex items-center gap-2 rounded-lg bg-(--accent) px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
            >
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
