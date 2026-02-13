import { useState } from 'react'
import type { VersionConflict, ConflictResolution } from '@/types'
import { 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight,
  Package,
  GitBranch,
  Trash2,
  Wand2
} from 'lucide-react'

interface DependencyRequirement {
  package: string
  version: string
  specifier: string
}

interface ConflictResolverProps {
  onResolve?: (resolution: ConflictResolution) => void
}

export function ConflictResolver({ onResolve }: ConflictResolverProps) {
  const [requirements, setRequirements] = useState<DependencyRequirement[]>([
    { package: '', version: '', specifier: '>=' },
  ])
  const [conflicts, setConflicts] = useState<VersionConflict[]>([])
  const [analysis, setAnalysis] = useState<ConflictResolution | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const addRequirement = () => {
    setRequirements(prev => [...prev, { package: '', version: '', specifier: '>=' }])
  }

  const removeRequirement = (index: number) => {
    setRequirements(prev => prev.filter((_, i) => i !== index))
  }

  const updateRequirement = (index: number, field: keyof DependencyRequirement, value: string) => {
    setRequirements(prev => prev.map((req, i) => 
      i === index ? { ...req, [field]: value } : req
    ))
  }

  const analyzeConflicts = () => {
    setIsAnalyzing(true)
    
    // Group requirements by package name
    const packageGroups: Record<string, DependencyRequirement[]> = {}
    
    requirements.forEach(req => {
      if (!req.package.trim()) return
      
      const pkgName = req.package.toLowerCase()
      if (!packageGroups[pkgName]) {
        packageGroups[pkgName] = []
      }
      packageGroups[pkgName].push(req)
    })

    // Find conflicts
    const detectedConflicts: VersionConflict[] = []
    
    Object.entries(packageGroups).forEach(([pkgName, reqs]) => {
      if (reqs.length > 1) {
        // Multiple requirements for the same package
        detectedConflicts.push({
          package: pkgName,
          requiredBy: reqs.map(req => ({
            package: req.package,
            version: req.version,
            specifier: req.specifier,
          })),
          conflictType: reqs.length > 1 ? 'direct' : 'transitive',
          suggestedResolution: suggestResolution(reqs),
          resolvable: true,
        })
      }
    })

    // Generate resolution suggestions
    const suggestions = detectedConflicts.map(conflict => ({
      action: determineAction(conflict) as 'upgrade' | 'downgrade' | 'pin',
      package: conflict.package,
      targetVersion: conflict.suggestedResolution || 'latest',
      reason: generateReason(conflict),
    }))

    const resolution: ConflictResolution = {
      conflicts: detectedConflicts,
      suggestions,
    }

    setConflicts(detectedConflicts)
    setAnalysis(resolution)
    onResolve?.(resolution)
    setIsAnalyzing(false)
  }

  const suggestResolution = (requirements: DependencyRequirement[]): string => {
    // Simple logic: suggest using the highest version
    const versions = requirements
      .map(r => r.version)
      .filter(v => v && v.trim() !== '')
    
    if (versions.length === 0) return 'latest'
    
    // Sort versions (simplified - in real implementation would use semver)
    versions.sort((a, b) => {
      const aParts = a.split('.').map(Number)
      const bParts = b.split('.').map(Number)
      
      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aVal = aParts[i] || 0
        const bVal = bParts[i] || 0
        if (aVal > bVal) return -1
        if (aVal < bVal) return 1
      }
      return 0
    })
    
    return versions[0]
  }

  const determineAction = (conflict: VersionConflict): string => {
    const versions = conflict.requiredBy.map(r => r.version)
    const uniqueVersions = [...new Set(versions)]
    
    if (uniqueVersions.length === 1) return 'pin'
    
    // Can upgrade to highest version
    return 'upgrade'
  }

  const generateReason = (conflict: VersionConflict): string => {
    const versions = conflict.requiredBy.map(r => `${r.specifier}${r.version}`).join(', ')
    return `Package ${conflict.package} has conflicting requirements: ${versions}`
  }

  const clearAll = () => {
    setRequirements([{ package: '', version: '', specifier: '>=' }])
    setConflicts([])
    setAnalysis(null)
  }

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="rounded-lg p-4 bg-blue-50 border border-blue-200">
        <h3 className="font-medium text-blue-900 mb-2">Dependency Conflict Resolver</h3>
        <p className="text-sm text-blue-700">
          Enter your project dependencies to detect version conflicts and get resolution suggestions. 
          This tool helps you identify packages with incompatible version requirements.
        </p>
      </div>

      {/* Requirements Input */}
      <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--card-bg)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            Project Dependencies
          </h3>
          <button
            onClick={clearAll}
            className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </button>
        </div>

        <div className="space-y-3">
          {requirements.map((req, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={req.package}
                onChange={(e) => updateRequirement(index, 'package', e.target.value)}
                placeholder="Package name (e.g., requests)"
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              />
              <select
                value={req.specifier}
                onChange={(e) => updateRequirement(index, 'specifier', e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
                style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              >
                <option value=">=">&gt;=</option>
                <option value="==">==</option>
                <option value="<=">&lt;=</option>
                <option value="~=">~=</option>
                <option value=">">&gt;</option>
                <option value="<">&lt;</option>
              </select>
              <input
                type="text"
                value={req.version}
                onChange={(e) => updateRequirement(index, 'version', e.target.value)}
                placeholder="Version"
                className="w-32 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              />
              {requirements.length > 1 && (
                <button
                  onClick={() => removeRequirement(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={addRequirement}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Package className="h-4 w-4" />
            Add Package
          </button>
          <button
            onClick={analyzeConflicts}
            disabled={isAnalyzing || requirements.filter(r => r.package.trim()).length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Wand2 className="h-4 w-4" />
            {isAnalyzing ? 'Analyzing...' : 'Analyze Conflicts'}
          </button>
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-4">
          {/* Summary */}
          <div className={`rounded-lg p-4 border ${
            conflicts.length === 0 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center gap-3">
              {conflicts.length === 0 ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              )}
              <div>
                <h3 className={`font-semibold ${
                  conflicts.length === 0 ? 'text-green-900' : 'text-yellow-900'
                }`}>
                  {conflicts.length === 0 
                    ? 'No Conflicts Detected' 
                    : `${conflicts.length} Conflict${conflicts.length > 1 ? 's' : ''} Found`}
                </h3>
                <p className={`text-sm ${
                  conflicts.length === 0 ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {conflicts.length === 0 
                    ? 'All your dependencies are compatible!' 
                    : 'Review the conflicts and suggested resolutions below.'}
                </p>
              </div>
            </div>
          </div>

          {/* Conflict Details */}
          {conflicts.length > 0 && (
            <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--card-bg)' }}>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                <GitBranch className="h-5 w-5 inline mr-2" />
                Conflict Details
              </h3>
              
              <div className="space-y-4">
                {conflicts.map((conflict, index) => (
                  <div 
                    key={index}
                    className="rounded-lg p-4 border border-red-200 bg-red-50"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-red-900">
                          {conflict.package}
                        </h4>
                        <p className="text-sm text-red-700 mt-1">
                          Required by:
                        </p>
                        <ul className="mt-2 space-y-1">
                          {conflict.requiredBy.map((req, i) => (
                            <li key={i} className="text-sm text-red-600 flex items-center gap-2">
                              <ArrowRight className="h-3 w-3" />
                              {req.package} {req.specifier}{req.version}
                            </li>
                          ))}
                        </ul>
                        
                        {conflict.suggestedResolution && (
                          <div className="mt-3 p-2 bg-green-100 rounded text-sm">
                            <span className="font-medium text-green-800">
                              Suggested resolution:
                            </span>
                            <code className="ml-2 px-2 py-0.5 bg-green-200 rounded text-green-900">
                              {conflict.package}=={conflict.suggestedResolution}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resolution Suggestions */}
          {analysis.suggestions.length > 0 && (
            <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--card-bg)' }}>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                <CheckCircle className="h-5 w-5 inline mr-2" />
                Resolution Suggestions
              </h3>
              
              <div className="space-y-2">
                {analysis.suggestions.map((suggestion, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        suggestion.action === 'upgrade' ? 'bg-green-100 text-green-700' :
                        suggestion.action === 'downgrade' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {suggestion.action}
                      </span>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {suggestion.package}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        → {suggestion.targetVersion}
                      </span>
                    </div>
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {suggestion.reason}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}