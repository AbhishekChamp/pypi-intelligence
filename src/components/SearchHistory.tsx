import { History, X, Clock, Trash2 } from 'lucide-react'
import type { SearchHistoryItem } from '@/hooks/useSearchHistory'

interface SearchHistoryProps {
  history: SearchHistoryItem[]
  onSelect: (packageName: string) => void
  onRemove: (packageName: string) => void
  onClear: () => void
  isVisible: boolean
}

export function SearchHistory({
  history,
  onSelect,
  onRemove,
  onClear,
  isVisible,
}: SearchHistoryProps) {
  if (!isVisible || history.length === 0) {
    return null
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return date.toLocaleDateString()
  }

  return (
    <div 
      className="rounded-lg border p-6" 
      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Recent Searches
          </h3>
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 text-sm transition-colors hover:text-red-600"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Clear all history"
        >
          <Trash2 className="h-4 w-4" />
          Clear
        </button>
      </div>

      <div className="space-y-2">
        {history.map((item) => (
          <div
            key={item.packageName}
            className="group flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors"
            style={{ backgroundColor: 'var(--bg-tertiary)' }}
            onClick={() => onSelect(item.packageName)}
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium" style={{ color: 'var(--text-primary)' }}>
                  {item.packageName}
                </p>
                {item.description && (
                  <p className="truncate text-xs" style={{ color: 'var(--text-muted)' }}>
                    {item.description}
                  </p>
                )}
              </div>
            </div>

            <div className="ml-2 flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Clock className="h-3 w-3" />
                {formatTime(item.timestamp)}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove(item.packageName)
                }}
                className="rounded-lg p-1.5 opacity-0 transition-all hover:bg-red-100 hover:text-red-600 group-hover:opacity-100"
                style={{ color: 'var(--text-muted)' }}
                aria-label={`Remove ${item.packageName} from history`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Press <kbd 
            className="rounded px-2 py-0.5" 
            style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
          >↓</kbd> to navigate
        </p>
      </div>
    </div>
  )
}
