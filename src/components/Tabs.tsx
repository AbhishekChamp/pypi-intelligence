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
]

interface TabsProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function Tabs({ activeTab, onTabChange }: TabsProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
