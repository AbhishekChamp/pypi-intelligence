import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper to validate if a date is valid
export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime())
}

export function formatDate(date: Date | string | null): string {
  if (!date) return 'Unknown'
  
  const d = typeof date === 'string' ? new Date(date) : date
  
  if (!isValidDate(d)) {
    console.warn('Invalid date provided to formatDate:', date)
    return 'Invalid date'
  }
  
  try {
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch (error) {
    console.warn('Error formatting date:', error)
    return 'Unknown'
  }
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M'
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'k'
  }
  return num.toString()
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function timeAgo(date: Date | string | null): string {
  if (!date) return 'Unknown'
  
  const d = typeof date === 'string' ? new Date(date) : date
  
  if (!isValidDate(d)) {
    console.warn('Invalid date provided to timeAgo:', date)
    return 'Unknown'
  }
  
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diffInSeconds < 0) return 'In the future'
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
  return `${Math.floor(diffInSeconds / 31536000)} years ago`
}

export function parsePythonVersion(classifiers: string[]): string[] {
  const versions: string[] = []
  const versionRegex = /Programming Language :: Python :: (\d+\.\d+)/

  classifiers.forEach(classifier => {
    const match = classifier.match(versionRegex)
    if (match && !versions.includes(match[1])) {
      versions.push(match[1])
    }
  })

  return versions.sort((a, b) => {
    const [aMajor, aMinor] = a.split('.').map(Number)
    const [bMajor, bMinor] = b.split('.').map(Number)
    if (aMajor !== bMajor) return aMajor - bMajor
    return aMinor - bMinor
  })
}

export function extractMaintainers(info: {
  author?: string | null
  author_email?: string | null
  maintainer?: string | null
  maintainer_email?: string | null
}): string[] {
  const maintainers = new Set<string>()

  // Try maintainer field first
  if (info.maintainer) {
    info.maintainer.split(',').forEach(m => {
      const name = parseNameFromString(m.trim())
      if (name) maintainers.add(name)
    })
  }
  
  // Fallback to maintainer_email
  if (info.maintainer_email) {
    const name = parseNameFromString(info.maintainer_email.trim())
    if (name) maintainers.add(name)
  }
  
  // Fallback to author field
  if (info.author) {
    info.author.split(',').forEach(a => {
      const name = parseNameFromString(a.trim())
      if (name) maintainers.add(name)
    })
  }
  
  // Last fallback: parse author_email
  if (info.author_email && maintainers.size === 0) {
    const name = parseNameFromString(info.author_email.trim())
    if (name) maintainers.add(name)
  }

  return Array.from(maintainers).filter(m => m.length > 0)
}

/**
 * Parse a name from various formats:
 * - "John Doe" -> "John Doe"
 * - "John Doe <john@example.com>" -> "John Doe"
 * - "The Team <team@example.com>" -> "The Team"
 * - "<john@example.com>" -> "john@example.com"
 * - "john@example.com" -> "john@example.com"
 */
function parseNameFromString(str: string): string | null {
  if (!str || str.length === 0) return null
  
  // Try to extract name from "Name <email>" format
  const match = str.match(/^([^<]+)</)
  if (match) {
    const name = match[1].trim()
    if (name && name.length > 0) {
      return name
    }
  }
  
  // If it's just an email without name, return the email
  if (str.includes('@') && !str.includes('<')) {
    return str.trim()
  }
  
  // Return the whole string if it doesn't match email patterns
  return str.trim()
}

export function calculateTrendPercentage(
  current: number,
  previous: number
): { trend: 'up' | 'down' | 'stable'; percentage: number } {
  if (previous === 0) return { trend: 'stable', percentage: 0 }
  const percentage = ((current - previous) / previous) * 100
  const trend = percentage > 5 ? 'up' : percentage < -5 ? 'down' : 'stable'
  return { trend, percentage: Math.abs(percentage) }
}

