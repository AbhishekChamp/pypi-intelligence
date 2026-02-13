import type { BundleStats, ReleaseFile } from '@/types'
import { 
  Package, 
  HardDrive, 
  Download, 
  Layers, 
  Cpu,
  CheckCircle,
  XCircle,
  FileCode,
  AlertCircle
} from 'lucide-react'
import { formatBytes } from '@/utils'

interface BundleAnalysisTabProps {
  stats: BundleStats | null
  releases: Record<string, ReleaseFile[]>
  currentVersion: string
  loading: boolean
}

export function BundleAnalysisTab({ stats, releases, currentVersion, loading }: BundleAnalysisTabProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg p-6 shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="rounded-lg p-6 text-center" style={{ backgroundColor: 'var(--card-bg)' }}>
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" style={{ color: 'var(--text-muted)' }} />
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          No Bundle Data Available
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Could not analyze package bundle information. This might be a new package or the data is temporarily unavailable.
        </p>
      </div>
    )
  }

  const currentRelease = releases[currentVersion] || []
  const wheelFiles = currentRelease.filter(f => f.packagetype === 'bdist_wheel')
  const sourceFile = currentRelease.find(f => f.packagetype === 'sdist')

  // Calculate bloat score
  const getBloatScore = () => {
    if (stats.totalSize < 100 * 1024) return { score: 'Low', color: 'text-green-600', bg: 'bg-green-50' }
    if (stats.totalSize < 1024 * 1024) return { score: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-50' }
    if (stats.totalSize < 10 * 1024 * 1024) return { score: 'High', color: 'text-orange-600', bg: 'bg-orange-50' }
    return { score: 'Very High', color: 'text-red-600', bg: 'bg-red-50' }
  }

  const bloatScore = getBloatScore()

  return (
    <div className="space-y-6">
      {/* Size overview */}
      <div className="rounded-lg p-6 shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Package Size Analysis
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <SizeCard
            icon={<Package className="h-5 w-5 text-blue-500" />}
            label="Total Size"
            value={formatBytes(stats.totalSize)}
            subtext="All distributions"
          />
          <SizeCard
            icon={<Download className="h-5 w-5 text-green-500" />}
            label="Wheel Size"
            value={stats.wheelSize > 0 ? formatBytes(stats.wheelSize) : 'N/A'}
            subtext="Binary distribution"
          />
          <SizeCard
            icon={<FileCode className="h-5 w-5 text-purple-500" />}
            label="Source Size"
            value={stats.sourceSize > 0 ? formatBytes(stats.sourceSize) : 'N/A'}
            subtext="Source distribution"
          />
          <SizeCard
            icon={<HardDrive className="h-5 w-5 text-orange-500" />}
            label="Install Size"
            value={formatBytes(stats.totalSize * 2.5)} // Estimated decompressed size
            subtext="Estimated on disk"
          />
        </div>

        {/* Bloat indicator */}
        <div className={`rounded-lg p-4 ${bloatScore.bg} flex items-start gap-3`}>
          <AlertCircle className={`h-5 w-5 ${bloatScore.color} flex-shrink-0 mt-0.5`} />
          <div>
            <p className={`font-medium ${bloatScore.color}`}>
              Size Impact: {bloatScore.score}
            </p>
            <p className="text-sm opacity-80 mt-1">
              This package will add approximately {formatBytes(stats.totalSize * 2.5)} to your environment
              {stats.totalSize > 1024 * 1024 && ' after decompression. Consider if this is necessary for your use case.'}
            </p>
          </div>
        </div>
      </div>

      {/* Distribution breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-lg p-6 shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Layers className="h-5 w-5" />
            Distribution Files
          </h3>
          
          <div className="space-y-3">
            {wheelFiles.length > 0 ? (
              wheelFiles.slice(0, 5).map((file, idx) => (
                <FileRow 
                  key={idx}
                  filename={file.filename}
                  size={file.size}
                  type="wheel"
                />
              ))
            ) : (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                No wheel files available
              </p>
            )}
            
            {sourceFile && (
              <FileRow
                filename={sourceFile.filename}
                size={sourceFile.size}
                type="source"
              />
            )}
            
            {wheelFiles.length === 0 && !sourceFile && (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                No distribution files found
              </p>
            )}
          </div>
        </div>

        <div className="rounded-lg p-6 shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Cpu className="h-5 w-5" />
            Platform Support
          </h3>
          
          <div className="space-y-3">
            <PlatformRow
              label="Pure Python Wheel"
              available={stats.hasPurePythonWheel}
              description="Universal, no compilation needed"
            />
            <PlatformRow
              label="Binary Wheels"
              available={stats.hasBinaryWheel}
              description="Platform-specific compiled extensions"
            />
            <PlatformRow
              label="Type Stubs"
              available={stats.hasTypeStubs}
              description="Type annotations included"
            />
          </div>

          {stats.platforms.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                Supported Platforms
              </p>
              <div className="flex flex-wrap gap-2">
                {stats.platforms.map(platform => (
                  <span 
                    key={platform}
                    className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Install impact */}
      <div className="rounded-lg p-6 shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Installation Impact
        </h3>
        
        <div className="space-y-4">
          <ImpactRow
            label="Download Time"
            value={stats.totalSize < 100 * 1024 ? '< 1 second' : stats.totalSize < 1024 * 1024 ? '1-3 seconds' : '5-10 seconds'}
            description="Typical broadband connection"
          />
          <ImpactRow
            label="Disk Space"
            value={formatBytes(stats.totalSize * 2.5)}
            description="After extraction and installation"
          />
          <ImpactRow
            label="Cold Import Time"
            value={stats.totalSize < 500 * 1024 ? 'Fast (< 100ms)' : stats.totalSize < 5 * 1024 * 1024 ? 'Moderate (100-500ms)' : 'Slow (> 500ms)'}
            description="First time importing the package"
          />
        </div>
      </div>
    </div>
  )
}

