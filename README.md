# PyPI Intelligence Dashboard

A comprehensive production-readiness and install-risk dashboard for Python packages from PyPI. Make informed decisions before adding dependencies to your projects with health scoring, compatibility analysis, and intelligent comparison features.

## Features

### Package Analysis
- **Health Score**: Transparent scoring system (0-100) based on maintenance, compatibility, popularity, and stability
- **Package Overview**: Quick insights into maintainers, license, last release, and project links
- **Version History**: Complete release timeline with yanked version detection
- **Compatibility Matrix**: Python version support and wheel availability across platforms
- **Download Trends**: 30-day download history with trend analysis

### Comparison & Recommendations
- **Package Comparison**: Side-by-side comparison of two packages with detailed metrics
- **Smart Suggestions**: Classifier-based recommendations for similar packages (e.g., FastAPI ↔ Flask, Django)
- **Category Matching**: Automatically suggests comparable packages based on PyPI classifiers

### Installation Guide
- **Multi-Manager Support**: Installation commands for pip, Poetry, uv, PDM, Pipenv, and Conda
- **Dependency Info**: View package dependencies and Python version requirements
- **Extras Support**: Shows optional extras installation (e.g., `pip install fastapi[standard]`)
- **Configuration Formats**: Copy-paste ready formats for requirements.txt and pyproject.toml

### Resilience & Error Handling
- **API Timeouts**: 10-second timeout with automatic retries (up to 3 attempts)
- **Rate Limiting**: Handles 429 responses with exponential backoff
- **CORS Proxy**: Vite proxy configuration for seamless API access
- **Graceful Degradation**: Continues functioning even when some data sources fail

## Tech Stack

- **Frontend**: React 19 + TypeScript 5.7
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4
- **Routing**: React Router 7
- **Charts**: Recharts
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
3. Navigate through tabs: Overview, Versions, Compatibility, Downloads, Health, Install

### Compare Packages
1. Click "Compare with another package" or go to `/compare`
2. Enter the first package name
3. See smart suggestions for similar packages based on PyPI classifiers
4. Click a suggestion or manually enter a second package
5. View side-by-side comparison

### Installation Commands
1. Navigate to the "Install" tab on any package page
2. Copy installation commands for your preferred package manager
3. View dependencies and Python version requirements
4. Install with optional extras if available

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

## Project Structure

```
src/
├── api/                   # API clients with caching and error handling
│   └── pypi.ts           # PyPI and PyPIStats API clients
├── components/           # React components
│   ├── CompatibilityTab.tsx
│   ├── DownloadsTab.tsx
│   ├── ErrorDisplay.tsx
│   ├── Header.tsx
│   ├── HealthTab.tsx
│   ├── InstallationTab.tsx     # Installation commands component
│   ├── Layout.tsx
│   ├── OverviewTab.tsx
│   ├── PackageComparisonCard.tsx
│   ├── PackageSuggestions.tsx  # Smart suggestion cards
│   ├── SearchInput.tsx
│   ├── Skeleton.tsx
│   ├── Tabs.tsx
│   └── VersionsTab.tsx
├── hooks/                # Custom React hooks
│   ├── index.ts         # Core data hooks (usePackageData, etc.)
│   └── usePackageSuggestions.ts  # Smart suggestion hook
├── pages/                # Page components
│   ├── ComparePage.tsx
│   ├── HomePage.tsx
│   └── PackageDetailPage.tsx
├── types/                # TypeScript definitions
│   └── index.ts
├── utils/                # Utility functions
│   ├── index.ts         # General utilities
│   └── suggestions.ts   # Classifier matching algorithms
├── App.tsx
├── index.css
└── main.tsx
```

## Architecture Highlights

### Smart Suggestion System
- Extracts key classifiers (Framework, Topic, Audience) from PyPI metadata
- Matches packages in the same category (web frameworks, data science, etc.)
- Calculates similarity scores based on classifier overlap
- Caches suggestions in sessionStorage for 5 minutes

### Error Resilience
- In-memory LRU cache (100 items, 5-minute TTL) to reduce API calls
- Automatic retry with exponential backoff for transient failures
- Graceful fallbacks when APIs are unavailable
- SessionStorage availability checks for private browsing mode

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

- **Bundle Splitting**: Vendor, charts, and main bundles separated
- **Lazy Loading**: Components loaded on demand
- **API Caching**: Client-side caching reduces API calls
- **Tree Shaking**: Unused code eliminated in production

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
- [Trove Classifiers](https://pypi.org/classifiers/) for package categorization
