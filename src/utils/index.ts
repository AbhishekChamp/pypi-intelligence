import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null): string {
  if (!date) return 'Unknown'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
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
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

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

/**
 * Format license text - truncate long license text and extract common identifiers
 */
export function formatLicense(license: string | null | undefined): string {
  if (!license || license.length === 0) return 'Unknown'
  
  // If it's a short identifier (less than 50 chars), use it as-is
  if (license.length <= 50) return license
  
  // Check for common license patterns in long text
  const upperLicense = license.toUpperCase()
  
  if (upperLicense.includes('MIT LICENSE')) return 'MIT'
  if (upperLicense.includes('APACHE LICENSE') || upperLicense.includes('APACHE-2')) return 'Apache-2.0'
  if (upperLicense.includes('BSD 3') || upperLicense.includes('BSD-3')) return 'BSD-3-Clause'
  if (upperLicense.includes('BSD 2') || upperLicense.includes('BSD-2')) return 'BSD-2-Clause'
  if (upperLicense.includes('GPL V3') || upperLicense.includes('GPL-3')) return 'GPL-3.0'
  if (upperLicense.includes('GPL V2') || upperLicense.includes('GPL-2')) return 'GPL-2.0'
  if (upperLicense.includes('LGPL')) return 'LGPL'
  if (upperLicense.includes('MOZILLA PUBLIC LICENSE') || upperLicense.includes('MPL')) return 'MPL'
  if (upperLicense.includes('ISC LICENSE')) return 'ISC'
  
  // Truncate very long license text
  return license.substring(0, 47) + '...'
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
