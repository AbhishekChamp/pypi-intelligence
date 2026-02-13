# PyPI Intelligence Dashboard

A comprehensive production-readiness and install-risk dashboard for Python packages from PyPI. Make informed decisions before adding dependencies to your projects with health scoring, compatibility analysis, intelligent comparison features, and advanced developer tools.

## Features

### Package Analysis
- **Health Score**: Transparent scoring system (0-100) based on maintenance, compatibility, popularity, and stability
- **Package Overview**: Quick insights into maintainers, license, last release, and project links
- **Version History**: Complete release timeline with yanked version detection
- **Compatibility Matrix**: Python version support and wheel availability across platforms
- **Download Trends**: 30-day download history with trend analysis
- **Security Analysis**: Vulnerability scanning via OSV database
- **Changelog & Release Notes**: Multi-level changelog fetching with intelligent fallbacks
  - First: Check project.urls for explicit changelog URLs
  - Second: Fetch from GitHub repository (CHANGELOG.md, HISTORY.rst, etc.)
  - Third: Fallback to PyPI release history
  - Automatic parsing for breaking changes, security fixes, features, and bug fixes
- **Bundle Analysis**: Package size analysis with wheel distributions and platform support
- **License Compatibility**: Check license compatibility with your project's license
- **Smart Update Recommendations**: Intelligent update suggestions based on changelog analysis

### Developer Tools
- **Project Dependency Scanner**: Upload `requirements.txt` or `pyproject.toml` to analyze entire dependency trees
  - Bulk health analysis with aggregate scores
  - Security vulnerability detection for all dependencies
  - Export detailed JSON reports
  - Supports requirements.txt, pyproject.toml, and Pipfile formats

- **Interactive Dependency Graph**: Visualize package dependencies with force-directed graph
  - Color-coded nodes by health status and vulnerabilities
  - Zoom, pan, and fullscreen controls
  - Export as SVG
  - Click nodes for detailed package information

- **Download Trend Comparison**: Compare multiple packages side-by-side
  - Line and area chart views
  - 30-day download history per package
  - Trend direction indicators (up/down/stable)
  - Export data as CSV

- **Requirements File Generator**: Interactive builder for dependency files
  - Generate requirements.txt, pyproject.toml (PEP 621), poetry.toml, and Pipfile
  - Version specifier selection (>=, ==, ~=, etc.)
  - Support for extras (e.g., `requests[security]`)
  - One-click copy and download

- **SBOM Generator**: Generate Software Bill of Materials
  - SPDX JSON and Tag-Value formats
  - CycloneDX JSON format
  - Upload requirements.txt for automatic package discovery
  - Compliance-ready exports for security auditing

- **Virtual Environment Analyzer**: Analyze pip freeze output
  - Detect outdated packages with latest version comparison
  - Identify packages without wheel distributions
  - Check Python compatibility
  - Get actionable maintenance recommendations

- **Dependency Conflict Resolver**: Detect and resolve version conflicts
  - Input dependencies with version specifiers
  - Identify incompatible package requirements
  - Get resolution suggestions with upgrade/downgrade/pin recommendations

- **Markdown Export**: Generate comprehensive package reports
  - README-ready markdown format
  - Includes health scores, installation commands, dependencies
  - Perfect for documentation and team sharing

### Project Workspace
- **Multi-Project Management**: Create and monitor multiple projects
  - Upload requirements.txt, pyproject.toml, or Pipfile
  - Automatic package parsing and version extraction
  - Track outdated packages across all projects
  - localStorage persistence for cross-session access
  - Add packages manually with optional version specification
  - Refresh all packages with one click
  - Expandable project cards with package details

### Comparison & Recommendations
- **Package Comparison**: Side-by-side comparison of two packages with detailed metrics
- **Smart Suggestions**: Classifier-based recommendations for similar packages (e.g., FastAPI ↔ Flask, Django)
- **Category Matching**: Automatically suggests comparable packages based on PyPI classifiers

### Installation Guide
- **Multi-Manager Support**: Installation commands for pip, Poetry, uv, PDM, Pipenv, and Conda
- **Dependency Info**: View package dependencies and Python version requirements
- **Extras Support**: Shows optional extras installation (e.g., `pip install fastapi[standard]`)
- **Configuration Formats**: Copy-paste ready formats for requirements.txt and pyproject.toml

### User Experience
- **Dark/Light Theme**: Automatic system preference detection with manual toggle
- **Search History**: Recently viewed packages with quick access
- **Favorites**: Bookmark frequently used packages
- **Export & Share**: JSON export and shareable links for packages
- **Keyboard Shortcuts**: `/` to focus search, `Esc` to clear, `?` for help

### Resilience & Error Handling
- **API Timeouts**: 10-second timeout with automatic retries (up to 3 attempts)
- **Rate Limiting**: Handles 429 responses with exponential backoff
- **CORS Proxy**: Vite proxy configuration for seamless API access
- **Graceful Degradation**: Continues functioning even when some data sources fail
- **Caching Strategy**: LRU cache with 5-minute TTL reduces API calls
- **Fallback Calculations**: Computes weekly/monthly stats from daily history when API returns zeros

