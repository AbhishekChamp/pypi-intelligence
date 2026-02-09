import { cn } from '@/utils'
import type { CompatibilityMatrix } from '@/types'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package,
  Cpu,
  Monitor,
  Apple,
  Container,
} from 'lucide-react'

interface CompatibilityTabProps {
  compatibility: CompatibilityMatrix
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
            icon={<Container className="h-6 w-6" />}
            name="Linux"
            supported={compatibility.platforms.linux}
          />
          <PlatformCard
            icon={<Apple className="h-6 w-6" />}
            name="macOS"
            supported={compatibility.platforms.macos}
          />
          <PlatformCard
            icon={<Monitor className="h-6 w-6" />}
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
