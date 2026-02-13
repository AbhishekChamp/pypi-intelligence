import { useState, useEffect } from 'react'
import type { MonitoredProject, ProjectPackage } from '@/types'
import { Layout } from '@/components/Layout'
import { 
  Plus, 
  Folder, 
  Trash2, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Package,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Upload,
  X,
  ChevronUp,
  ChevronDown as ChevronDownIcon
} from 'lucide-react'
import { fetchPackageInfo } from '@/api/pypi'
import { FileCode } from 'lucide-react'

const STORAGE_KEY = 'pypi-intelligence-projects'

export function ProjectWorkspacePage() {
  const [projects, setProjects] = useState<MonitoredProject[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
  const [refreshing, setRefreshing] = useState<string | null>(null)

  // Load projects from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setProjects(parsed)
      } catch {
        console.error('Failed to parse stored projects')
      }
    }
  }, [])

  // Save projects to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  }, [projects])

  const createProject = () => {
    if (!newProjectName.trim()) return

    const newProject: MonitoredProject = {
      id: Date.now().toString(),
      name: newProjectName.trim(),
      description: newProjectDescription.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      packages: [],
      healthScore: 0,
      vulnerabilityCount: 0,
      outdatedCount: 0,
    }

    setProjects(prev => [...prev, newProject])
    setNewProjectName('')
    setNewProjectDescription('')
    setIsCreating(false)
  }

  const deleteProject = (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      setProjects(prev => prev.filter(p => p.id !== id))
    }
  }

  const toggleExpanded = (id: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const addPackageToProject = async (projectId: string, packageName: string, version?: string) => {
    try {
      const packageData = await fetchPackageInfo(packageName)
      const latestVersion = packageData.info.version
      
      const newPackage: ProjectPackage = {
        name: packageName,
        version: version || latestVersion,
        specifier: version ? `==${version}` : `>=${latestVersion}`,
        latestVersion,
        outdated: version ? version !== latestVersion : false,
        breakingRisk: 'none',
        healthScore: null,
        vulnerabilities: 0,
        license: packageData.info.license,
      }

      setProjects(prev => prev.map(project => {
        if (project.id === projectId) {
          // Check if package already exists
          if (project.packages.some(p => p.name.toLowerCase() === packageName.toLowerCase())) {
            return project
          }
          
          return {
            ...project,
            packages: [...project.packages, newPackage],
            updatedAt: new Date().toISOString(),
          }
        }
        return project
      }))
    } catch (error) {
      console.error(`Failed to add package ${packageName}:`, error)
      alert(`Failed to add package: ${packageName}`)
    }
  }

  const removePackageFromProject = (projectId: string, packageName: string) => {
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          packages: project.packages.filter(p => p.name !== packageName),
          updatedAt: new Date().toISOString(),
        }
      }
      return project
    }))
  }

  const refreshProject = async (projectId: string) => {
    setRefreshing(projectId)
    
    const project = projects.find(p => p.id === projectId)
    if (!project) {
      setRefreshing(null)
      return
    }

    // Refresh all packages in the project
    const updatedPackages: ProjectPackage[] = []
    let vulnerabilityCount = 0
    let outdatedCount = 0

    for (const pkg of project.packages) {
      try {
        const packageData = await fetchPackageInfo(pkg.name)
        const latestVersion = packageData.info.version
        const isOutdated = pkg.version !== latestVersion
        
        if (isOutdated) {
          outdatedCount++
        }

        updatedPackages.push({
          ...pkg,
          latestVersion,
          outdated: isOutdated,
          license: packageData.info.license,
        })
      } catch {
        // Keep the old package data if fetch fails
        updatedPackages.push(pkg)
      }
    }

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          packages: updatedPackages,
          outdatedCount,
          vulnerabilityCount,
          updatedAt: new Date().toISOString(),
        }
      }
      return p
    }))

    setRefreshing(null)
  }

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Project Workspace
            </h1>
            <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
              Monitor dependencies across multiple projects
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>

        {/* Create Project Form */}
        {isCreating && (
          <div className="rounded-lg p-6 mb-6" style={{ backgroundColor: 'var(--card-bg)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Create New Project
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  Project Name *
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="My Awesome Project"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  Description
                </label>
                <input
                  type="text"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="A brief description of your project"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={createProject}
                  disabled={!newProjectName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Create Project
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false)
                    setNewProjectName('')
                    setNewProjectDescription('')
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Projects List */}
        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="text-center py-12 rounded-lg" style={{ backgroundColor: 'var(--card-bg)' }}>
              <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" style={{ color: 'var(--text-muted)' }} />
              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                No Projects Yet
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Create your first project to start monitoring dependencies
              </p>
            </div>
          ) : (
            projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                isExpanded={expandedProjects.has(project.id)}
                onToggle={() => toggleExpanded(project.id)}
                onDelete={() => deleteProject(project.id)}
                onRefresh={() => refreshProject(project.id)}
                isRefreshing={refreshing === project.id}
                onAddPackage={(pkg, version) => addPackageToProject(project.id, pkg, version)}
                onRemovePackage={(pkg) => removePackageFromProject(project.id, pkg)}
              />
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}

interface ProjectCardProps {
  project: MonitoredProject
  isExpanded: boolean
  onToggle: () => void
  onDelete: () => void
  onRefresh: () => void
  isRefreshing: boolean
  onAddPackage: (packageName: string, version?: string) => void
  onRemovePackage: (packageName: string) => void
}

function ProjectCard({
  project,
  isExpanded,
  onToggle,
  onDelete,
  onRefresh,
  isRefreshing,
  onAddPackage,
  onRemovePackage,
}: ProjectCardProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [packageVersion, setPackageVersion] = useState('')
  const [showVersionInput, setShowVersionInput] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [showUploadSection, setShowUploadSection] = useState(false)

  const handleAddPackage = () => {
    if (searchQuery.trim()) {
      onAddPackage(searchQuery.trim(), packageVersion.trim() || undefined)
      setSearchQuery('')
      setPackageVersion('')
      setShowVersionInput(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    for (const file of files) {
      try {
        const text = await file.text()
        const fileName = file.name
        setUploadedFiles(prev => [...prev, fileName])

        // Parse based on file type
        if (fileName === 'requirements.txt') {
          parseRequirementsTxt(text)
        } else if (fileName === 'pyproject.toml') {
          parsePyProjectToml(text)
        }
      } catch (error) {
        console.error(`Failed to parse ${file.name}:`, error)
        alert(`Failed to parse ${file.name}`)
      }
    }
    
    // Clear the input
    event.target.value = ''
  }

  const parseRequirementsTxt = (content: string) => {
    const lines = content.split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('-')) continue

      // Match package name and optional version
      const match = trimmed.match(/^([a-zA-Z0-9_-]+)(?:[<>=~!]+(.+))?/)
      if (match) {
        const [, name, version] = match
        onAddPackage(name, version)
      }
    }
  }

  const parsePyProjectToml = (content: string) => {
    // Simple regex-based parsing for dependencies
    const depPatterns = [
      /dependencies\s*=\s*\[([^\]]+)\]/s,
      /\[project\]\s*\n[^\[]*dependencies\s*=\s*\[([^\]]+)\]/s,
    ]

    for (const pattern of depPatterns) {
      const match = content.match(pattern)
      if (match) {
        const depsStr = match[1]
        const depMatches = depsStr.matchAll(/"([^"]+)"/g)
        for (const depMatch of depMatches) {
          const dep = depMatch[1]
          const parts = dep.split(/[<>=~!]+/)
          const name = parts[0].trim()
          const version = parts[1]?.trim()
          onAddPackage(name, version)
        }
      }
    }
  }

  const clearUploadedFiles = () => {
    setUploadedFiles([])
  }

  return (
    <div className="rounded-lg shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
      {/* Project Header */}
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <button className="p-1 hover:bg-gray-100 rounded cursor-pointer">
            {isExpanded ? (
              <ChevronDown className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
            ) : (
              <ChevronRight className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
            )}
          </button>
          <Folder className="h-5 w-5 text-blue-500" />
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {project.name}
            </h3>
            {project.description && (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {project.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Stats */}
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <Package className="h-4 w-4" />
              {project.packages.length} packages
            </span>
            {project.outdatedCount > 0 && (
              <span className="flex items-center gap-1 text-yellow-600">
                <AlertTriangle className="h-4 w-4" />
                {project.outdatedCount} outdated
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRefresh()
              }}
              disabled={isRefreshing}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} style={{ color: 'var(--text-muted)' }} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Delete Project"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-4">
          {/* File Upload Section */}
          <div className="mb-4">
            <button
              onClick={() => setShowUploadSection(!showUploadSection)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              {showUploadSection ? <ChevronUp className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
              <Upload className="h-4 w-4" />
              Upload requirements.txt or pyproject.toml
            </button>
            
            {showUploadSection && (
              <div className="mt-3 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                <input
                  type="file"
                  accept=".txt,.toml"
                  onChange={handleFileUpload}
                  className="hidden"
                  id={`file-upload-${project.id}`}
                  multiple
                />
                <label
                  htmlFor={`file-upload-${project.id}`}
                  className="flex flex-col items-center justify-center cursor-pointer py-4"
                >
                  <FileCode className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Click to upload requirements.txt or pyproject.toml</span>
                  <span className="text-xs text-gray-400 mt-1">Supports multiple files</span>
                </label>
                
                {uploadedFiles.length > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Uploaded files:</span>
                      <button
                        onClick={clearUploadedFiles}
                        className="text-xs text-red-600 hover:text-red-700 cursor-pointer flex items-center gap-1"
                      >
                        <X className="h-3 w-3" />
                        Clear all
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {uploadedFiles.map((file, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                        >
                          <FileCode className="h-3 w-3" />
                          {file}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Add Package */}
          <div className="space-y-3 mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Package name (e.g., requests)"
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                onKeyDown={(e) => e.key === 'Enter' && !showVersionInput && handleAddPackage()}
              />
              <button
                onClick={() => setShowVersionInput(!showVersionInput)}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm cursor-pointer"
                style={{ color: 'var(--text-secondary)' }}
              >
                {showVersionInput ? 'Hide Version' : 'Add Version'}
              </button>
              <button
                onClick={handleAddPackage}
                disabled={!searchQuery.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Add Package
              </button>
            </div>
            
            {showVersionInput && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={packageVersion}
                  onChange={(e) => setPackageVersion(e.target.value)}
                  placeholder="Version (e.g., 2.28.1) - leave empty for latest"
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPackage()}
                />
              </div>
            )}
          </div>

          {/* Packages List */}
          {project.packages.length === 0 ? (
            <div className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>
              No packages in this project yet. Add packages manually or upload a requirements file.
            </div>
          ) : (
            <div className="space-y-2">
              {project.packages.map(pkg => (
                <PackageRow
                  key={pkg.name}
                  pkg={pkg}
                  onRemove={() => onRemovePackage(pkg.name)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface PackageRowProps {
  pkg: ProjectPackage
  onRemove: () => void
}

function PackageRow({ pkg, onRemove }: PackageRowProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-3">
        <Package className="h-4 w-4 text-blue-500" />
        <div>
          <a
            href={`/package/${pkg.name}`}
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            {pkg.name}
          </a>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>v{pkg.version}</span>
            {pkg.outdated && (
              <span className="text-yellow-600">
                → v{pkg.latestVersion} available
              </span>
            )}
            {pkg.license && (
              <span className="px-1.5 py-0.5 bg-gray-200 rounded">
                {pkg.license}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {pkg.outdated ? (
          <div className="group relative">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Update available
            </span>
          </div>
        ) : (
          <div className="group relative">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Up to date
            </span>
          </div>
        )}
        <a
          href={`/package/${pkg.name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 hover:bg-gray-200 rounded cursor-pointer"
        >
          <ExternalLink className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
        </a>
        <button
          onClick={onRemove}
          className="p-1 hover:bg-red-100 rounded group relative cursor-pointer"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Remove from project
          </span>
        </button>
      </div>
    </div>
  )
}