### Performance Optimizations
- **TanStack Query**: Professional data fetching with intelligent caching, background refetching, and optimistic updates
- **Code Splitting**: Lazy-loaded tab components reduce initial bundle size by 40%
- **Skeleton Loading**: Smooth loading placeholders improve perceived performance
- **Prefetching**: Proactive data loading on hover for instant navigation
- **Bundle Optimization**: Manual chunks for vendor, charts, and page components

### URL State Persistence
- **Shareable Links**: Active tabs, filters, and search state synced to URL parameters
- **Direct Navigation**: Links like `/package/fastapi?tab=dependencies` open specific views
- **Browser History**: Back/forward buttons work seamlessly with application state
- **Team Collaboration**: Share exact filtered views and comparisons with colleagues

## Tech Stack

- **Frontend**: React 19 + TypeScript 5.7
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4
- **Routing**: React Router 7
- **Data Fetching**: TanStack Query (React Query) with intelligent caching
- **Charts**: Recharts
- **Graph Visualization**: Custom force-directed simulation
- **Icons**: Lucide React
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd pypi-intelligence

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`

### Building for Production

```bash
pnpm build
```

The production build will be in the `dist` directory.

## Usage

### Search for a Package
1. Enter a package name in the search bar
2. View detailed health metrics, compatibility info, and installation options
3. Navigate through tabs: Overview, Versions, Dependencies, Security, Compatibility, Downloads, Health, Install, Changelog, Bundle
4. Check **Changelog** tab for breaking changes and security fixes
5. Check **Bundle** tab for package size and install impact
6. Review **License Compatibility** to ensure it matches your project license
7. See **Smart Update Recommendations** when updates are available
8. Export a markdown report with the "Export Markdown" button

### Use Developer Tools
1. Click **"Tools"** in the header navigation
2. Choose from:
   - **Dependency Scanner**: Upload your project files for bulk analysis
   - **Download Trends**: Compare multiple packages' popularity
   - **Requirements Generator**: Build dependency files interactively
   - **SBOM Generator**: Create Software Bill of Materials for compliance
   - **Virtual Environment Analyzer**: Check for outdated packages and issues
   - **Dependency Conflict Resolver**: Detect version conflicts between packages

### Project Workspace
1. Click **"Projects"** in the header navigation
2. Create a new project by clicking "New Project"
3. Add packages manually with optional version specification
4. Or upload `requirements.txt` or `pyproject.toml` files to auto-populate dependencies
5. Track outdated packages across all your projects
6. Refresh all packages with one click to check for updates

### Compare Packages
1. Click "Compare" on any package page or go to `/compare`
2. Enter the first package name
3. See smart suggestions for similar packages based on PyPI classifiers
4. Click a suggestion or manually enter a second package
5. View side-by-side comparison

### Installation Commands
1. Navigate to the "Install" tab on any package page
2. Copy installation commands for your preferred package manager
3. View dependencies and Python version requirements
4. Install with optional extras if available

### Share Specific Views
1. Navigate to any package and switch to your preferred tab (e.g., Dependencies)
2. The URL automatically updates to include the tab state (e.g., `?tab=dependencies`)
3. Copy the URL to share the exact view with your team
4. Works with filters, search, and comparison pages too

## Deployment

### Vercel

The project includes a `vercel.json` configuration. Simply connect your GitHub repository to Vercel for automatic deployments.

### Netlify

The project includes a `_redirects` file for SPA routing support. Deploy using:

```bash
netlify deploy --prod --dir=dist
```

## APIs Used

- **PyPI JSON API**: `https://pypi.org/pypi/<package>/json`
  - Package metadata, releases, classifiers
  - Supports both legacy and SPDX license formats
- **PyPIStats API**: `https://pypistats.org/api/packages/<package>/recent`
  - Download statistics and trends
- **OSV API**: `https://api.osv.dev/v1/query`
  - Security vulnerability database

## Project Structure