function SizeCard({ 
  icon, 
  label, 
  value,
  subtext 
}: { 
  icon: React.ReactNode
  label: string
  value: string
  subtext: string
}) {
  return (
    <div className="rounded-lg p-4 bg-gray-50">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs font-medium opacity-70">{label}</span>
      </div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs opacity-60">{subtext}</p>
    </div>
  )
}

function FileRow({ 
  filename, 
  size,
  type 
}: { 
  filename: string
  size: number
  type: 'wheel' | 'source'
}) {
  const displayName = filename.length > 40 
    ? filename.substring(0, 20) + '...' + filename.substring(filename.length - 17)
    : filename

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2 min-w-0">
        {type === 'wheel' ? (
          <Package className="h-4 w-4 text-blue-500 flex-shrink-0" />
        ) : (
          <FileCode className="h-4 w-4 text-purple-500 flex-shrink-0" />
        )}
        <span className="text-sm truncate" style={{ color: 'var(--text-secondary)' }} title={filename}>
          {displayName}
        </span>
      </div>
      <span className="text-sm font-medium flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
        {formatBytes(size)}
      </span>
    </div>
  )
}

function PlatformRow({ 
  label, 
  available,
  description 
}: { 
  label: string
  available: boolean
  description: string
}) {
  return (
    <div className="flex items-start gap-3 py-2">
      {available ? (
        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
      ) : (
        <XCircle className="h-5 w-5 text-gray-300 flex-shrink-0 mt-0.5" />
      )}
      <div>
        <p className={`font-medium ${available ? '' : 'opacity-50'}`} style={{ color: 'var(--text-primary)' }}>
          {label}
        </p>
        <p className="text-xs opacity-60" style={{ color: 'var(--text-muted)' }}>
          {description}
        </p>
      </div>
    </div>
  )
}

function ImpactRow({ 
  label, 
  value,
  description 
}: { 
  label: string
  value: string
  description: string
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div>
        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{description}</p>
      </div>
      <span className="text-sm font-medium px-3 py-1 rounded-full bg-gray-100">
        {value}
      </span>
    </div>
  )
}