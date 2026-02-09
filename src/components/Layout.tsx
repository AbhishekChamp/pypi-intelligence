import { Header } from './Header'
import { Footer } from './Footer'
import type { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
