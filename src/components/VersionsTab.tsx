import { formatDate, formatBytes } from '@/utils'
import type { ReleaseInfo } from '@/types'
import { AlertTriangle, Package } from 'lucide-react'
import { cn } from '@/utils'

interface VersionsTabProps {
  releases: ReleaseInfo[]
}

export function VersionsTab({ releases }: VersionsTabProps) {
  if (releases.length === 0) {
    return (
      <div className="rounded-lg bg-gray-50 p-8 text-center">
        <p className="text-gray-500">No version information available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">Release History</h3>
          <p className="text-sm text-gray-500">{releases.length} versions published</p>
        </div>
        <div className="max-h-[600px] overflow-y-auto">
          <ul className="divide-y divide-gray-200">
            {releases.slice(0, 50).map((release, index) => (
              <li
                key={release.version}
                className={cn(
                  'px-6 py-4 hover:bg-gray-50',
                  index === 0 && 'bg-blue-50/50'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{release.version}</span>
                        {index === 0 && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                            Latest
                          </span>
                        )}
                        {release.isYanked && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                            Yanked
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {release.date ? formatDate(release.date) : 'Unknown date'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{release.files.length} files</p>
                    <p className="text-xs text-gray-400">
                      {formatBytes(
                        release.files.reduce((sum, f) => sum + f.size, 0)
                      )}
                    </p>
                  </div>
                </div>
                {release.isYanked && release.yankedReason && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{release.yankedReason}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
