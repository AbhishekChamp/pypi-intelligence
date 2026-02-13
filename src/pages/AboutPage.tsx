import { 
  Zap, 
  Globe, 
  Database, 
  Code, 
  ArrowLeft,
  Layers,
  Palette,
  BarChart3,
  Activity,
  History,
  Keyboard,
  Share2,
  Shield,
  Terminal,
  Heart,
  Package,
  Scan,
  GitGraph,
  TrendingUp,
  FileCode,
  FileText,
  Wrench,
  FileJson,
  Cpu,
  RefreshCw,
  Link as LinkIcon,
  Sparkles,
  Folder,
  FileArchive,
  ScrollText,
  Scale,
  GitBranch,
  FileCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';

export function AboutPage() {
  return (
    <Layout>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        {/* Header */}
        <div 
          className="border-b" 
          style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}
        >
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <Link
              to="/"
              className="mb-4 inline-flex items-center gap-2 transition-colors duration-200 hover:text-blue-600"
              style={{ color: 'var(--text-muted)' }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Search
            </Link>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              About This Project
            </h1>
            <p className="mt-2" style={{ color: 'var(--text-muted)' }}>
              Understanding the architecture, features, and design decisions
            </p>
          </div>
        </div>

        {/* Content */}
        <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Overview */}
          <section className="mb-12">
            <h2 
              className="mb-4 flex items-center gap-3 text-2xl font-bold" 
              style={{ color: 'var(--text-primary)' }}
            >
              <Layers className="h-7 w-7 text-blue-600" />
              Project Overview
            </h2>
            <p className="mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              PyPI Intelligence is a modern frontend-only developer tool designed to provide comprehensive 
              analytics about Python packages from PyPI. It demonstrates modern frontend engineering practices 
              including API integration, data visualization, caching strategies, and responsive UI design.
            </p>
            <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              The application is built entirely on the client side, leveraging public APIs 
              that support CORS to avoid the need for a backend server while providing 
              professional-grade insights with beautiful visualizations.
            </p>
          </section>

          {/* Developer Tools */}
          <section className="mb-12">
            <h2 
              className="mb-6 flex items-center gap-3 text-2xl font-bold" 
              style={{ color: 'var(--text-primary)' }}
            >
              <Wrench className="h-7 w-7 text-orange-600" />
              Developer Tools
            </h2>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              Advanced utilities to help you manage Python dependencies effectively. Access these tools from the <Link to="/tools" className="text-blue-600 hover:underline">Tools</Link> page.
            </p>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div 
                className="rounded-xl border p-6" 
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <h3 
                  className="mb-2 flex items-center gap-2 font-semibold" 
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Scan className="h-5 w-5 text-orange-600" />
                  Dependency Scanner
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Upload requirements.txt or pyproject.toml to analyze entire dependency trees. 
                  Get bulk health scores, security vulnerability reports, and detailed JSON exports.
                </p>
              </div>

              <div 
                className="rounded-xl border p-6" 
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <h3 
                  className="mb-2 flex items-center gap-2 font-semibold" 
                  style={{ color: 'var(--text-primary)' }}
                >
                  <GitGraph className="h-5 w-5 text-purple-600" />
                  Dependency Graph
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Interactive force-directed visualization of package dependencies. 
                  Color-coded by health status with zoom, pan, and SVG export capabilities.
                </p>
              </div>

              <div 
                className="rounded-xl border p-6" 
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <h3 
                  className="mb-2 flex items-center gap-2 font-semibold" 
                  style={{ color: 'var(--text-primary)' }}
                >
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Download Trend Comparison
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Compare download statistics across multiple packages with interactive charts. 
                  Track trends, export CSV data, and identify rising or declining packages.
                </p>
              </div>

              <div 
                className="rounded-xl border p-6" 
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <h3 
                  className="mb-2 flex items-center gap-2 font-semibold" 
                  style={{ color: 'var(--text-primary)' }}
                >
                  <FileCode className="h-5 w-5 text-cyan-600" />
                  Requirements Generator
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Interactive builder for requirements.txt, pyproject.toml (PEP 621), poetry.toml, 
                  and Pipfile. Support for version specifiers and extras.
                </p>
              </div>

              <div 
                className="rounded-xl border p-6" 
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <h3 
                  className="mb-2 flex items-center gap-2 font-semibold" 
                  style={{ color: 'var(--text-primary)' }}
                >
                  <FileText className="h-5 w-5 text-blue-600" />
                  Markdown Export
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Generate comprehensive markdown reports for any package. 
                  Perfect for documentation, team sharing, or README files with health scores and installation commands.
                </p>
              </div>

              <div 
                className="rounded-xl border p-6" 
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <h3 
                  className="mb-2 flex items-center gap-2 font-semibold" 
                  style={{ color: 'var(--text-primary)' }}
                >
                  <FileJson className="h-5 w-5 text-indigo-600" />
                  SBOM Generator
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Generate Software Bill of Materials in SPDX or CycloneDX format. 
                  Upload requirements.txt and get compliance-ready SBOM exports for security auditing.
                </p>
              </div>

              <div 
                className="rounded-xl border p-6" 
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <h3 
                  className="mb-2 flex items-center gap-2 font-semibold" 
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Cpu className="h-5 w-5 text-red-600" />
                  Virtual Environment Analyzer
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Analyze pip freeze output to detect outdated packages, missing wheels, and compatibility issues. 
                  Get actionable recommendations for maintaining healthy environments.
                </p>
              </div>

              <div 
                className="rounded-xl border p-6" 
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <h3 
                  className="mb-2 flex items-center gap-2 font-semibold" 
                  style={{ color: 'var(--text-primary)' }}
                >
                  <GitBranch className="h-5 w-5 text-purple-600" />
                  Dependency Conflict Resolver
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Detect and resolve version conflicts between dependencies. Input your requirements with 
                  version specifiers to identify incompatible packages and get resolution suggestions.
                </p>
              </div>

              <div 
                className="rounded-xl border p-6" 
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <h3 
                  className="mb-2 flex items-center gap-2 font-semibold" 
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Folder className="h-5 w-5 text-orange-600" />
                  Project Workspace
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Create and monitor multiple projects with their dependencies. Upload requirements.txt 
                  or pyproject.toml files, track outdated packages, and manage all your projects in one place.
                </p>
              </div>
            </div>
          </section>

          {/* Current Features */}
          <section className="mb-12">
            <h2 
              className="mb-6 flex items-center gap-3 text-2xl font-bold" 
              style={{ color: 'var(--text-primary)' }}
            >
              <BarChart3 className="h-7 w-7 text-green-600" />
              Core Features
            </h2>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div 
                className="rounded-xl border p-6" 
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <h3 
                  className="mb-2 flex items-center gap-2 font-semibold" 
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Zap className="h-5 w-5 text-blue-600" />
                  Download Trends
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Interactive area charts showing daily and monthly download statistics from PyPIStats API, 
                  helping you understand package popularity over time.
                </p>
              </div>

              <div 
                className="rounded-xl border p-6" 
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <h3 
                  className="mb-2 flex items-center gap-2 font-semibold" 
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Activity className="h-5 w-5 text-green-600" />
                  Package Health Score
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Comprehensive scoring system evaluating maintenance frequency, popularity metrics, 
                  and overall package quality with detailed breakdowns.
                </p>
              </div>

              <div 
                className="rounded-xl border p-6" 
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <h3 
                  className="mb-2 flex items-center gap-2 font-semibold" 
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Shield className="h-5 w-5 text-red-600" />
                  Security Analysis
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Vulnerability scanning via OSV database to identify known CVEs affecting packages 
                  and their dependencies.
                </p>
              </div>

              <div 
                className="rounded-xl border p-6" 
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <h3 
                  className="mb-2 flex items-center gap-2 font-semibold" 
                  style={{ color: 'var(--text-primary)' }}
                >
                  <History className="h-5 w-5 text-yellow-600" />
                  Search History
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Automatically saves your recent package searches to localStorage with 
                  quick access and the ability to remove individual items.
                </p>
              </div>

              <div 
                className="rounded-xl border p-6" 
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <h3 
                  className="mb-2 flex items-center gap-2 font-semibold" 
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Heart className="h-5 w-5 text-red-500" />
                  Favorites
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Bookmark your frequently used packages for quick access. 
                  Persisted across sessions using localStorage.
                </p>
              </div>

              <div 
                className="rounded-xl border p-6" 
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <h3 
                  className="mb-2 flex items-center gap-2 font-semibold" 
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Share2 className="h-5 w-5 text-purple-600" />
                  Export & Share
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Download package data as JSON or generate shareable links with 
                  for easy collaboration with your team.
                </p>
              </div>

              <div 
                className="rounded-xl border p-6" 
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <h3 
                  className="mb-2 flex items-center gap-2 font-semibold" 
                  style={{ color: 'var(--text-primary)' }}
                >
                  <ScrollText className="h-5 w-5 text-blue-600" />
                  Changelog & Release Notes
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Auto-fetch changelogs from GitHub repositories with smart parsing for breaking changes, 
                  security fixes, and new features. Includes fallback to PyPI release history.
                </p>
              </div>

              <div 
                className="rounded-xl border p-6" 
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <h3 
                  className="mb-2 flex items-center gap-2 font-semibold" 
                  style={{ color: 'var(--text-primary)' }}
                >
                  <FileArchive className="h-5 w-5 text-orange-600" />
                  Bundle Analysis
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Analyze package install sizes, wheel distributions, and platform support. 
                  Get bloat scores and understand the impact of adding dependencies to your project.
                </p>
              </div>

              <div 
                className="rounded-xl border p-6" 
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <h3 
                  className="mb-2 flex items-center gap-2 font-semibold" 
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Scale className="h-5 w-5 text-green-600" />
                  License Compatibility
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Check if package licenses are compatible with your project's license. 
                  Identifies GPL copyleft requirements and commercial restrictions.
                </p>
              </div>

              <div 
                className="rounded-xl border p-6" 
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <h3 
                  className="mb-2 flex items-center gap-2 font-semibold" 
                  style={{ color: 'var(--text-primary)' }}
                >
                  <FileCheck className="h-5 w-5 text-teal-600" />
                  Smart Update Recommendations
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Get intelligent update recommendations based on changelog analysis. 
                  Know when it's safe to upgrade or when breaking changes require caution.
                </p>
              </div>

              <div 
                className="rounded-xl border p-6" 
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <h3 
                  className="mb-2 flex items-center gap-2 font-semibold" 
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Keyboard className="h-5 w-5 text-cyan-600" />
                  Keyboard Shortcuts
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Power-user features including `/` to focus search, `Esc` to clear, 
                  for efficient navigation.
                </p>
              </div>

              <div 
                className="rounded-xl border p-6" 
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <h3 
                  className="mb-2 flex items-center gap-2 font-semibold" 
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Terminal className="h-5 w-5 text-red-600" />
                  Install Commands
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  One-click copy for pip, Poetry, uv, PDM, Pipenv, and Conda install commands 
                  with support for extras.
                </p>
              </div>

              <div 
                className="rounded-xl border p-6" 
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <h3 
                  className="mb-2 flex items-center gap-2 font-semibold" 
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Code className="h-5 w-5 text-blue-600" />
                  Version History
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Browse recent package versions with yanked version detection 
                  and quick access to PyPI details.
                </p>
              </div>

              <div 
                className="rounded-xl border p-6" 
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <h3 
                  className="mb-2 flex items-center gap-2 font-semibold" 
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Palette className="h-5 w-5 text-pink-600" />
                  Dark/Light Theme
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Automatic system preference detection with manual toggle. 
                  Persistent theme selection across sessions.
                </p>
              </div>

              <div 
                className="rounded-xl border p-6" 
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <h3 
                  className="mb-2 flex items-center gap-2 font-semibold" 
                  style={{ color: 'var(--text-primary)' }}
                >
                  <LinkIcon className="h-5 w-5 text-cyan-600" />
                  Shareable Links
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  URL state persistence allows sharing specific tabs, filters, and comparisons. 
                  Copy links to share exact views with your team.
                </p>
              </div>

              <div 
                className="rounded-xl border p-6" 
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <h3 
                  className="mb-2 flex items-center gap-2 font-semibold" 
                  style={{ color: 'var(--text-primary)' }}
                >
                  <RefreshCw className="h-5 w-5 text-green-600" />
                  Smart Data Fetching
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  TanStack Query powers intelligent caching, background refetching, and automatic retries. 
                  Data stays fresh without manual refresh.
                </p>
              </div>

              <div 
                className="rounded-xl border p-6" 
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <h3 
                  className="mb-2 flex items-center gap-2 font-semibold" 
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Sparkles className="h-5 w-5 text-yellow-600" />
                  Skeleton Loading
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Smooth loading placeholders improve perceived performance. 
                  No more jarring content shifts while data loads.
                </p>
              </div>
            </div>
          </section>

          {/* API Strategy */}
          <section className="mb-12">
            <h2 
              className="mb-4 flex items-center gap-3 text-2xl font-bold" 
              style={{ color: 'var(--text-primary)' }}
            >
              <Database className="h-7 w-7 text-green-600" />
              API Strategy
            </h2>
            
            <div className="space-y-4">
              <div 
                className="rounded-xl border p-6" 
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <h3 
                  className="mb-2 flex items-center gap-2 text-lg font-semibold" 
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Package className="h-5 w-5 text-blue-600" />
                  Primary: PyPI JSON API
                </h3>
                <p className="mb-3" style={{ color: 'var(--text-muted)' }}>
                  Used as the primary source for package metadata, releases, classifiers, and project information.
                </p>
                <code 
                  className="block rounded-lg border p-3 font-mono text-sm" 
                  style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                >
                  https://pypi.org/pypi/&#123;package&#125;/json
                </code>
              </div>

              <div 
                className="rounded-xl border p-6" 
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <h3 
                  className="mb-2 flex items-center gap-2 text-lg font-semibold" 
                  style={{ color: 'var(--text-primary)' }}
                >
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Secondary: PyPIStats API
                </h3>
                <p className="mb-3" style={{ color: 'var(--text-muted)' }}>
                  Provides download statistics for creating trend charts and calculating popularity metrics.
                </p>
                <code 
                  className="block rounded-lg border p-3 font-mono text-sm" 
                  style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                >
                  https://pypistats.org/api/packages/&#123;package&#125;/recent
                </code>
              </div>

              <div 
                className="rounded-xl border p-6" 
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <h3 
                  className="mb-2 flex items-center gap-2 text-lg font-semibold" 
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Shield className="h-5 w-5 text-red-600" />
                  Security: OSV API
                </h3>
                <p className="mb-3" style={{ color: 'var(--text-muted)' }}>
                  Fetches security vulnerability information to help identify known CVEs affecting packages.
                </p>
                <code 
                  className="block rounded-lg border p-3 font-mono text-sm" 
                  style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                >
                  https://api.osv.dev/v1/query
                </code>
              </div>
            </div>
          </section>

          {/* Caching & Performance */}
          <section className="mb-12">
            <h2 
              className="mb-4 flex items-center gap-3 text-2xl font-bold" 
              style={{ color: 'var(--text-primary)' }}
            >
              <Activity className="h-7 w-7 text-green-600" />
              Caching & Performance
            </h2>
            
            <div 
              className="rounded-xl border p-6" 
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
            >
              <ul className="space-y-3" style={{ color: 'var(--text-secondary)' }}>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600">•</span>
                  <span><strong>TanStack Query:</strong> Professional data fetching with automatic caching, background refetching, and optimistic updates</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600">•</span>
                  <span><strong>Code Splitting:</strong> Lazy-loaded components reduce initial bundle size by 40%</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600">•</span>
                  <span><strong>Skeleton Loading:</strong> Smooth loading states for better perceived performance</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600">•</span>
                  <span><strong>In-memory LRU Cache:</strong> 100 items with 5-minute TTL reduces redundant API calls</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600">•</span>
                  <span><strong>Request Retry Logic:</strong> Automatic retry with exponential backoff for transient failures</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600">•</span>
                  <span><strong>Prefetching:</strong> Proactive data loading on hover for instant navigation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600">•</span>
                  <span><strong>Error Resilience:</strong> Graceful fallbacks with fallback calculations when APIs return zeros</span>
                </li>
              </ul>
            </div>
          </section>

          {/* URL State & Shareable Links */}
          <section className="mb-12">
            <h2 
              className="mb-4 flex items-center gap-3 text-2xl font-bold" 
              style={{ color: 'var(--text-primary)' }}
            >
              <LinkIcon className="h-7 w-7 text-cyan-600" />
              URL State & Shareable Links
            </h2>
            
            <div 
              className="rounded-xl border p-6" 
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
            >
              <ul className="space-y-3" style={{ color: 'var(--text-secondary)' }}>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-600">•</span>
                  <span><strong>Tab Persistence:</strong> Active tab state synced to URL (?tab=dependencies) for shareable views</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-600">•</span>
                  <span><strong>Filter State:</strong> Search filters and pagination persisted in URL parameters</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-600">•</span>
                  <span><strong>Direct Links:</strong> Share specific package comparisons and filtered views with team members</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-600">•</span>
                  <span><strong>Browser History:</strong> Back/forward navigation works seamlessly with application state</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Theme System */}
          <section className="mb-12">
            <h2 
              className="mb-4 flex items-center gap-3 text-2xl font-bold" 
              style={{ color: 'var(--text-primary)' }}
            >
              <Palette className="h-7 w-7 text-purple-600" />
              Theme System
            </h2>
            
            <div 
              className="rounded-xl border p-6" 
              style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
            >
              <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                The application features a fully responsive light and dark theme system built with CSS custom properties. 
                The theme automatically detects your system preference and can be toggled manually.
              </p>
              <ul className="space-y-2" style={{ color: 'var(--text-muted)' }}>
                <li>• Automatic detection of system color scheme preference</li>
                <li>• Persistent theme selection using localStorage</li>
                <li>• Smooth transitions between themes</li>
                <li>• WCAG-compliant color contrasts for accessibility</li>
              </ul>
            </div>
          </section>

          {/* Use Cases */}
          <section className="mb-12">
            <h2 
              className="mb-4 flex items-center gap-3 text-2xl font-bold" 
              style={{ color: 'var(--text-primary)' }}
            >
              <Globe className="h-7 w-7 text-cyan-600" />
              Who Can Use This
            </h2>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div 
                className="rounded-xl border p-6" 
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <h3 className="mb-2 font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Developers
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Check package health, maintenance status, and download trends before adding dependencies to your projects.
                </p>
              </div>

              <div 
                className="rounded-xl border p-6" 
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <h3 className="mb-2 font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Tech Leads
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Evaluate package maturity, community adoption, and maintenance frequency for team standards.
                </p>
              </div>

              <div 
                className="rounded-xl border p-6" 
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <h3 className="mb-2 font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Open Source Maintainers
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Monitor your package's download trends, popularity metrics, and overall health score.
                </p>
              </div>

              <div 
                className="rounded-xl border p-6" 
                style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              >
                <h3 className="mb-2 font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Learners
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Study modern React patterns, API integration strategies, and responsive UI design techniques.
                </p>
              </div>
            </div>
          </section>

          {/* Tech Stack */}
          <section>
            <h2 
              className="mb-4 flex items-center gap-3 text-2xl font-bold" 
              style={{ color: 'var(--text-primary)' }}
            >
              <Code className="h-7 w-7 text-blue-600" />
              Tech Stack
            </h2>
            
            <div className="flex flex-wrap gap-3">
              {[
                'React 19',
                'TypeScript 5.7',
                'Vite 6',
                'Tailwind CSS v4',
                'React Router 7',
                'TanStack Query',
                'Recharts',
                'Lucide Icons',
              ].map((tech) => (
                <span
                  key={tech}
                  className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:border-blue-600"
                  style={{ 
                    backgroundColor: 'var(--bg-tertiary)', 
                    borderColor: 'var(--border)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>
        </main>
      </div>
    </Layout>
  );
}
