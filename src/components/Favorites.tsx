import { Star, X, Clock, Trash2, Heart } from 'lucide-react'
import type { FavoriteItem } from '@/hooks/useFavorites'

interface FavoritesProps {
  favorites: FavoriteItem[]
  onSelect: (packageName: string) => void
  onRemove: (packageName: string) => void
  onClear: () => void
  isVisible: boolean
}

export function Favorites({
  favorites,
  onSelect,
  onRemove,
  onClear,
  isVisible,
}: FavoritesProps) {
  if (!isVisible || favorites.length === 0) {
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
          <Heart className="h-5 w-5 fill-red-500 text-red-500" />
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Favorites
          </h3>
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 text-sm transition-colors hover:text-red-600"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Clear all favorites"
        >
          <Trash2 className="h-4 w-4" />
          Clear
        </button>
      </div>

      <div className="space-y-2">
        {favorites.map((item) => (
          <div
            key={item.packageName}
            className="group flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors"
            style={{ backgroundColor: 'var(--bg-tertiary)' }}
            onClick={() => onSelect(item.packageName)}
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="rounded-lg bg-yellow-100 p-2">
                <Star className="h-4 w-4 text-yellow-600" />
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
                aria-label={`Remove ${item.packageName} from favorites`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {favorites.length} package{favorites.length !== 1 ? 's' : ''} saved
        </p>
      </div>
    </div>
  )
}
