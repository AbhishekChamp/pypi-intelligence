import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { SearchInput } from '@/components/SearchInput'
import { Package, TrendingUp, Shield, Clock } from 'lucide-react'

export function HomePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleSearch = async (query: string) => {
    setLoading(true)
    navigate(`/package/${query}`)
  }

  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center px-4">
        <div className="w-full max-w-3xl text-center">
          {/* Hero */}
          <div className="mb-8">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
              <Package className="h-8 w-8 text-white" />
            </div>
            <h1 className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl">
              PyPI Intelligence
            </h1>
            <p className="text-lg text-gray-600">
              Production-readiness and install-risk dashboard for Python packages.
              <br />
              Make informed decisions before adding dependencies.
            </p>
          </div>

          {/* Search */}
          <div className="mb-12">
            <SearchInput onSearch={handleSearch} loading={loading} />
          </div>

          {/* Features */}
          <div className="grid gap-6 sm:grid-cols-3">
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

          {/* Examples */}
          <div className="mt-12">
            <p className="mb-3 text-sm text-gray-500">Try searching for:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['requests', 'django', 'numpy', 'pandas', 'fastapi', 'flask'].map(pkg => (
                <button
                  key={pkg}
                  onClick={() => handleSearch(pkg)}
                  className="rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
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
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-3 inline-flex rounded-lg bg-gray-50 p-3">{icon}</div>
      <h3 className="mb-2 font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}
