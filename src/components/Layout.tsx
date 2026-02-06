import { Header } from './Header'
import type { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 sm:px-6 lg:px-8">
          <p>PyPI Intelligence Dashboard &copy; {new Date().getFullYear()}</p>
          <p className="mt-1">Built for Python developers to make informed package decisions</p>
        </div>
      </footer>
    </div>
  )
}
