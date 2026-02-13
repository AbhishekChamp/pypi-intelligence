// PyPI API Response Types
export interface PyPIPackage {
  info: PackageInfo
  releases: Record<string, ReleaseFile[]>
  urls: ReleaseFile[]
}

export interface PackageInfo {
  name: string
  version: string
  summary: string
  description: string
  description_content_type: string | null
  author: string | null
  author_email: string | null
  maintainer: string | null
  maintainer_email: string | null
  license: string | null
  license_expression: string | null
  license_files: string[] | null
  keywords: string | null
  classifiers: string[]
  platform: string | null
  home_page: string | null
  download_url: string | null
  requires_python: string | null
  requires_dist: string[] | null
  provides_dist: string[] | null
  obsoletes_dist: string[] | null
  project_urls: Record<string, string> | null
  package_url: string
  release_url: string
  docs_url: string | null
  bugtrack_url: string | null
  yanked: boolean
  yanked_reason: string | null
}

export interface ReleaseFile {
  filename: string
  url: string
  digests: {
    md5: string
    sha256: string
  }
  md5_digest: string
  sha256_digest: string
  size: number
  upload_time: string
  upload_time_iso_8601: string
  python_version: string
  packagetype: string
  comment_text: string | null
  downloads: number
  has_sig: boolean
  yanked?: boolean
  yanked_reason?: string | null
}

// PyPIStats API Response Types
export interface PyPIStatsRecent {
  data: {
    last_day: number
    last_week: number
    last_month: number
  }
  package: string
  type: string
}

export interface PyPIStatsDaily {
  data: Array<{
    category: string
    date: string
    downloads: number
  }>
  package: string
  type: string
}

// Internal Data Models
export interface PackageOverview {
  name: string
  version: string
  summary: string
  description: string
  license: string | null
  author: string | null
  maintainer: string | null
  maintainerCount: number
  lastReleaseDate: Date | null
  projectUrls: Record<string, string>
  isYanked: boolean
}

export interface ReleaseInfo {
  version: string
  date: Date | null
  isYanked: boolean
  yankedReason: string | null
  files: ReleaseFile[]
}

export interface WheelInfo {
  platform: string
  pythonVersion: string
  abi: string
  isWheel: boolean
  isPurePython: boolean
  hasLinuxSupport: boolean
  hasMacosSupport: boolean
  hasWindowsSupport: boolean
}

export interface CompatibilityMatrix {
  pythonVersions: string[]
  platforms: {
    linux: boolean
    macos: boolean
    windows: boolean
  }
  wheelsAvailable: boolean
  purePython: boolean
  sourceOnly: boolean
}

export interface DownloadStats {
  daily: number
  weekly: number
  monthly: number
  history: Array<{
    date: string
    downloads: number
  }>
  trend: 'up' | 'down' | 'stable'
  trendPercentage: number
}

export interface HealthScore {
  score: number
  rating: 'excellent' | 'good' | 'fair' | 'poor'
  breakdown: {
    recency: number
    maintenance: number
    compatibility: number
    popularity: number
    stability: number
  }
  warnings: string[]
  recommendations: string[]
}

export interface PackageComparison {
  packages: [PackageOverview, PackageOverview]
  healthScores: [HealthScore, HealthScore]
  compatibilities: [CompatibilityMatrix, CompatibilityMatrix]
  downloads: [DownloadStats, DownloadStats]
}

export type TabId = 'overview' | 'versions' | 'dependencies' | 'security' | 'compatibility' | 'downloads' | 'health' | 'install' | 'changelog' | 'bundle'

// Changelog Types
export interface ChangelogEntry {
  version: string
  date: string | null
  changes: string[]
  isBreaking: boolean
  isSecurity: boolean
  isFeature: boolean
  isFix: boolean
}

export interface ChangelogData {
  entries: ChangelogEntry[]
  source: 'github' | 'pypi' | 'fallback'
  error?: string
}

// Bundle Analysis Types
export interface BundleStats {
  totalSize: number
  wheelSize: number
  sourceSize: number
  compressedSize: number
  dependencies: number
  transitiveDeps: number
  hasTypeStubs: boolean
  hasPurePythonWheel: boolean
  hasBinaryWheel: boolean
  platforms: string[]
}

// License Compatibility Types
export type LicenseType = 'MIT' | 'Apache-2.0' | 'BSD-2-Clause' | 'BSD-3-Clause' | 'GPL-2.0' | 'GPL-3.0' | 'LGPL-2.1' | 'LGPL-3.0' | 'MPL-2.0' | 'ISC' | 'Unlicense' | 'CC0-1.0' | 'Proprietary' | 'Unknown'

export interface LicenseCompatibility {
  isCompatible: boolean
  projectLicense: LicenseType
  packageLicense: LicenseType
  risk: 'low' | 'medium' | 'high' | 'critical'
  explanation: string
  requiresSourceDisclosure: boolean
  requiresSameLicense: boolean
}

// Project Workspace Types
export interface ProjectPackage {
  name: string
  version: string | null
  specifier: string
  latestVersion: string | null
  outdated: boolean
  breakingRisk: 'none' | 'low' | 'medium' | 'high'
  healthScore: number | null
  vulnerabilities: number
  license: string | null
}

export interface MonitoredProject {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  packages: ProjectPackage[]
  healthScore: number
  vulnerabilityCount: number
  outdatedCount: number
}

// Dependency Conflict Types
export interface VersionConflict {
  package: string
  requiredBy: Array<{
    package: string
    version: string
    specifier: string
  }>
  conflictType: 'direct' | 'transitive'
  suggestedResolution: string | null
  resolvable: boolean
}

export interface ConflictResolution {
  conflicts: VersionConflict[]
  suggestions: Array<{
    action: 'upgrade' | 'downgrade' | 'pin'
    package: string
    targetVersion: string
    reason: string
  }>
}

// Smart Update Types
export interface UpdateRecommendation {
  package: string
  currentVersion: string
  latestVersion: string
  recommendation: 'immediate' | 'safe' | 'caution' | 'hold'
  breakingChanges: boolean
  securityFixes: boolean
  newFeatures: boolean
  bugFixes: boolean
  riskScore: number // 0-100
  reason: string
}
