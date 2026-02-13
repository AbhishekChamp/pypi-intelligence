import { cn } from '@/utils'
import type { TabId } from '@/types'

const tabs: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'versions', label: 'Versions' },
  { id: 'dependencies', label: 'Dependencies' },
  { id: 'security', label: 'Security' },
  { id: 'compatibility', label: 'Compatibility' },
  { id: 'downloads', label: 'Downloads' },
  { id: 'health', label: 'Health' },
  { id: 'install', label: 'Install' },
  { id: 'changelog', label: 'Changelog' },
  { id: 'bundle', label: 'Bundle' },
]

interface TabsProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function Tabs({ activeTab, onTabChange }: TabsProps) {
  return (
    <div 
      className="border-b" 
      style={{ borderColor: 'var(--border)' }}
    >
      <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent hover:border-gray-300'
            )}
            style={{
              color: activeTab === tab.id ? undefined : 'var(--text-muted)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