// SPDX License identifiers mapping
const SPDX_LICENSES: Record<string, string> = {
  'MIT': 'MIT',
  'APACHE-2.0': 'Apache-2.0',
  'APACHE-2': 'Apache-2.0',
  'BSD-3-CLAUSE': 'BSD-3-Clause',
  'BSD-3': 'BSD-3-Clause',
  'BSD-2-CLAUSE': 'BSD-2-Clause',
  'BSD-2': 'BSD-2-Clause',
  'GPL-3.0': 'GPL-3.0',
  'GPL-3.0-ONLY': 'GPL-3.0',
  'GPL-3': 'GPL-3.0',
  'GPL-2.0': 'GPL-2.0',
  'GPL-2.0-ONLY': 'GPL-2.0',
  'GPL-2': 'GPL-2.0',
  'LGPL-3.0': 'LGPL-3.0',
  'LGPL-2.1': 'LGPL-2.1',
  'MPL-2.0': 'MPL-2.0',
  'ISC': 'ISC',
  'UNLICENSE': 'Unlicense',
  'CC0-1.0': 'CC0-1.0',
  'ZLIB': 'Zlib',
  'BSL-1.0': 'BSL-1.0',
  'POSTGRESQL': 'PostgreSQL',
  'OFL-1.1': 'OFL-1.1',
  'NCSA': 'NCSA',
  'EUPL-1.2': 'EUPL-1.2',
  'AGPL-3.0': 'AGPL-3.0',
  'AGPL-3': 'AGPL-3.0',
}

// License classifier to SPDX mapping
const CLASSIFIER_TO_SPDX: Record<string, string> = {
  'License :: OSI Approved :: MIT License': 'MIT',
  'License :: OSI Approved :: Apache Software License': 'Apache-2.0',
  'License :: OSI Approved :: BSD License': 'BSD',
  'License :: OSI Approved :: GNU General Public License v3 (GPLv3)': 'GPL-3.0',
  'License :: OSI Approved :: GNU General Public License v2 (GPLv2)': 'GPL-2.0',
  'License :: OSI Approved :: GNU Lesser General Public License v3 (LGPLv3)': 'LGPL-3.0',
  'License :: OSI Approved :: GNU Lesser General Public License v2 or later (LGPLv2+)': 'LGPL-2.1',
  'License :: OSI Approved :: Mozilla Public License 2.0 (MPL 2.0)': 'MPL-2.0',
  'License :: OSI Approved :: ISC License (ISCL)': 'ISC',
  'License :: Public Domain': 'Public Domain',
  'License :: OSI Approved :: The Unlicense (Unlicense)': 'Unlicense',
  'License :: CC0 1.0 Universal (CC0 1.0) Public Domain Dedication': 'CC0-1.0',
  'License :: OSI Approved :: zlib/libpng License': 'Zlib',
  'License :: OSI Approved :: Boost Software License 1.0 (BSL-1.0)': 'BSL-1.0',
  'License :: OSI Approved :: PostgreSQL License': 'PostgreSQL',
  'License :: OSI Approved :: SIL Open Font License 1.1 (OFL-1.1)': 'OFL-1.1',
  'License :: OSI Approved :: University of Illinois/NCSA Open Source License': 'NCSA',
  'License :: OSI Approved :: European Union Public Licence 1.2 (EUPL 1.2)': 'EUPL-1.2',
  'License :: OSI Approved :: GNU Affero General Public License v3': 'AGPL-3.0',
}

/**
 * Extract license from classifiers
 */
function extractLicenseFromClassifiers(classifiers: string[]): string | null {
  for (const classifier of classifiers) {
    const spdx = CLASSIFIER_TO_SPDX[classifier]
    if (spdx) return spdx
  }
  return null
}

/**
 * Format license from legacy license field
 */
