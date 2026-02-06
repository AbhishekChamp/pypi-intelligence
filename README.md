# PyPI Intelligence Dashboard

A production-readiness and install-risk dashboard for Python packages from PyPI. Make informed decisions before adding dependencies to your projects.

## Features

- **Health Score**: Transparent scoring system (0-100) based on maintenance, compatibility, popularity, and stability
- **Package Overview**: Quick insights into maintainers, license, last release, and project links
- **Version History**: Complete release timeline with yanked version detection
- **Compatibility Matrix**: Python version support and wheel availability across platforms
- **Download Trends**: 30-day download history with trend analysis
- **Package Comparison**: Side-by-side comparison of two packages

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Recharts
- Lucide React Icons

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm

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
- **PyPIStats API**: `https://pypistats.org/api/packages/<package>/recent`

## Project Structure

```
src/
├── api/           # API clients with caching
├── components/    # React components
├── hooks/         # Custom React hooks
├── pages/         # Page components
├── types/         # TypeScript definitions
└── utils/         # Utility functions
```

## License

MIT
