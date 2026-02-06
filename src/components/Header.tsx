import { Link } from 'react-router-dom'
import { Package, Github } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <Package className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">PyPI Intelligence</h1>
            <p className="text-xs text-gray-500">Production-Ready Package Analysis</p>
          </div>
        </Link>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <Github className="h-5 w-5" />
          <span className="hidden sm:inline">GitHub</span>
        </a>
      </div>
    </header>
  )
}
