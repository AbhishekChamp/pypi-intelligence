import { AlertCircle, PackageX } from 'lucide-react'
import { cn } from '@/utils'

interface ErrorDisplayProps {
  error: string
  className?: string
}

export function ErrorDisplay({ error, className }: ErrorDisplayProps) {
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