function formatLegacyLicense(license: string): string {
  // If it's a short SPDX-like identifier, use it as-is
  if (license.length <= 20) {
    const upper = license.toUpperCase()
    const mapped = SPDX_LICENSES[upper]
    if (mapped) return mapped
    return license
  }
  
  // Check for common license patterns in long text
  const upperLicense = license.toUpperCase()
  
  if (upperLicense.includes('MIT LICENSE') || upperLicense === 'MIT') return 'MIT'
  if (upperLicense.includes('APACHE LICENSE') || upperLicense.includes('APACHE 2')) return 'Apache-2.0'
  if (upperLicense.includes('APACHE-2')) return 'Apache-2.0'
  if (upperLicense.includes('BSD 3') || upperLicense.includes('BSD-3') || upperLicense.includes('BSD LICENSE')) return 'BSD-3-Clause'
  if (upperLicense.includes('BSD 2') || upperLicense.includes('BSD-2')) return 'BSD-2-Clause'
  if (upperLicense.includes('GPL V3') || upperLicense.includes('GPL-3') || upperLicense.includes('GPL VERSION 3')) return 'GPL-3.0'
  if (upperLicense.includes('GPL V2') || upperLicense.includes('GPL-2') || upperLicense.includes('GPL VERSION 2')) return 'GPL-2.0'
  if (upperLicense.includes('LGPL')) return 'LGPL-2.1'
  if (upperLicense.includes('MOZILLA PUBLIC LICENSE') || upperLicense.includes('MPL 2')) return 'MPL-2.0'
  if (upperLicense.includes('ISC LICENSE') || upperLicense === 'ISC') return 'ISC'
  if (upperLicense.includes('UNLICENSE')) return 'Unlicense'
  if (upperLicense.includes('PUBLIC DOMAIN')) return 'Public Domain'
  
  // Truncate very long license text
  if (license.length > 50) {
    return license.substring(0, 47) + '...'
  }
  
  return license
}

/**
 * Format license text - extracts license from all available sources
 * Priority: license_expression > license field > classifiers
 */
export function formatLicense(
  license: string | null | undefined,
  licenseExpression?: string | null | undefined,
  classifiers?: string[] | null | undefined
): string {
  // 1. First priority: license_expression (SPDX format, most reliable)
  if (licenseExpression && licenseExpression.length > 0) {
    const upperExpr = licenseExpression.toUpperCase()
    const mapped = SPDX_LICENSES[upperExpr]
    if (mapped) return mapped
    return licenseExpression
  }
  
  // 2. Second priority: legacy license field
  if (license && license.length > 0) {
    return formatLegacyLicense(license)
  }
  
  // 3. Third priority: extract from classifiers
  if (classifiers && classifiers.length > 0) {
    const fromClassifiers = extractLicenseFromClassifiers(classifiers)
    if (fromClassifiers) return fromClassifiers
  }
  
  return 'Unknown'
}

/**
 * Extract author name from author field or author_email
 * Handles formats like:
 * - author: "John Doe", author_email: null -> "John Doe"
 * - author: null, author_email: "John Doe <john@example.com>" -> "John Doe"
 * - author: null, author_email: "john@example.com" -> "john@example.com"
 */
export function extractAuthorName(info: {
  author?: string | null
  author_email?: string | null
}): string | null {
  // First try the author field
  if (info.author && info.author.trim().length > 0) {
    return info.author.trim()
  }
  
  // Fall back to parsing author_email
  if (info.author_email && info.author_email.trim().length > 0) {
    const email = info.author_email.trim()
    
    // Try to extract name from "Name <email>" format
    const match = email.match(/^([^<]+)</)
    if (match) {
      const name = match[1].trim()
      if (name.length > 0) {
        return name
      }
    }
    
    // If it's just an email, return it
    return email
  }
  
  return null
}

// Re-export package name utilities
export {
  POPULAR_PACKAGES,
  PACKAGE_ALIASES,
  findSimilarPackages,
  getPackageSuggestions,
  isLikelyTypo,
  getCorrectedPackageName,
} from './packageNames'
