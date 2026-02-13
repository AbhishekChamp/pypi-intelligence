import { Link } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { FileQuestion, Home, Search, ArrowLeft } from 'lucide-react'

export function NotFoundPage() {
  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-100 rounded-full blur-xl opacity-50"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-6">
                <FileQuestion className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>

          {/* Error Code */}
          <h1 
            className="text-8xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            404
          </h1>

          {/* Title */}
          <h2 
            className="text-2xl font-semibold mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Page Not Found
          </h2>

          {/* Description */}
          <p 
            className="mb-8 text-lg"
            style={{ color: 'var(--text-secondary)' }}
          >
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium"
            >
              <Home className="h-5 w-5" />
              Go Home
            </Link>

            <Link
              to="/"
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              <Search className="h-5 w-5" />
              Search Packages
            </Link>
          </div>

          {/* Additional Links */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              You might want to check out:
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/tools"
                className="text-blue-600 hover:text-blue-700 hover:underline text-sm cursor-pointer"
              >
                Developer Tools
              </Link>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <Link
                to="/projects"
                className="text-blue-600 hover:text-blue-700 hover:underline text-sm cursor-pointer"
              >
                Project Workspace
              </Link>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <Link
                to="/about"
                className="text-blue-600 hover:text-blue-700 hover:underline text-sm cursor-pointer"
              >
                About
              </Link>
            </div>
          </div>

          {/* Go Back Option */}
          <button
            onClick={() => window.history.back()}
            className="mt-6 flex items-center gap-2 mx-auto text-sm cursor-pointer hover:underline"
            style={{ color: 'var(--text-muted)' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Go back to previous page
          </button>
        </div>
      </div>
    </Layout>
  )
}