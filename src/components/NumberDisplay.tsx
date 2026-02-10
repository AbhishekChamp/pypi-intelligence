import { useState } from 'react'
import { formatNumberWithFull, type FormattedNumber } from '@/utils'

interface NumberDisplayProps {
  value: number
  className?: string
  tooltipClassName?: string
}

export function NumberDisplay({ value, className = '', tooltipClassName = '' }: NumberDisplayProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const formatted: FormattedNumber = formatNumberWithFull(value)
  
  // Don't show tooltip if short and full are the same
  const hasTooltip = formatted.short !== formatted.full

  return (
    <span
      className={`relative inline-block cursor-help ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      tabIndex={hasTooltip ? 0 : -1}
    >
      {formatted.short}
      {showTooltip && hasTooltip && (
        <span
          className={`absolute bottom-full left-1/2 z-50 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-1 text-sm shadow-lg ${tooltipClassName}`}
          style={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          {formatted.full}
          <span
            className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent"
            style={{ borderTopColor: 'var(--bg-primary)' }}
          />
        </span>
      )}
    </span>
  )
}

interface StatCardWithNumberProps {
  icon: React.ReactNode
  label: string
  value: number
}

export function StatCardWithNumber({ icon, label, value }: StatCardWithNumberProps) {
  const formatted = formatNumberWithFull(value)
  const [showTooltip, setShowTooltip] = useState(false)
  const hasTooltip = formatted.short !== formatted.full

  return (
    <div className="rounded-lg p-4 shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</span>
      </div>
      <span
        className="relative inline-block cursor-help text-2xl font-bold"
        style={{ color: 'var(--text-primary)' }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        tabIndex={hasTooltip ? 0 : -1}
      >
        {formatted.short}
        {showTooltip && hasTooltip && (
          <span
            className="absolute bottom-full left-1/2 z-50 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-1 text-sm shadow-lg"
            style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            {formatted.full}
            <span
              className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent"
              style={{ borderTopColor: 'var(--bg-primary)' }}
            />
          </span>
        )}
      </span>
    </div>
  )
}
