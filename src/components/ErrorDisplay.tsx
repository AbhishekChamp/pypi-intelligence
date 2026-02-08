import { AlertCircle, PackageX, Lightbulb } from 'lucide-react'
import { cn, getPackageSuggestions } from '@/utils'
import { useMemo } from 'react'

interface ErrorDisplayProps {
  error: string
  packageName?: string
  onSuggestionClick?: (suggestion: string) => void
  className?: string
}

export function ErrorDisplay({ 
  error, 
  packageName, 
  onSuggestionClick,
  className 
}: ErrorDisplayProps) {
  // Get suggestions if a package name was provided
  const suggestions = useMemo(() => {
    if (!packageName) return []
    return getPackageSuggestions(packageName, 5)
  }, [packageName])

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8 text-center',
        className
      )}
    >
      <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
      <h3 className="mb-2 text-lg font-semibold text-red-900">Error</h3>
      <p className="text-red-700">{error}</p>
      
      {/* Show suggestions if we have any */}
      {suggestions.length > 0 && (
        <div className="mt-6 w-full max-w-md">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-medium text-gray-700">
              Did you mean one of these?
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => onSuggestionClick?.(suggestion)}
                className={cn(
                  'rounded-md bg-white px-3 py-1.5 text-sm',
                  'border border-gray-200 text-gray-700',
                  'hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700',
                  'transition-colors duration-200'
                )}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface EmptyStateProps {
  title?: string
  description?: string
  className?: string
}

export function EmptyState({
  title = 'No Package Selected',
  description = 'Search for a Python package to analyze its health, compatibility, and production readiness.',
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center',
        className
      )}
    >
      <PackageX className="mb-4 h-12 w-12 text-gray-400" />
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="max-w-sm text-gray-500">{description}</p>
    </div>
  )
}
