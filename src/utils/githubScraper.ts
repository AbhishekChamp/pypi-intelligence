import type { ChangelogData, ChangelogEntry, LicenseCompatibility, LicenseType, BundleStats, ReleaseFile } from '@/types'

// GitHub URL parsing
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const patterns = [
    /github\.com\/([^\/]+)\/([^\/]+)/,
    /github\.com\/([^\/]+)\/([^\/]+)\.git/,
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return { owner: match[1], repo: match[2].replace('.git', '') }
    }
  }
  return null
}

// Extract GitHub URL from PyPI package info
export function extractGitHubUrl(projectUrls: Record<string, string>): string | null {
  const githubPatterns = [
    projectUrls['Source Code'],
    projectUrls['Source'],
    projectUrls['Homepage'],
    projectUrls['Repository'],
    projectUrls['Code'],
  ]
  
  for (const url of githubPatterns) {
    if (url && url.includes('github.com')) {
      return url
    }
  }
  
  // Check all URLs for GitHub
  for (const [, url] of Object.entries(projectUrls)) {
    if (url && url.includes('github.com') && !url.includes('github.com/sponsors')) {
      return url
    }
  }
  
  return null
}

// Extract changelog URL from project.urls
export function extractChangelogUrl(projectUrls: Record<string, string>): string | null {
  // Check common changelog URL patterns
  const changelogPatterns = [
    'Changelog',
    'CHANGELOG',
    'Change Log',
    'Changes',
    'CHANGES',
    'History',
    'HISTORY',
    'News',
    'NEWS',
    'Releases',
    'RELEASES',
  ]
  
  for (const pattern of changelogPatterns) {
    const url = projectUrls[pattern]
    if (url) {
      return url
    }
  }
  
  // Check all URLs for changelog-related keywords
  for (const [key, url] of Object.entries(projectUrls)) {
    if (url && /changelog|changes|history|news|releases/i.test(key)) {
      return url
    }
  }
  
  return null
}

// Fetch changelog from GitHub
export async function fetchChangelogFromGitHub(
  owner: string,
  repo: string
): Promise<ChangelogData> {
  const changelogFiles = [
    'CHANGELOG.md',
    'CHANGELOG.rst',
    'CHANGELOG.txt',
    'CHANGES.md',
    'CHANGES.rst',
    'CHANGES.txt',
    'HISTORY.md',
    'HISTORY.rst',
    'HISTORY.txt',
    'NEWS.md',
    'NEWS.rst',
    'RELEASES.md',
    'CHANGELOG',
    'CHANGES',
    'HISTORY',
  ]

  for (const filename of changelogFiles) {
    try {
      const response = await fetch(`/api/github/${owner}/${repo}/main/${filename}`, {
        method: 'GET',
        headers: { 'Accept': 'text/plain' },
      })

      if (response.ok) {
        const content = await response.text()
        const entries = parseChangelog(content)
        return {
          entries,
          source: 'github',
        }
      }
    } catch {
      // Try next file
    }

    // Try with 'master' branch
    try {
      const response = await fetch(`/api/github/${owner}/${repo}/master/${filename}`, {
        method: 'GET',
        headers: { 'Accept': 'text/plain' },
      })

      if (response.ok) {
        const content = await response.text()
        const entries = parseChangelog(content)
        return {
          entries,
          source: 'github',
        }
      }
    } catch {
      // Continue to next file
    }
  }

  throw new Error('No changelog found')
}

