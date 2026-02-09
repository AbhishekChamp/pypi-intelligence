import { getCachedSuggestions } from '@/hooks/usePackageSuggestions'
import { cn } from '@/utils'
import { ArrowRight, Package } from 'lucide-react'

interface PackageSuggestionsProps {
  packageName: string
  onSelectSuggestion: (suggestionName: string) => void
}

export function PackageSuggestions({ packageName, onSelectSuggestion }: PackageSuggestionsProps) {
  const suggestions = getCachedSuggestions(packageName)

  // Don't render anything if no suggestions
  if (!suggestions || suggestions.suggestions.length === 0) {
    return null
  }

  return (
    <div 
      className="rounded-lg p-4" 
      style={{ backgroundColor: 'var(--accent-light)', borderColor: 'var(--accent)', borderWidth: '1px' }}
    >
      <h3 
        className="mb-3 text-sm font-medium" 
        style={{ color: 'var(--text-primary)' }}
      >
        Similar to {suggestions.packageName}
      </h3>
      <div className="space-y-2">
        {suggestions.suggestions.map((suggestion) => (
          <button
            key={suggestion.name}
            onClick={() => onSelectSuggestion(suggestion.name)}
            className={cn(
              'flex w-full items-center justify-between rounded-md px-3 py-2',
              'text-left transition-colors',
              'border'
            )}
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border)'
            }}
          >
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              <div>
                <span 
                  className="font-medium" 
                  style={{ color: 'var(--text-primary)' }}
                >
                  {suggestion.name}
                </span>
                {suggestion.sharedClassifiers.length > 0 && (
                  <span 
                    className="ml-2 text-xs" 
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {formatSharedClassifiers(suggestion.sharedClassifiers)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-600">Compare</span>
              <ArrowRight className="h-4 w-4 text-blue-600" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function formatSharedClassifiers(classifiers: string[]): string {
  // Extract meaningful parts from classifiers
  const formatted = classifiers.slice(0, 2).map((c) => {
    const parts = c.split(' :: ')
    if (parts.length >= 2) {
      // Get the last meaningful part
      return parts[parts.length - 1]
    }
    return c
  })

  if (formatted.length === 0) return ''
  if (formatted.length === 1) return formatted[0]
  return formatted.join(', ')
}
