import { useState } from 'react'
import { cn } from '@/utils'
import { Copy, Check, Terminal, Package } from 'lucide-react'
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

  if (!data) {
    return (
      <div className="rounded-lg bg-gray-50 p-8 text-center">
        <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <p className="text-gray-600">No installation information available</p>
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
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Terminal className="h-5 w-5 text-blue-600" />
          Package Information
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-md bg-gray-50 p-4">
            <p className="text-xs font-medium text-gray-500">Package Name</p>
            <p className="text-sm font-mono text-gray-900">{packageName}</p>
          </div>
          <div className="rounded-md bg-gray-50 p-4">
            <p className="text-xs font-medium text-gray-500">Latest Version</p>
            <p className="text-sm font-mono text-gray-900">{version}</p>
          </div>
          {requiresPython && (
            <div className="rounded-md bg-gray-50 p-4 sm:col-span-2">
              <p className="text-xs font-medium text-gray-500">Python Version Required</p>
              <p className="text-sm font-mono text-gray-900">{requiresPython}</p>
            </div>
          )}
          {extras.length > 0 && (
            <div className="rounded-md bg-gray-50 p-4 sm:col-span-2">
              <p className="text-xs font-medium text-gray-500">Optional Extras</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {extras.map((extra) => (
                  <span
                    key={extra}
                    className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
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
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Install with Package Managers</h3>
        <div className="space-y-4">
          {installCommands.map((cmd) => (
            <div
              key={cmd.manager}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:border-gray-300"
            >
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-gray-900">{cmd.label}</span>
                  <p className="text-xs text-gray-500">{cmd.description}</p>
                </div>
                <button
                  onClick={() => handleCopy(cmd.command, cmd.manager)}
                  className={cn(
                    'flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                    copiedCommand === cmd.manager
                      ? 'bg-green-100 text-green-700'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  )}
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
                <div className="mt-2 text-xs text-gray-500">
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
                          <code className="font-mono text-xs text-gray-600">{extraCmd}</code>
                          <button
                            onClick={() => handleCopy(extraCmd, `${cmd.manager}-${extra}`)}
                            className="text-xs text-blue-600 hover:text-blue-800"
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
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Add to Configuration Files</h3>
        
        {/* requirements.txt */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">requirements.txt</span>
            <button
              onClick={() => handleCopy(requirementsFormat, 'requirements')}
              className={cn(
                'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
                copiedCommand === 'requirements'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
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
            <span className="text-sm font-medium text-gray-700">pyproject.toml (Poetry/PDM)</span>
            <button
              onClick={() => handleCopy(pyprojectFormat, 'pyproject')}
              className={cn(
                'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
                copiedCommand === 'pyproject'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
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
            <p className="mt-1 text-xs text-gray-500">
              Add to <code className="rounded bg-gray-100 px-1">[tool.poetry.dependencies]</code> or{' '}
              <code className="rounded bg-gray-100 px-1">[project.dependencies]</code> section
            </p>
          )}
        </div>
      </div>

      {/* Additional Info */}
      {info.requires_dist && info.requires_dist.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Dependencies</h3>
          <div className="max-h-48 overflow-y-auto rounded-md bg-gray-50 p-4">
            <ul className="space-y-1">
              {info.requires_dist.slice(0, 10).map((dep, index) => (
                <li key={index} className="font-mono text-sm text-gray-700">
                  {dep}
                </li>
              ))}
              {info.requires_dist.length > 10 && (
                <li className="text-sm text-gray-500">
                  ... and {info.requires_dist.length - 10} more
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