// Fetch changelog from a direct URL (e.g., from project.urls)
export async function fetchChangelogFromUrl(url: string): Promise<ChangelogData> {
  try {
    // Handle GitHub URLs - convert to raw content URL
    if (url.includes('github.com') && !url.includes('raw.githubusercontent.com')) {
      // Convert github.com URL to raw.githubusercontent.com
      const githubMatch = url.match(/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)/)
      if (githubMatch) {
        const [, owner, repo, branch, path] = githubMatch
        url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`
      }
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/plain, text/markdown, text/x-rst, text/html',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch changelog: ${response.status}`)
    }

    const content = await response.text()

    // If it's HTML, try to extract text content
    if (response.headers.get('content-type')?.includes('text/html')) {
      // Simple HTML to text conversion
      const textContent = content
        .replace(/<script[^>]*>.*?<\/script>/gs, '')
        .replace(/<style[^>]*>.*?<\/style>/gs, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

      const entries = parseChangelog(textContent)
      return {
        entries,
        source: 'github',
      }
    }

    const entries = parseChangelog(content)
    return {
      entries,
      source: 'github',
    }
  } catch (error) {
    throw new Error(`Failed to fetch changelog from URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Parse changelog content into structured entries
function parseChangelog(content: string): ChangelogEntry[] {
  const entries: ChangelogEntry[] = []
  const lines = content.split('\n')
  
  let currentEntry: Partial<ChangelogEntry> | null = null
  let currentChanges: string[] = []
  
  for (const line of lines) {
    // Match version headers (e.g., "## 1.0.0" or "# Version 1.0.0" or "1.0.0 (2023-01-01)")
    const versionMatch = line.match(/^(?:#{1,3}\s*)?(?:version\s*)?(\d+\.\d+(?:\.\d+)?(?:[.-]\w+)?)(?:\s*[\(\[]?([^\)\]]*)[\)\]]?)?/i)
    
    if (versionMatch) {
      // Save previous entry
      if (currentEntry && currentEntry.version) {
        entries.push(createEntry(currentEntry, currentChanges))
      }
      
      // Start new entry
      currentEntry = {
        version: versionMatch[1],
        date: parseDate(versionMatch[2]),
      }
      currentChanges = []
    } else if (currentEntry && line.trim().startsWith('-')) {
      // This is a change entry
      const changeText = line.trim().substring(1).trim()
      if (changeText) {
        currentChanges.push(changeText)
      }
    } else if (currentEntry && line.trim().startsWith('*')) {
      // Alternative bullet format
      const changeText = line.trim().substring(1).trim()
      if (changeText) {
        currentChanges.push(changeText)
      }
    }
  }
  
  // Don't forget the last entry
  if (currentEntry && currentEntry.version) {
    entries.push(createEntry(currentEntry, currentChanges))
  }
  
  return entries
}

function createEntry(
  partial: Partial<ChangelogEntry>,
  changes: string[]
): ChangelogEntry {
  const changesText = changes.join(' ').toLowerCase()
  
  return {
    version: partial.version!,
    date: partial.date || null,
    changes: changes,
    isBreaking: changes.some(c => isBreakingChange(c)) || 
                /breaking|incompatible|deprecated|removed|dropped/i.test(changesText),
    isSecurity: changes.some(c => isSecurityFix(c)) || 
                /security|vulnerability|cve|exploit|fix/i.test(changesText),
    isFeature: changes.some(c => isFeature(c)) || 
               /feature|added|new|support|implement/i.test(changesText),
    isFix: changes.some(c => isBugFix(c)) || 
           /fix|bug|issue|correct|repair/i.test(changesText),
  }
}

function parseDate(dateStr: string | undefined): string | null {
  if (!dateStr) return null
  
  // Try various date formats
  const patterns = [
    /(\d{4}-\d{2}-\d{2})/,                    // 2023-01-15
    /(\d{4}\/\d{2}\/\d{2})/,                    // 2023/01/15
    /(\d{1,2}\/\d{1,2}\/\d{4})/,                // 01/15/2023
    /(\d{1,2}-[A-Za-z]{3}-\d{4})/,             // 15-Jan-2023
    /([A-Za-z]+ \d{1,2},? \d{4})/,              // January 15, 2023
  ]
  
  for (const pattern of patterns) {
    const match = dateStr.match(pattern)
    if (match) {
      return match[1]
    }
  }
  
  return dateStr.trim() || null
}

function isBreakingChange(text: string): boolean {
  const patterns = [
    /breaking\s+change/i,
    /backwards?\s+incompatible/i,
    /deprecated/i,
    /removed\s+support/i,
    /dropped\s+support/i,
    /no\s+longer\s+support/i,
    /api\s+change/i,
    /signature\s+change/i,
    /incompatible/i,
  ]
  return patterns.some(p => p.test(text))
}

function isSecurityFix(text: string): boolean {
  const patterns = [
    /security\s+fix/i,
    /cve-\d+/i,
    /vulnerability/i,
    /exploit/i,
    /xss/i,
    /csrf/i,
    /injection/i,
    /buffer\s+overflow/i,
  ]
  return patterns.some(p => p.test(text))
}

function isFeature(text: string): boolean {
  const patterns = [
    /^added\b/i,
    /^new\b/i,
    /^feature/i,
    /^implement/i,
    /^support/i,
    /^introduce/i,
  ]
  return patterns.some(p => p.test(text))
}

function isBugFix(text: string): boolean {
  const patterns = [
    /^fixed\b/i,
    /^fix\b/i,
    /^bug\s*fix/i,
    /^resolved\b/i,
    /^corrected\b/i,
    /^repair/i,
    /^patch/i,
  ]
  return patterns.some(p => p.test(text))
}

// Generate fallback changelog from PyPI release history
export function generateFallbackChangelog(
  releases: Record<string, ReleaseFile[]>,
  currentVersion: string
): ChangelogData {
  const entries: ChangelogEntry[] = []
  
  const sortedVersions = Object.entries(releases)
    .filter(([version]) => version !== currentVersion)
    .sort(([a], [b]) => compareVersions(b, a))
    .slice(0, 10) // Last 10 versions
  
  for (const [version, files] of sortedVersions) {
    const uploadTime = files[0]?.upload_time
    
    entries.push({
      version,
      date: uploadTime ? new Date(uploadTime).toISOString().split('T')[0] : null,
      changes: [`Version ${version} released`],
      isBreaking: false,
      isSecurity: false,
      isFeature: false,
      isFix: false,
    })
  }
  
  return {
    entries,
    source: 'pypi',
  }
}

// Version comparison helper
function compareVersions(a: string, b: string): number {
  const parseVersion = (v: string): number[] => {
    return v.split(/[.-]/).map(part => {
      const num = parseInt(part, 10)
      return isNaN(num) ? 0 : num
    })
  }
  
  const aParts = parseVersion(a)
  const bParts = parseVersion(b)
  
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aVal = aParts[i] || 0
    const bVal = bParts[i] || 0
    
    if (aVal > bVal) return 1
    if (aVal < bVal) return -1
  }
  
  return 0
}

// License compatibility matrix
const LICENSE_COMPATIBILITY: Record<LicenseType, { compatible: LicenseType[]; incompatible: LicenseType[]; risk: 'low' | 'medium' | 'high' | 'critical' }> = {
  'MIT': {
    compatible: ['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC', 'Unlicense', 'CC0-1.0', 'MPL-2.0'],
    incompatible: ['GPL-2.0', 'GPL-3.0', 'LGPL-2.1', 'LGPL-3.0', 'Proprietary'],
    risk: 'low',
  },
  'Apache-2.0': {
    compatible: ['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC', 'Unlicense', 'CC0-1.0', 'MPL-2.0'],
    incompatible: ['GPL-2.0', 'GPL-3.0', 'LGPL-2.1', 'LGPL-3.0', 'Proprietary'],
    risk: 'low',
  },
  'BSD-2-Clause': {
    compatible: ['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC', 'Unlicense', 'CC0-1.0'],
    incompatible: ['GPL-2.0', 'GPL-3.0', 'LGPL-2.1', 'LGPL-3.0', 'Proprietary'],
    risk: 'low',
  },
  'BSD-3-Clause': {
    compatible: ['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC', 'Unlicense', 'CC0-1.0'],
    incompatible: ['GPL-2.0', 'GPL-3.0', 'LGPL-2.1', 'LGPL-3.0', 'Proprietary'],
    risk: 'low',
  },
  'GPL-2.0': {
    compatible: ['GPL-2.0', 'GPL-3.0', 'LGPL-2.1', 'LGPL-3.0', 'CC0-1.0', 'Unlicense'],
    incompatible: ['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'MPL-2.0', 'ISC', 'Proprietary'],
    risk: 'critical',
  },
  'GPL-3.0': {
    compatible: ['GPL-3.0', 'LGPL-3.0', 'CC0-1.0', 'Unlicense'],
    incompatible: ['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'GPL-2.0', 'LGPL-2.1', 'MPL-2.0', 'ISC', 'Proprietary'],
    risk: 'critical',
  },
  'LGPL-2.1': {
    compatible: ['LGPL-2.1', 'LGPL-3.0', 'GPL-2.0', 'GPL-3.0', 'CC0-1.0', 'Unlicense'],
    incompatible: ['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'MPL-2.0', 'ISC', 'Proprietary'],
    risk: 'high',
  },
  'LGPL-3.0': {
    compatible: ['LGPL-3.0', 'GPL-3.0', 'CC0-1.0', 'Unlicense'],
    incompatible: ['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'GPL-2.0', 'LGPL-2.1', 'MPL-2.0', 'ISC', 'Proprietary'],
    risk: 'high',
  },
  'MPL-2.0': {
    compatible: ['MPL-2.0', 'MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC', 'Unlicense', 'CC0-1.0'],
    incompatible: ['GPL-2.0', 'GPL-3.0', 'LGPL-2.1', 'LGPL-3.0', 'Proprietary'],
    risk: 'medium',
  },
  'ISC': {
    compatible: ['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC', 'Unlicense', 'CC0-1.0'],
    incompatible: ['GPL-2.0', 'GPL-3.0', 'LGPL-2.1', 'LGPL-3.0', 'Proprietary'],
    risk: 'low',
  },
  'Unlicense': {
    compatible: ['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC', 'Unlicense', 'CC0-1.0', 'GPL-2.0', 'GPL-3.0', 'LGPL-2.1', 'LGPL-3.0', 'MPL-2.0'],
    incompatible: ['Proprietary'],
    risk: 'low',
  },
  'CC0-1.0': {
    compatible: ['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC', 'Unlicense', 'CC0-1.0', 'GPL-2.0', 'GPL-3.0', 'LGPL-2.1', 'LGPL-3.0', 'MPL-2.0'],
    incompatible: ['Proprietary'],
    risk: 'low',
  },
  'Proprietary': {
    compatible: ['Proprietary'],
    incompatible: ['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'GPL-2.0', 'GPL-3.0', 'LGPL-2.1', 'LGPL-3.0', 'MPL-2.0', 'ISC', 'Unlicense', 'CC0-1.0'],
    risk: 'critical',
  },
  'Unknown': {
    compatible: [],
    incompatible: [],
    risk: 'medium',
  },
}

export function normalizeLicense(license: string | null): LicenseType {
  if (!license) return 'Unknown'
  
  const normalized = license.toUpperCase().replace(/\s+/g, '-').replace(/-LICENSE$/i, '')
  
  const mapping: Record<string, LicenseType> = {
    'MIT': 'MIT',
    'APACHE-2.0': 'Apache-2.0',
    'APACHE-2': 'Apache-2.0',
    'APACHE': 'Apache-2.0',
    'BSD-2-CLAUSE': 'BSD-2-Clause',
    'BSD-2': 'BSD-2-Clause',
    'BSD-3-CLAUSE': 'BSD-3-Clause',
    'BSD-3': 'BSD-3-Clause',
    'BSD': 'BSD-3-Clause',
    'GPL-2.0': 'GPL-2.0',
    'GPL-2': 'GPL-2.0',
    'GPL-V2': 'GPL-2.0',
    'GPL-3.0': 'GPL-3.0',
    'GPL-3': 'GPL-3.0',
    'GPL-V3': 'GPL-3.0',
    'GPL': 'GPL-3.0',
    'LGPL-2.1': 'LGPL-2.1',
    'LGPL-2': 'LGPL-2.1',
    'LGPL-3.0': 'LGPL-3.0',
    'LGPL-3': 'LGPL-3.0',
    'LGPL': 'LGPL-3.0',
    'MPL-2.0': 'MPL-2.0',
    'MPL-2': 'MPL-2.0',
    'MPL': 'MPL-2.0',
    'ISC': 'ISC',
    'UNLICENSE': 'Unlicense',
    'UNLICENSED': 'Unlicense',
    'CC0': 'CC0-1.0',
    'CC0-1.0': 'CC0-1.0',
    'PUBLIC-DOMAIN': 'Unlicense',
    'PROPRIETARY': 'Proprietary',
    'COMMERCIAL': 'Proprietary',
    'ALL-RIGHTS-RESERVED': 'Proprietary',
  }
  
  return mapping[normalized] || 'Unknown'
}

export function checkLicenseCompatibility(
  projectLicense: string,
  packageLicense: string
): LicenseCompatibility {
  const projectType = normalizeLicense(projectLicense)
  const packageType = normalizeLicense(packageLicense)
  
  if (projectType === 'Unknown' || packageType === 'Unknown') {
    return {
      isCompatible: true, // Unknown = proceed with caution
      projectLicense: projectType,
      packageLicense: packageType,
      risk: 'medium',
      explanation: 'Unknown license compatibility. Please verify manually.',
      requiresSourceDisclosure: false,
      requiresSameLicense: false,
    }
  }
  
  const projectRules = LICENSE_COMPATIBILITY[projectType]
  const isCompatible = projectRules.compatible.includes(packageType)
  const risk = isCompatible ? 'low' : projectRules.risk
  
  const requiresSourceDisclosure = ['GPL-2.0', 'GPL-3.0', 'LGPL-2.1', 'LGPL-3.0', 'MPL-2.0'].includes(packageType)
  const requiresSameLicense = ['GPL-2.0', 'GPL-3.0'].includes(packageType)
  
  let explanation: string
  if (isCompatible) {
    explanation = `${packageType} is compatible with ${projectType}. You can safely use this package.`
  } else if (requiresSameLicense) {
    explanation = `${packageType} requires your project to be licensed under the same terms. This may conflict with your ${projectType} license.`
  } else if (requiresSourceDisclosure) {
    explanation = `${packageType} requires you to disclose your source code if you distribute the software.`
  } else {
    explanation = `${packageType} is not compatible with ${projectType}. Consider an alternative package.`
  }
  
  return {
    isCompatible,
    projectLicense: projectType,
    packageLicense: packageType,
    risk,
    explanation,
    requiresSourceDisclosure,
    requiresSameLicense,
  }
}

// Bundle analysis
export function analyzeBundleStats(
  releases: Record<string, ReleaseFile[]>,
  currentVersion: string
): BundleStats {
  const currentRelease = releases[currentVersion] || []
  
  let totalSize = 0
  let wheelSize = 0
  let sourceSize = 0
  let compressedSize = 0
  let hasTypeStubs = false
  let hasPurePythonWheel = false
  let hasBinaryWheel = false
  const platforms = new Set<string>()
  
  for (const file of currentRelease) {
    totalSize += file.size
    compressedSize += file.size
    
    if (file.packagetype === 'bdist_wheel') {
      wheelSize += file.size
      
      // Check for platform specificity
      if (file.filename.includes('py3-none-any') || file.filename.includes('py2.py3-none-any')) {
        hasPurePythonWheel = true
        platforms.add('universal')
      } else if (file.filename.includes('linux')) {
        hasBinaryWheel = true
        platforms.add('linux')
      } else if (file.filename.includes('macos') || file.filename.includes('darwin')) {
        hasBinaryWheel = true
        platforms.add('macos')
      } else if (file.filename.includes('win') || file.filename.includes('windows')) {
        hasBinaryWheel = true
        platforms.add('windows')
      }
    } else if (file.packagetype === 'sdist') {
      sourceSize = file.size
    }
  }
  
  // Check for type stubs in wheel filenames
  hasTypeStubs = currentRelease.some(f => 
    f.filename.includes('-stubs') || 
    f.filename.includes('_stubs') ||
    f.filename.includes('.stubs')
  )
  
  return {
    totalSize,
    wheelSize,
    sourceSize,
    compressedSize,
    dependencies: 0, // Will be filled separately
    transitiveDeps: 0, // Will be filled separately
    hasTypeStubs,
    hasPurePythonWheel,
    hasBinaryWheel,
    platforms: Array.from(platforms),
  }
}

// Check if package has type stubs
export function hasTypeStubs(releases: Record<string, ReleaseFile[]>, classifiers: string[]): boolean {
  // Check classifiers first
  const hasTypingClassifier = classifiers.some(c => 
    c.includes('Typed') || 
    c.includes('Typing') ||
    c.includes('Type Stubs')
  )
  
  if (hasTypingClassifier) return true
  
  // Check wheel filenames
  for (const versionFiles of Object.values(releases)) {
    for (const file of versionFiles) {
      if (file.filename.includes('-stubs') || 
          file.filename.includes('_stubs') ||
          file.filename.includes('.stubs')) {
        return true
      }
    }
  }
  
  return false
}

// Calculate smart update recommendations
export function calculateUpdateRecommendation(
  currentVersion: string,
  latestVersion: string,
  changelog: ChangelogData
): { 
  breakingChanges: boolean
  securityFixes: boolean
  newFeatures: boolean
  bugFixes: boolean
  riskScore: number
} {
  // Find entries between current and latest version
  const relevantEntries = changelog.entries.filter(entry => {
    const entryVersion = entry.version
    return compareVersions(entryVersion, currentVersion) > 0 && 
           compareVersions(entryVersion, latestVersion) <= 0
  })
  
  const breakingChanges = relevantEntries.some(e => e.isBreaking)
  const securityFixes = relevantEntries.some(e => e.isSecurity)
  const newFeatures = relevantEntries.some(e => e.isFeature)
  const bugFixes = relevantEntries.some(e => e.isFix)
  
  // Calculate risk score
  let riskScore = 0
  if (breakingChanges) riskScore += 50
  if (securityFixes) riskScore -= 30 // Security fixes reduce risk
  if (newFeatures) riskScore += 10
  if (bugFixes) riskScore -= 10
  
  // Version jump penalty
  const currentParts = currentVersion.split('.').map(Number)
  const latestParts = latestVersion.split('.').map(Number)
  const majorDiff = (latestParts[0] || 0) - (currentParts[0] || 0)
  const minorDiff = (latestParts[1] || 0) - (currentParts[1] || 0)
  
  if (majorDiff > 0) riskScore += 30 * majorDiff
  if (minorDiff > 5) riskScore += 10
  
  return {
    breakingChanges,
    securityFixes,
    newFeatures,
    bugFixes,
    riskScore: Math.max(0, Math.min(100, riskScore)),
  }
}