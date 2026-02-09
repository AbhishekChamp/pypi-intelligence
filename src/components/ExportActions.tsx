import { Download, Share2, Check, FileJson, Link2 } from 'lucide-react'
import type { PyPIPackage } from '@/types'
import { useExportPackage } from '@/hooks/useExportPackage'

interface ExportActionsProps {
  packageData: PyPIPackage
}

export function ExportActions({ packageData }: ExportActionsProps) {
  const { exportToJSON, copyShareableLink, copied } = useExportPackage()

  const handleExportJSON = () => {
    exportToJSON(packageData)
  }

  const handleShare = async () => {
    await copyShareableLink(packageData.info.name)
  }

  return (
    <div 
      className="rounded-lg border p-6" 
      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
    >
      <div className="mb-4 flex items-center gap-2">
        <Share2 className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Export & Share
        </h3>
      </div>

      <div className="space-y-3">
        {/* Export JSON */}
        <button
          onClick={handleExportJSON}
          className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors"
          style={{ backgroundColor: 'var(--bg-tertiary)' }}
        >
          <div className="rounded-lg bg-blue-100 p-2">
            <FileJson className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Export as JSON
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Download package data
            </p>
          </div>
          <Download className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
        </button>

        {/* Copy Link */}
        <button
          onClick={handleShare}
          className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors"
          style={{ backgroundColor: 'var(--bg-tertiary)' }}
        >
          <div className="rounded-lg bg-green-100 p-2">
            <Link2 className="h-4 w-4 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {copied ? 'Link Copied!' : 'Copy Shareable Link'}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {copied ? 'Ready to paste' : 'Share this package'}
            </p>
          </div>
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Share2 className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
          )}
        </button>
      </div>

      <div 
        className="mt-4 border-t pt-4" 
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="font-medium">Package URL:</span>
          <code 
            className="flex-1 truncate rounded px-2 py-1" 
            style={{ backgroundColor: 'var(--bg-tertiary)' }}
          >
            https://pypi.org/project/{packageData.info.name}
          </code>
        </div>
      </div>
    </div>
  )
}
