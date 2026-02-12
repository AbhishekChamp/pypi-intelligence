import { cn } from '@/utils'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export function Skeleton({ 
  className, 
  variant = 'text',
  width,
  height 
}: SkeletonProps) {
  const baseStyles = 'animate-pulse rounded-md bg-(--bg-tertiary)'
  
  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      style={style}
    />
  )
}

// Package overview skeleton
export function PackageOverviewSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <Skeleton width={300} height={32} />
          <Skeleton width={200} height={20} />
        </div>
        <Skeleton width={100} height={36} variant="rectangular" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2 rounded-lg border p-4" style={{ borderColor: 'var(--border)' }}>
            <Skeleton width={60} height={16} />
            <Skeleton width={80} height={28} />
          </div>
        ))}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Skeleton width="100%" height={16} />
        <Skeleton width="90%" height={16} />
        <Skeleton width="70%" height={16} />
      </div>

      {/* Links */}
      <div className="flex gap-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} width={100} height={32} variant="rectangular" />
        ))}
      </div>
    </div>
  )
}

// Package card skeleton
export function PackageCardSkeleton() {
  return (
    <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--card-bg)' }}>
      <div className="mb-4">
        <Skeleton className="mb-2 h-6 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    </div>
  )
}

// Stats grid skeleton
export function StatsGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="rounded-lg p-4" style={{ backgroundColor: 'var(--card-bg)' }}>
          <Skeleton className="mb-2 h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  )
}

// Tab content skeleton
export function TabContentSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton width={40} height={40} variant="circular" />
            <div className="flex-1 space-y-2">
              <Skeleton width="40%" height={16} />
              <Skeleton width="60%" height={12} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Chart skeleton
export function ChartSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton width={200} height={24} />
      <Skeleton width="100%" height={300} variant="rectangular" />
    </div>
  )
}

// Dependency graph skeleton
export function DependencyGraphSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton width={150} height={20} />
        <Skeleton width={100} height={32} variant="rectangular" />
      </div>
      <Skeleton width="100%" height={400} variant="rectangular" />
      <div className="flex justify-center gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} width={80} height={16} />
        ))}
      </div>
    </div>
  )
}

// Table skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} width={`${80 + Math.random() * 40}px`} height={16} />
        ))}
      </div>
      
      {/* Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-3">
          {[...Array(5)].map((_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              width={`${60 + Math.random() * 80}px`} 
              height={14} 
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// Card skeleton
export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="rounded-lg border p-4 space-y-3" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <Skeleton width={40} height={40} variant="circular" />
            <div className="flex-1 space-y-1">
              <Skeleton width="60%" height={18} />
              <Skeleton width="40%" height={14} />
            </div>
          </div>
          <Skeleton width="100%" height={60} />
        </div>
      ))}
    </div>
  )
}