```
src/
├── api/                   # API clients with caching and error handling
│   └── pypi.ts           # PyPI, PyPIStats, and OSV API clients
├── components/           # React components
│   ├── BundleAnalysisTab.tsx      # Package size and distribution analysis
│   ├── ChangelogTab.tsx           # GitHub changelog integration
│   ├── CompatibilityTab.tsx
│   ├── ConflictResolver.tsx       # Dependency conflict detection and resolution
│   ├── DependenciesTab.tsx
│   ├── DependencyGraph.tsx        # Interactive graph visualization
│   ├── DownloadsTab.tsx
│   ├── DownloadTrendComparison.tsx # Multi-package trend charts
│   ├── ErrorDisplay.tsx
│   ├── Header.tsx
│   ├── HealthTab.tsx
│   ├── InstallationTab.tsx
│   ├── Layout.tsx
│   ├── LicenseCompatibility.tsx   # License compatibility checker
│   ├── MarkdownExport.tsx         # Markdown report generation
│   ├── OverviewTab.tsx
│   ├── ProjectDependencyScanner.tsx  # File upload analysis
│   ├── RequirementsGenerator.tsx     # Interactive file builder
│   ├── SBOMGenerator.tsx             # SBOM export tool
│   ├── SecurityTab.tsx
│   ├── SearchInput.tsx
│   ├── Skeleton.tsx                  # Loading skeletons
│   ├── SmartUpdateRecommendations.tsx # Update recommendations
│   ├── Tabs.tsx
│   ├── TypeStubIndicator.tsx      # Type stub availability indicator
│   ├── VersionsTab.tsx
│   └── VirtualEnvironmentAnalyzer.tsx # Environment analysis
├── contexts/             # React contexts
│   └── ThemeProvider.tsx # Dark/light theme management
├── hooks/                # Custom React hooks
│   ├── index.ts         # Core data hooks
│   ├── useFavorites.ts
│   ├── usePackageSuggestions.ts
│   ├── useQueryHooks.ts           # TanStack Query hooks
│   ├── useSearchHistory.ts
│   └── useURLState.ts             # URL state management
├── pages/                # Page components
│   ├── AboutPage.tsx
│   ├── ComparePage.tsx
│   ├── HomePage.tsx
│   ├── PackageDetailPage.tsx
│   ├── ProjectWorkspacePage.tsx  # Multi-project management
│   └── ToolsPage.tsx             # Developer tools hub
├── providers/            # Context providers
│   └── QueryProvider.tsx # TanStack Query provider
├── types/                # TypeScript definitions
│   └── index.ts
├── utils/                # Utility functions
│   ├── githubScraper.ts          # GitHub changelog and license utilities
│   ├── index.ts
│   ├── packageNames.ts
│   └── suggestions.ts
├── App.tsx
├── index.css
└── main.tsx
```

## Architecture Highlights

### TanStack Query Integration
- **Intelligent Caching**: Automatic stale-while-revalidate caching with configurable TTL
- **Background Refetching**: Data stays fresh without blocking the UI
- **Optimistic Updates**: Instant UI feedback for user actions
- **Error Retry**: Exponential backoff for transient failures
- **Prefetching**: Proactive data loading on hover for instant navigation
- **DevTools**: Built-in debugging tools for development

### Code Splitting & Lazy Loading
- **Component-Level Splitting**: Each tab component loaded on demand
- **Vendor Chunking**: React, Recharts, and utilities in separate bundles
- **Skeleton Fallbacks**: Smooth loading states prevent layout shift
- **40% Smaller Initial Bundle**: Faster first paint and time-to-interactive

### Smart Suggestion System
- Extracts key classifiers (Framework, Topic, Audience) from PyPI metadata
- Matches packages in the same category (web frameworks, data science, etc.)
- Calculates similarity scores based on classifier overlap
- Caches suggestions in sessionStorage for 5 minutes

### Dependency Graph Visualization
- Custom force-directed physics simulation
- Real-time node positioning with repulsion and attraction forces
- Zoom and pan support with transform matrix
- Color-coded by health score and vulnerability status

### Error Resilience
- In-memory LRU cache (100 items, 5-minute TTL) to reduce API calls
- Automatic retry with exponential backoff for transient failures
- Graceful fallbacks when APIs are unavailable
- SessionStorage availability checks for private browsing mode

### Security Analysis
- Integration with OSV (Open Source Vulnerabilities) database
- Real-time vulnerability checking for any package version
- Severity scoring and CVE references
- Cached results for performance

### License Detection
- Supports both legacy `license` field and modern `license_expression` (SPDX)
- Extracts license information from classifiers
- Handles complex license strings with pattern matching

## Development

### Code Quality

```bash
# Run linter
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Check formatting
pnpm format:check
```

### Environment Variables

No environment variables are required. The app uses public PyPI APIs.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Supports modern browsers with ES2020+ features

## Performance

- **Code Splitting**: Lazy-loaded tab components reduce initial bundle size by 40%
- **Bundle Optimization**: Vendor (48KB), charts (404KB), and main bundles separated
- **TanStack Query**: Intelligent caching with background refetching and stale-while-revalidate
- **Skeleton Loading**: Smooth loading states improve perceived performance
- **Prefetching**: Proactive data loading on hover for instant navigation
- **Tree Shaking**: Unused code eliminated in production
- **SVG Export**: Client-side generation without server processing
- **Gzip Compression**: All assets compressed for faster delivery

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `/` | Focus search bar |
| `Esc` | Clear search / Close modals |
| `?` | Show keyboard shortcuts help |
| `Ctrl/Cmd + Enter` | Submit search |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Acknowledgments

- [PyPI](https://pypi.org/) for the package metadata API
- [PyPIStats](https://pypistats.org/) for download statistics
- [OSV](https://osv.dev/) for security vulnerability data
- [Trove Classifiers](https://pypi.org/classifiers/) for package categorization
