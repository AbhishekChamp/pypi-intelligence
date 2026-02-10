import { useState } from 'react'
import { cn } from '@/utils'
import { Copy, Check, Terminal, Package, ChevronDown, ChevronUp } from 'lucide-react'
import type { PyPIPackage } from '@/types'

interface InstallationTabProps {
  data: PyPIPackage | null
}

type PackageManager = 'pip' | 'poetry' | 'uv' | 'pdm' | 'conda' | 'pipenv'

interface InstallCommand {
  manager: PackageManager
  label: string
  command: string
  description: string
}

export function InstallationTab({ data }: InstallationTabProps) {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null)
  const [showAllDependencies, setShowAllDependencies] = useState(false)

  if (!data) {
    return (
      <div className="rounded-lg p-8 text-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <Package className="mx-auto mb-4 h-12 w-12" style={{ color: 'var(--text-muted)' }} />
        <p style={{ color: 'var(--text-secondary)' }}>No installation information available</p>
      </div>
    )
  }

  const { info } = data
  const packageName = info.name
  const version = info.version
  const extras = info.provides_dist || []
  const requiresPython = info.requires_python

  // Generate installation commands
  const installCommands: InstallCommand[] = [
    {
      manager: 'pip',
      label: 'pip',
      command: `pip install ${packageName}`,
      description: 'Standard Python package installer',
    },
    {
      manager: 'poetry',
      label: 'Poetry',
      command: `poetry add ${packageName}`,
      description: 'Python dependency management and packaging',
    },
    {
      manager: 'uv',
      label: 'uv',
      command: `uv add ${packageName}`,
      description: 'Ultra-fast Python package installer',
    },
    {
      manager: 'pdm',
      label: 'PDM',
      command: `pdm add ${packageName}`,
      description: 'Modern Python package manager',
    },
    {
      manager: 'pipenv',
      label: 'Pipenv',
      command: `pipenv install ${packageName}`,
      description: 'Python virtualenv and package management',
    },
    {
      manager: 'conda',
      label: 'Conda',
      command: `conda install -c conda-forge ${packageName}`,
      description: 'Cross-platform package and environment manager',
    },
  ]

  // Generate requirements.txt format
  const requirementsFormat = extras.length > 0
    ? `${packageName}[${extras[0]}]  # with optional extras`
    : packageName

  // Generate pyproject.toml format
  const pyprojectFormat = extras.length > 0
    ? `${packageName} = {version = "*", extras = [${extras.map(e => `"${e}"`).join(', ')}]}`
    : `${packageName} = "*"`

  const handleCopy = async (text: string, commandId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCommand(commandId)
      setTimeout(() => setCopiedCommand(null), 2000)
    } catch {
      console.warn('Failed to copy to clipboard')
    }
  }

  return (
    <div className="space-y-8">
      {/* Package Info Header */}
      <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', borderWidth: '1px' }}>
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          <Terminal className="h-5 w-5" style={{ color: 'var(--accent)' }} />
          Package Information
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-md p-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Package Name</p>
            <p className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>{packageName}</p>
          </div>
          <div className="rounded-md p-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Latest Version</p>
            <p className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>{version}</p>
          </div>
          {requiresPython && (
            <div className="rounded-md p-4 sm:col-span-2" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Python Version Required</p>
              <p className="text-sm font-mono" style={{ color: 'var(--text-primary)' }}>{requiresPython}</p>
            </div>
          )}
          {extras.length > 0 && (
            <div className="rounded-md p-4 sm:col-span-2" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Optional Extras</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {extras.map((extra) => (
                  <span
                    key={extra}
                    className="rounded-full px-2 py-1 text-xs font-medium"
                    style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}
                  >
                    {extra}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Installation Commands */}
      <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', borderWidth: '1px' }}>
        <h3 className="mb-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Install with Package Managers</h3>
        <div className="space-y-4">
          {installCommands.map((cmd) => (
            <div
              key={cmd.manager}
              className="rounded-lg p-4 transition-colors"
              style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)', borderWidth: '1px' }}
            >
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{cmd.label}</span>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{cmd.description}</p>
                </div>
                <button
                  onClick={() => handleCopy(cmd.command, cmd.manager)}
                  className={cn(
                    'flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors'
                  )}
                  style={{
                    backgroundColor: copiedCommand === cmd.manager ? 'var(--success-light)' : 'var(--card-bg)',
                    color: copiedCommand === cmd.manager ? 'var(--success)' : 'var(--text-secondary)'
                  }}
                  title="Copy to clipboard"
                >
                  {copiedCommand === cmd.manager ? (
                    <>
                      <Check className="h-3 w-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="rounded-md bg-gray-900 p-3">
                <code className="font-mono text-sm text-green-400">{cmd.command}</code>
              </div>
              {/* Show extra installation variants */}
              {extras.length > 0 && cmd.manager !== 'conda' && (
                <div className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <p className="mb-1">With extras:</p>
                  <div className="space-y-1">
                    {extras.slice(0, 2).map((extra) => {
                      let extraCmd: string
                      switch (cmd.manager) {
                        case 'pip':
                          extraCmd = `pip install ${packageName}[${extra}]`
                          break
                        case 'poetry':
                          extraCmd = `poetry add ${packageName} --extras ${extra}`
                          break
                        case 'uv':
                          extraCmd = `uv add ${packageName} --extra ${extra}`
                          break
                        case 'pdm':
                          extraCmd = `pdm add ${packageName} -x ${extra}`
                          break
                        case 'pipenv':
                          extraCmd = `pipenv install ${packageName}[${extra}]`
                          break
                        default:
                          extraCmd = `${cmd.command}[${extra}]`
                      }
                      return (
                        <div key={extra} className="flex items-center justify-between">
                          <code className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{extraCmd}</code>
                          <button
                            onClick={() => handleCopy(extraCmd, `${cmd.manager}-${extra}`)}
                            className="text-xs hover:opacity-80"
                            style={{ color: 'var(--accent)' }}
                          >
                            {copiedCommand === `${cmd.manager}-${extra}` ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Configuration Files */}
      <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', borderWidth: '1px' }}>
        <h3 className="mb-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Add to Configuration Files</h3>
        
        {/* requirements.txt */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>requirements.txt</span>
            <button
              onClick={() => handleCopy(requirementsFormat, 'requirements')}
              className={cn(
                'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors'
              )}
              style={{
                backgroundColor: copiedCommand === 'requirements' ? 'var(--success-light)' : 'var(--bg-tertiary)',
                color: copiedCommand === 'requirements' ? 'var(--success)' : 'var(--text-secondary)'
              }}
            >
              {copiedCommand === 'requirements' ? (
                <>
                  <Check className="h-3 w-3" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="rounded-md bg-gray-900 p-3">
            <code className="font-mono text-sm text-green-400">{requirementsFormat}</code>
          </div>
        </div>

        {/* pyproject.toml */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>pyproject.toml (Poetry/PDM)</span>
            <button
              onClick={() => handleCopy(pyprojectFormat, 'pyproject')}
              className={cn(
                'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors'
              )}
              style={{
                backgroundColor: copiedCommand === 'pyproject' ? 'var(--success-light)' : 'var(--bg-tertiary)',
                color: copiedCommand === 'pyproject' ? 'var(--success)' : 'var(--text-secondary)'
              }}
            >
              {copiedCommand === 'pyproject' ? (
                <>
                  <Check className="h-3 w-3" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="rounded-md bg-gray-900 p-3">
            <code className="font-mono text-sm text-green-400">{pyprojectFormat}</code>
          </div>
          {extras.length > 0 && (
            <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              Add to <code className="rounded px-1" style={{ backgroundColor: 'var(--bg-tertiary)' }}>[tool.poetry.dependencies]</code> or{' '}
              <code className="rounded px-1" style={{ backgroundColor: 'var(--bg-tertiary)' }}>[project.dependencies]</code> section
            </p>
          )}
        </div>
      </div>

      {/* Additional Info */}
      {info.requires_dist && info.requires_dist.length > 0 && (
        <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)', borderWidth: '1px' }}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Dependencies</h3>
            <button
              onClick={() => handleCopy(info.requires_dist!.join('\n'), 'all-dependencies')}
              className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
              style={{
                backgroundColor: copiedCommand === 'all-dependencies' ? 'var(--success-light)' : 'var(--bg-tertiary)',
                color: copiedCommand === 'all-dependencies' ? 'var(--success)' : 'var(--text-secondary)'
              }}
              title="Copy all dependencies"
            >
              {copiedCommand === 'all-dependencies' ? (
                <>
                  <Check className="h-3 w-3" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy All
                </>
              )}
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto rounded-md p-4" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
            <ul className="space-y-1">
              {(showAllDependencies ? info.requires_dist : info.requires_dist.slice(0, 10)).map((dep, index) => (
                <li key={index} className="font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {dep}
                </li>
              ))}
            </ul>
            {info.requires_dist.length > 10 && (
              <button
                onClick={() => setShowAllDependencies(!showAllDependencies)}
                className="mt-3 flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: 'var(--accent)' }}
              >
                {showAllDependencies ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    ... and {info.requires_dist.length - 10} more
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
