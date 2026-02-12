import { useState } from 'react'
import { Layout } from '@/components/Layout'
import { ProjectDependencyScanner } from '@/components/ProjectDependencyScanner'
import { DownloadTrendComparison } from '@/components/DownloadTrendComparison'
import { RequirementsGenerator } from '@/components/RequirementsGenerator'
import { SBOMGenerator } from '@/components/SBOMGenerator'
import { VirtualEnvironmentAnalyzer } from '@/components/VirtualEnvironmentAnalyzer'
import { 
  Scan, 
  TrendingUp, 
  FileCode, 
  ArrowLeft,
  Wrench,
  FileJson,
  Terminal
} from 'lucide-react'
import { Link } from 'react-router-dom'

type ToolId = 'scanner' | 'trends' | 'generator' | 'sbom' | 'venv-analyzer'

const tools = [
  {
    id: 'scanner' as ToolId,
    name: 'Dependency Scanner',
    description: 'Upload requirements.txt or pyproject.toml to analyze all dependencies',
    icon: Scan,
    component: ProjectDependencyScanner,
  },
  {
    id: 'trends' as ToolId,
    name: 'Download Trends',
    description: 'Compare download statistics across multiple packages',
    icon: TrendingUp,
    component: DownloadTrendComparison,
  },
  {
    id: 'generator' as ToolId,
    name: 'Requirements Generator',
    description: 'Build requirements files for pip, Poetry, PDM, and Pipenv',
    icon: FileCode,
    component: RequirementsGenerator,
  },
  {
    id: 'sbom' as ToolId,
    name: 'SBOM Generator',
    description: 'Generate Software Bill of Materials in SPDX or CycloneDX format',
    icon: FileJson,
    component: SBOMGenerator,
  },
  {
    id: 'venv-analyzer' as ToolId,
    name: 'Virtual Environment Analyzer',
    description: 'Analyze pip freeze output for outdated and vulnerable packages',
    icon: Terminal,
    component: VirtualEnvironmentAnalyzer,
  },
]

export function ToolsPage() {
  const [activeTool, setActiveTool] = useState<ToolId | null>(null)

  const ActiveComponent = activeTool ? tools.find(t => t.id === activeTool)?.component : null

  return (
    <Layout>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        {/* Header */}
        <div 
          className="border-b" 
          style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}
        >
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <Link
              to="/"
              className="mb-4 inline-flex items-center gap-2 transition-colors duration-200 hover:text-blue-600"
              style={{ color: 'var(--text-muted)' }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Search
            </Link>
            <div className="flex items-center gap-3">
              <Wrench className="h-8 w-8" style={{ color: 'var(--accent)' }} />
              <div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Developer Tools
                </h1>
                <p className="mt-1" style={{ color: 'var(--text-muted)' }}>
                  Advanced utilities for Python package management
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {activeTool && ActiveComponent ? (
            <div className="space-y-6">
              <button
                onClick={() => setActiveTool(null)}
                className="flex items-center gap-2 text-sm transition-colors hover:text-blue-600"
                style={{ color: 'var(--text-muted)' }}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Tools
              </button>
              
              <div 
                className="rounded-xl border p-6"
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
              >
                <h2 className="mb-6 text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {tools.find(t => t.id === activeTool)?.name}
                </h2>
                <ActiveComponent />
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tools.map(tool => {
                const Icon = tool.icon
                return (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    className="group relative overflow-hidden rounded-xl border p-6 text-left transition-all duration-200 hover:border-blue-500 hover:shadow-lg"
                    style={{ 
                      backgroundColor: 'var(--card-bg)', 
                      borderColor: 'var(--border)' 
                    }}
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 transition-colors group-hover:bg-blue-600">
                      <Icon className="h-6 w-6 text-blue-600 transition-colors group-hover:text-white" />
                    </div>
                    <h3 
                      className="mb-2 text-lg font-semibold transition-colors group-hover:text-blue-600"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {tool.name}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {tool.description}
                    </p>
                    <div className="absolute bottom-0 left-0 h-1 w-0 bg-blue-600 transition-all duration-300 group-hover:w-full" />
                  </button>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </Layout>
  )
}
