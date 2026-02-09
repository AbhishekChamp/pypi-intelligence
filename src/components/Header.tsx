import { Link } from 'react-router-dom'
import { Package, Github, Info } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

export function Header() {
  return (
    <header
      className="border-b"
      style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <Package className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              PyPI Intelligence
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Production-Ready Package Analysis
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/about"
            className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-gray-100"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Info className="h-5 w-5" />
            <span className="hidden sm:inline">About</span>
          </Link>
          <ThemeToggle />
          <a
            href="https://github.com/AbhishekChamp/pypi-intelligence"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 transition-colors hover:text-gray-900"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Github className="h-5 w-5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  )
}
