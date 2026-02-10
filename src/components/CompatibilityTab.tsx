import { cn } from '@/utils'
import type { CompatibilityMatrix } from '@/types'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package,
  Cpu,
  Monitor,
} from 'lucide-react'

interface CompatibilityTabProps {
  compatibility: CompatibilityMatrix
}

// Platform Icons
function LinuxIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.5 1.5c-.2 0-.4 0-.6.1-2.9.3-2.1 3.8-2.2 5-.1.9-.2 1.7-.9 2.6-.7.9-1.8 2.3-2.3 3.8-.2.7-.3 1.4-.2 2.1-.1.1-.2.2-.2.3-.3.3-.4.6-.6.8-.2.2-.4.3-.7.4-.3.1-.5.3-.7.6-.1.2-.1.3-.1.5 0 .2 0 .3.1.4.1.4.1.6 0 .8-.3.6-.3 1-.2 1.3.2.3.5.4.8.5.7.2 1.6.1 2.3.5.8.4 1.6.6 2.2.4.5-.1.8-.4 1-.8.5 0 1-.3 1.8-.3.6 0 1.3.3 2.1.2 0 .1.1.2.2.4l.1.1c.4.7 1 1 1.7.9.7-.1 1.4-.5 2-1.1.5-.6 1.4-.9 2-1.2.3-.2.5-.4.5-.7 0-.3-.2-.7-.6-1.1v-.1l-.1-.1c-.2-.2-.3-.5-.4-.8-.1-.4-.2-.7-.4-.9l-.1-.1-.2-.2-.1-.1c.4-1.2.3-2.4-.2-3.5-.5-1.2-1.3-2.2-2-3-.7-.9-1.4-1.7-1.4-2.9 0-2 .2-5.6-3.1-5.6zm.5 3.1h.1c.2 0 .4.1.5.2.2.1.3.3.4.5.1.2.2.4.2.7 0 0 0-.1 0-.2v.1l-.1-.1v-.1c0 .2-.1.4-.2.6-.1.1-.2.2-.3.3l-.1-.1c-.1 0-.2-.1-.3-.2l-.2-.1c.1-.1.2-.2.2-.3 0-.2.1-.3.1-.5v-.1c0-.1 0-.3-.1-.5 0-.2-.1-.2-.2-.4-.1-.1-.2-.2-.3-.2h-.1c-.1 0-.2 0-.3.2-.1.1-.2.2-.2.4 0 .1-.1.3-.1.4v.1c0 .1 0 .2.1.5 0 .1.1.2.2.3-.1 0-.2.1-.3.1-.1.1-.2.1-.3.2-.1 0-.1 0-.2.1-.1-.1-.2-.2-.2-.4-.1-.2-.2-.4-.2-.6v-.1-.1-.1v-.1c0 .1 0 .2 0 .3 0-.2.1-.4.2-.6.1-.2.2-.4.4-.5.2-.1.3-.2.5-.2zm-1.8 7.5h.1c.3 0 .6.1.7.4.3.4.2 1-.1 1.3-.2.2-.4.3-.6.3-.3 0-.5-.1-.7-.3-.3-.4-.3-.9-.1-1.3.2-.3.5-.4.7-.4zm4.4 0h.1c.3 0 .6.1.7.4.3.4.2 1-.1 1.3-.2.2-.4.3-.6.3-.3 0-.5-.1-.7-.3-.3-.4-.3-.9-.1-1.3.2-.3.5-.4.7-.4z"/>
    </svg>
  )
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.7 19.5c-.8 1.2-1.7 2.4-3 2.5-1.4 0-1.8-.8-3.3-.8-1.5 0-2 .8-3.3.8-1.3.1-2.3-1.3-3.1-2.5-1.7-2.4-3-6.9-1.2-10 .9-1.5 2.4-2.5 4.1-2.5 1.3 0 2.5.9 3.3.9.8 0 2.3-1.1 3.8-.9.7 0 2.5.3 3.6 2-.1.1-2.2 1.3-2.2 3.8 0 3 2.7 4 2.7 4.1 0 .1-.4 1.4-1.4 2.8M13 3.5c.7-.8 1.9-1.5 2.9-1.5.1 1.2-.3 2.4-1 3.2-.7.9-1.8 1.5-2.9 1.4-.2-1.2.4-2.4 1-3.1z"/>
    </svg>
  )
}

function WindowsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M2 4.5l8-.5v7.5H2V4.5zM2 11.5h8v7.5l-8-.5v-7zm9-7.5l11-1.5v9H11V4zM11 11.5h11V21l-11-1.5v-8z"/>
    </svg>
  )
}

export function CompatibilityTab({ compatibility }: CompatibilityTabProps) {
  return (
    <div className="space-y-6">
      {/* Status Badges */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatusBadge
          title="Distribution"
          status={compatibility.purePython ? 'pure' : compatibility.wheelsAvailable ? 'wheels' : 'source'}
        />
        <StatusBadge
          title="Platform Support"
          status={
            compatibility.platforms.linux &&
            compatibility.platforms.macos &&
            compatibility.platforms.windows
              ? 'universal'
              : 'partial'
          }
        />
        <StatusBadge
          title="Installation Risk"
          status={compatibility.sourceOnly ? 'high' : compatibility.wheelsAvailable ? 'low' : 'medium'}
        />
      </div>

      {/* Python Versions */}
      <div className="rounded-lg p-6 shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
        <div className="mb-4 flex items-center gap-2">
          <Cpu className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Python Versions</h3>
        </div>
        {compatibility.pythonVersions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {compatibility.pythonVersions.map(version => (
              <span
                key={version}
                className="rounded-md px-3 py-1 text-sm font-medium"
                style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}
              >
                Python {version}
              </span>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No Python version classifiers found</p>
        )}
      </div>

      {/* Platform Matrix */}
      <div className="rounded-lg p-6 shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
        <div className="mb-4 flex items-center gap-2">
          <Monitor className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Platform Support</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <PlatformCard
            icon={<LinuxIcon className="h-6 w-6" />}
            name="Linux"
            supported={compatibility.platforms.linux}
          />
          <PlatformCard
            icon={<AppleIcon className="h-6 w-6" />}
            name="macOS"
            supported={compatibility.platforms.macos}
          />
          <PlatformCard
            icon={<WindowsIcon className="h-6 w-6" />}
            name="Windows"
            supported={compatibility.platforms.windows}
          />
        </div>
      </div>

      {/* Warnings */}
      {compatibility.sourceOnly && (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-600" />
            <div>
              <h4 className="font-medium text-yellow-900">Source-Only Distribution</h4>
              <p className="mt-1 text-sm text-yellow-800">
                This package is distributed as source only (sdist). Installation will require
                build tools and dependencies to be present on your system. This can lead to
                longer install times and potential build failures.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({
  title,
  status,
}: {
  title: string
  status: 'pure' | 'wheels' | 'source' | 'universal' | 'partial' | 'low' | 'medium' | 'high'
}) {
  const configs = {
    pure: {
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'bg-green-100 text-green-800 border-green-200',
      label: 'Pure Python',
    },
    wheels: {
      icon: <Package className="h-5 w-5" />,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      label: 'Wheels Available',
    },
    source: {
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      label: 'Source Only',
    },
    universal: {
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'bg-green-100 text-green-800 border-green-200',
      label: 'Universal',
    },
    partial: {
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      label: 'Partial',
    },
    low: {
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'bg-green-100 text-green-800 border-green-200',
      label: 'Low Risk',
    },
    medium: {
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      label: 'Medium Risk',
    },
    high: {
      icon: <XCircle className="h-5 w-5" />,
      color: 'bg-red-100 text-red-800 border-red-200',
      label: 'High Risk',
    },
  }

  const config = configs[status]

  return (
    <div className={cn('rounded-lg border p-4', config.color)}>
      <p className="text-xs font-medium uppercase opacity-80">{title}</p>
      <div className="mt-2 flex items-center gap-2">
        {config.icon}
        <span className="font-semibold">{config.label}</span>
      </div>
    </div>
  )
}

function PlatformCard({
  icon,
  name,
  supported,
}: {
  icon: React.ReactNode
  name: string
  supported: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border p-4',
        supported
          ? 'border-green-200 bg-green-50'
          : 'border-gray-200 bg-gray-50'
      )}
    >
      <div className={cn(supported ? 'text-green-600' : 'text-gray-400')}>{icon}</div>
      <div>
        <p className={cn('font-medium', supported ? 'text-green-900' : 'text-gray-500')}>
          {name}
        </p>
        <p className={cn('text-sm', supported ? 'text-green-700' : 'text-gray-400')}>
          {supported ? 'Supported' : 'Not Available'}
        </p>
      </div>
    </div>
  )
}
