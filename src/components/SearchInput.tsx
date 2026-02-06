import { Search, Loader2 } from 'lucide-react'
import { useState, useCallback } from 'react'
import { cn } from '@/utils'

interface SearchInputProps {
  onSearch: (query: string) => void
  loading?: boolean
  placeholder?: string
}

export function SearchInput({
  onSearch,
  loading = false,
  placeholder = 'Search PyPI packages...',
}: SearchInputProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (query.trim()) {
        onSearch(query.trim())
      }
    },
    [query, onSearch]
  )

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-lg border border-gray-300 py-3 pl-10 pr-24',
            'text-gray-900 placeholder-gray-400',
            'focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2',
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
    </form>
  )
}
