import { useState } from 'react'
import { Plus, X, Download, Copy, Check, FileText, Settings, Package } from 'lucide-react'
import { fetchPackageInfo } from '@/api/pypi'

type VersionSpecifier = '==' | '>=' | '<=' | '>' | '<' | '~=' | '!=' | 'compatible'

interface Dependency {
  id: string
  name: string
  version: string
  specifier: VersionSpecifier
  extras: string[]
  environment?: string
}

interface GeneratedFile {
  name: string
  content: string
  format: 'txt' | 'toml' | 'lock'
}

const VERSION_SPECIFIERS: { value: VersionSpecifier; label: string; description: string }[] = [
  { value: '>=', label: '>=', description: 'Minimum version (recommended)' },
  { value: '==', label: '==', description: 'Exact version (pinned)' },
  { value: '~=', label: '~=', description: 'Compatible release' },
  { value: '<=', label: '<=', description: 'Maximum version' },
  { value: '>', label: '>', description: 'Greater than' },
  { value: '<', label: '<', description: 'Less than' },
  { value: '!=', label: '!=', description: 'Not equal' },
]

export function RequirementsGenerator() {
  const [dependencies, setDependencies] = useState<Dependency[]>([])
  const [newPackageName, setNewPackageName] = useState('')
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([])
  const [copiedFile, setCopiedFile] = useState<string | null>(null)
  const [projectName, setProjectName] = useState('my-project')
  const [pythonVersion, setPythonVersion] = useState('>=3.8')

  const addDependency = async () => {
    if (!newPackageName.trim()) return

    const name = newPackageName.trim().toLowerCase()
    
    try {
      // Fetch package info to get latest version
      const pkg = await fetchPackageInfo(name)
      const latestVersion = pkg.info.version

      const newDep: Dependency = {
        id: Math.random().toString(36).substr(2, 9),
        name: pkg.info.name,
        version: latestVersion,
        specifier: '>=',
        extras: [],
      }

      setDependencies([...dependencies, newDep])
      setNewPackageName('')
      generateFiles([...dependencies, newDep])
    } catch {
      // If fetch fails, add with empty version
      const newDep: Dependency = {
        id: Math.random().toString(36).substr(2, 9),
        name: name,
        version: '',
        specifier: '>=',
        extras: [],
      }

      setDependencies([...dependencies, newDep])
      setNewPackageName('')
      generateFiles([...dependencies, newDep])
    }
  }

  const updateDependency = (id: string, updates: Partial<Dependency>) => {
    const updated = dependencies.map(dep =>
      dep.id === id ? { ...dep, ...updates } : dep
    )
    setDependencies(updated)
    generateFiles(updated)
  }

  const removeDependency = (id: string) => {
    const updated = dependencies.filter(dep => dep.id !== id)
    setDependencies(updated)
    generateFiles(updated)
  }

  const generateFiles = (deps: Dependency[]) => {
    // Generate requirements.txt
    const requirementsTxt = deps
      .map(dep => {
        let spec = dep.name
        if (dep.extras.length > 0) {
          spec += `[${dep.extras.join(',')}]`
        }
        if (dep.version) {
          spec += `${dep.specifier}${dep.version}`
        }
        if (dep.environment) {
          spec += `; ${dep.environment}`
        }
        return spec
      })
      .join('\n')

    // Generate pyproject.toml (PEP 621)
    const pyprojectToml = `[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "${projectName}"
version = "0.1.0"
description = "Add your description here"
readme = "README.md"
requires-python = "${pythonVersion}"
dependencies = [
${deps
  .map(dep => {
    let spec = `    "${dep.name}`
    if (dep.extras.length > 0) {
      spec += `[${dep.extras.join(',')}]`
    }
    if (dep.version) {
      spec += `${dep.specifier}${dep.version}`
    }
    spec += '"'
    return spec
  })
  .join(',\n')}
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0",
    "black>=22.0",
    "ruff>=0.1.0",
]`

    // Generate poetry.lock format (simplified)
    const poetryToml = `[tool.poetry]
name = "${projectName}"
version = "0.1.0"
description = "Add your description here"
authors = ["Your Name <you@example.com>"]
readme = "README.md"

[tool.poetry.dependencies]
python = "${pythonVersion}"
${deps
  .map(dep => {
    let spec = `${dep.name} = "`
    if (dep.specifier === 'compatible') {
      spec += `^${dep.version}`
    } else if (dep.version) {
      spec += `${dep.specifier}${dep.version}`
    } else {
      spec += '*'
    }
    spec += '"'
    return spec
  })
  .join('\n')}

