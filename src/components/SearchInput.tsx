import { Search, Loader2 } from 'lucide-react'
import { useState, useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { cn } from '@/utils'

export interface SearchInputHandle {
  focus: () => void
  clear: () => void
}

interface SearchInputProps {
  onSearch: (query: string) => void
  loading?: boolean
  placeholder?: string
  enableKeyboardShortcuts?: boolean
  onFocus?: () => void
  onBlur?: () => void
}

export const SearchInput = forwardRef<SearchInputHandle, SearchInputProps>(
  function SearchInput(
    {
      onSearch,
      loading = false,
      placeholder = 'Search PyPI packages...',
      enableKeyboardShortcuts = true,
      onFocus,
      onBlur,
    }: SearchInputProps,
    ref
  ) {
    const [query, setQuery] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)

    // Expose imperative handle
    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus()
      },
      clear: () => {
        setQuery('')
        inputRef.current?.focus()
      },
    }))

    // Keyboard shortcuts
    useEffect(() => {
      if (!enableKeyboardShortcuts) return

      const handleKeyDown = (e: KeyboardEvent) => {
        // Ignore if user is typing in an input or textarea
        const target = e.target as HTMLElement
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          return
        }

        // '/' to focus search
        if (e.key === '/') {
          e.preventDefault()
          inputRef.current?.focus()
        }

        // 'Esc' to clear (handled in input onKeyDown)
      }

      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }, [enableKeyboardShortcuts])

    const handleSubmit = useCallback(
      (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
          onSearch(query.trim())
        }
      },
      [query, onSearch]
    )

    const handleKeyDown = (e: React.KeyboardEvent) => {
      // Escape to clear
      if (e.key === 'Escape') {
        setQuery('')
      }
    }

    return (
      <form onSubmit={handleSubmit} className="relative w-full max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={placeholder}
            className={cn(
              'w-full rounded-lg border py-3 pl-10 pr-24',
              'placeholder:text-[var(--text-muted)]',
              'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
            disabled={loading}
          />
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
            {query && (
              <kbd className="hidden rounded px-1.5 py-0.5 text-xs sm:inline-block" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                Esc
              </kbd>
            )}
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className={cn(
                'rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white',
                'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'transition-colors duration-200'
              )}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Search'
              )}
            </button>
          </div>
        </div>
        {enableKeyboardShortcuts && (
          <div className="mt-2 hidden text-center text-xs sm:block" style={{ color: 'var(--text-muted)' }}>
            Press <kbd className="rounded px-1.5 py-0.5" style={{ backgroundColor: 'var(--bg-tertiary)' }}>/</kbd> to focus search
          </div>
        )}
      </form>
    )
  }
)
