import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { SearchInput, type SearchInputHandle } from '@/components/SearchInput'
import { SearchHistory } from '@/components/SearchHistory'
import { Favorites } from '@/components/Favorites'
import { Package, TrendingUp, Shield, Clock } from 'lucide-react'
import { useSearchHistory, useFavorites } from '@/hooks'

export function HomePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const searchInputRef = useRef<SearchInputHandle>(null)
  const { history, addToHistory, removeFromHistory, clearHistory } = useSearchHistory()
  const { favorites, removeFavorite, clearFavorites } = useFavorites()

  const handleSearch = async (query: string) => {
    setLoading(true)
    // Add to history when searching
    addToHistory({ packageName: query })
    navigate(`/package/${query}`)
  }

  const handleHistorySelect = (packageName: string) => {
    setLoading(true)
    navigate(`/package/${packageName}`)
  }

  const handleFavoriteSelect = (packageName: string) => {
    setLoading(true)
    navigate(`/package/${packageName}`)
  }

  return (
    <Layout>
      <div 
        className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center px-4 py-8" 
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="w-full max-w-3xl text-center">
          {/* Hero */}
          <div className="mb-8">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
              <Package className="h-8 w-8 text-white" />
            </div>
            <h1 
              className="mb-4 text-4xl font-bold sm:text-5xl" 
              style={{ color: 'var(--text-primary)' }}
            >
              PyPI Intelligence
            </h1>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Production-readiness and install-risk dashboard for Python packages.
              <br />
              Make informed decisions before adding dependencies.
            </p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <SearchInput 
              ref={searchInputRef}
              onSearch={handleSearch} 
              loading={loading} 
            />
          </div>

          {/* Features */}
          <div className="mb-8 grid gap-6 sm:grid-cols-3">
            <FeatureCard
              icon={<Shield className="h-6 w-6 text-blue-600" />}
              title="Health Score"
              description="Transparent scoring based on maintenance, compatibility, and risk factors"
            />
            <FeatureCard
              icon={<Clock className="h-6 w-6 text-purple-600" />}
              title="Release Analysis"
              description="Track release velocity, yanked versions, and maintenance patterns"
            />
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6 text-green-600" />}
              title="Download Trends"
              description="Monitor package popularity and growth over time"
            />
          </div>

          {/* Search History & Favorites */}
          <div className="mb-8 grid gap-6 sm:grid-cols-2">
            <SearchHistory
              history={history}
              onSelect={handleHistorySelect}
              onRemove={removeFromHistory}
              onClear={clearHistory}
              isVisible={true}
            />
            <Favorites
              favorites={favorites}
              onSelect={handleFavoriteSelect}
              onRemove={removeFavorite}
              onClear={clearFavorites}
              isVisible={true}
            />
          </div>

          {/* Examples */}
          <div className="mt-12">
            <p className="mb-3 text-sm" style={{ color: 'var(--text-muted)' }}>
              Try searching for:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['requests', 'django', 'numpy', 'pandas', 'fastapi', 'flask'].map(pkg => (
                <button
                  key={pkg}
                  onClick={() => handleSearch(pkg)}
                  className="rounded-full px-4 py-2 text-sm transition-colors hover:opacity-80"
                  style={{ 
                    backgroundColor: 'var(--bg-tertiary)', 
                    color: 'var(--text-secondary)' 
                  }}
                >
                  {pkg}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div 
      className="rounded-lg p-6 shadow-sm" 
      style={{ backgroundColor: 'var(--card-bg)' }}
    >
      <div 
        className="mb-3 inline-flex rounded-lg p-3" 
        style={{ backgroundColor: 'var(--bg-tertiary)' }}
      >
        {icon}
      </div>
      <h3 
        className="mb-2 font-semibold" 
        style={{ color: 'var(--text-primary)' }}
      >
        {title}
      </h3>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {description}
      </p>
    </div>
  )
}