[tool.poetry.group.dev.dependencies]
pytest = "^7.0"
black = "^22.0"
ruff = "^0.1.0"

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"`

    // Generate Pipfile
    const pipfile = `[[source]]
url = "https://pypi.org/simple"
verify_ssl = true
name = "pypi"

[packages]
${deps
  .map(dep => {
    if (dep.version) {
      return `${dep.name} = "${dep.specifier}${dep.version}"`
    }
    return `${dep.name} = "*"`
  })
  .join('\n')}

[dev-packages]
pytest = "*"
black = "*"
ruff = "*"

[requires]
python_version = "${pythonVersion.replace('>=', '').replace('<', '').split('.').slice(0, 2).join('.')}"`

    setGeneratedFiles([
      { name: 'requirements.txt', content: requirementsTxt, format: 'txt' },
      { name: 'pyproject.toml', content: pyprojectToml, format: 'toml' },
      { name: 'poetry.toml', content: poetryToml, format: 'toml' },
      { name: 'Pipfile', content: pipfile, format: 'lock' },
    ])
  }

  const copyToClipboard = async (content: string, fileName: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedFile(fileName)
      setTimeout(() => setCopiedFile(null), 2000)
    } catch {
      console.error('Failed to copy')
    }
  }

  const downloadFile = (file: GeneratedFile) => {
    const blob = new Blob([file.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Project Settings */}
      <div
        className="rounded-lg border p-4"
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
      >
        <div className="mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5" style={{ color: 'var(--accent)' }} />
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Project Settings</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={e => {
                setProjectName(e.target.value)
                generateFiles(dependencies)
              }}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Python Version Requirement
            </label>
            <input
              type="text"
              value={pythonVersion}
              onChange={e => {
                setPythonVersion(e.target.value)
                generateFiles(dependencies)
              }}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Add Package */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newPackageName}
          onChange={e => setNewPackageName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addDependency()}
          placeholder="Enter package name..."
          className="flex-1 rounded-lg border px-4 py-2"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
        />
        <button
          onClick={addDependency}
          className="flex items-center gap-2 rounded-lg bg-(--accent) px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {/* Dependencies List */}
      {dependencies.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Dependencies</h4>
          {dependencies.map(dep => (
            <div
              key={dep.id}
              className="flex flex-wrap items-center gap-2 rounded-lg border p-3"
              style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)' }}
            >
              <Package className="h-4 w-4" style={{ color: 'var(--accent)' }} />
              <span className="font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
                {dep.name}
              </span>

              <select
                value={dep.specifier}
                onChange={e => updateDependency(dep.id, { specifier: e.target.value as VersionSpecifier })}
                className="rounded border px-2 py-1 text-sm"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                {VERSION_SPECIFIERS.map(spec => (
                  <option key={spec.value} value={spec.value}>
                    {spec.label}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={dep.version}
                onChange={e => updateDependency(dep.id, { version: e.target.value })}
                placeholder="version"
                className="w-24 rounded border px-2 py-1 text-sm font-mono"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              />

              <input
                type="text"
                value={dep.extras.join(',')}
                onChange={e =>
                  updateDependency(dep.id, {
                    extras: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                  })
                }
                placeholder="extras (comma separated)"
                className="flex-1 rounded border px-2 py-1 text-sm"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              />

              <button
                onClick={() => removeDependency(dep.id)}
                className="rounded p-1 transition-colors hover:bg-(--error-light)"
              >
                <X className="h-4 w-4" style={{ color: 'var(--error)' }} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Generated Files */}
      {generatedFiles.length > 0 && dependencies.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Generated Files</h4>
          {generatedFiles.map(file => (
            <div
              key={file.name}
              className="rounded-lg border"
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center justify-between border-b px-4 py-2" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                  <span className="font-mono text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {file.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(file.content, file.name)}
                    className="flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors hover:bg-(--bg-tertiary)"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {copiedFile === file.name ? (
                      <>
                        <Check className="h-3 w-3" style={{ color: 'var(--success)' }} />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => downloadFile(file)}
                    className="flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors hover:bg-(--bg-tertiary)"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </button>
                </div>
              </div>
              <pre
                className="max-h-48 overflow-auto p-4 text-sm"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)',
                  fontFamily: 'monospace',
                }}
              >
                {file.content}
              </pre>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {dependencies.length === 0 && (
        <div
          className="rounded-lg border p-12 text-center"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
        >
          <Package className="mx-auto mb-4 h-12 w-12" style={{ color: 'var(--text-muted)' }} />
          <p className="mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>
            Build Your Requirements File
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Add packages above to generate requirements.txt, pyproject.toml, poetry.toml, and Pipfile
          </p>
        </div>
      )}
    </div>
  )
}
