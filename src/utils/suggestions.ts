import type { PyPIPackage } from '@/types'

// Classifier prefixes we care about for matching, in priority order
const CLASSIFIER_PREFIXES = [
  'Framework :: ',
  'Topic :: ',
  'Intended Audience :: ',
  'Environment :: ',
  'Development Status :: ',
]

// Weight for each classifier prefix
const CLASSIFIER_WEIGHTS: Record<string, number> = {
  'Framework :: ': 100,
  'Topic :: ': 80,
  'Intended Audience :: ': 60,
  'Environment :: ': 40,
  'Development Status :: ': 20,
}

/**
 * Extract key classifiers from a package for matching
 * Returns an object with classifier categories and their values
 */
export function extractKeyClassifiers(classifiers: string[]): Map<string, string[]> {
  const keyClassifiers = new Map<string, string[]>()
  
  for (const classifier of classifiers) {
    for (const prefix of CLASSIFIER_PREFIXES) {
      if (classifier.startsWith(prefix)) {
        const category = prefix.replace(' :: ', '').trim()
        if (!keyClassifiers.has(category)) {
          keyClassifiers.set(category, [])
        }
        keyClassifiers.get(category)!.push(classifier)
        break
      }
    }
  }
  
  return keyClassifiers
}

/**
 * Calculate similarity score between two packages based on classifiers
 * Returns a score from 0-1000
 */
export function calculateClassifierSimilarity(
  package1Classifiers: string[],
  package2Classifiers: string[]
): number {
  const classifiers1 = extractKeyClassifiers(package1Classifiers)
  const classifiers2 = extractKeyClassifiers(package2Classifiers)
  
  let score = 0
  let maxPossibleScore = 0
  
  // Calculate score based on shared classifiers
  for (const [category, values1] of classifiers1.entries()) {
    const weight = CLASSIFIER_WEIGHTS[`${category} :: `] || 10
    maxPossibleScore += weight * values1.length
    
    const values2 = classifiers2.get(category)
    if (values2) {
      // Shared classifiers in this category
      for (const classifier of values1) {
        if (values2.includes(classifier)) {
          score += weight
        }
      }
    }
  }
  
  // Also consider categories only in package2
  for (const [category, values2] of classifiers2.entries()) {
    const weight = CLASSIFIER_WEIGHTS[`${category} :: `] || 10
    if (!classifiers1.has(category)) {
      maxPossibleScore += weight * values2.length
    }
  }
  
  // Normalize score to 0-1000 range
  if (maxPossibleScore === 0) return 0
  return Math.round((score / maxPossibleScore) * 1000)
}

/**
 * Check if a package is a framework based on its classifiers
 */
export function isFrameworkPackage(classifiers: string[]): boolean {
  return classifiers.some(c => c.startsWith('Framework :: '))
}

/**
 * Get the primary framework name if it's a framework package
 */
export function getPrimaryFramework(classifiers: string[]): string | null {
  const frameworkClassifier = classifiers.find(c => c.startsWith('Framework :: '))
  if (frameworkClassifier) {
    const parts = frameworkClassifier.split(' :: ')
    return parts[parts.length - 1]
  }
  return null
}

/**
 * Get the primary topic if available
 */
export function getPrimaryTopic(classifiers: string[]): string | null {
  const topicClassifier = classifiers.find(c => c.startsWith('Topic :: '))
  if (topicClassifier) {
    const parts = topicClassifier.split(' :: ')
    return parts.slice(1).join(' :: ')
  }
  return null
}

/**
 * Find similar packages from a list of candidate packages
 * Returns top N matches sorted by classifier similarity
 */
export function findSimilarPackages(
  targetPackage: PyPIPackage,
  candidatePackages: PyPIPackage[],
  maxResults: number = 3
): Array<{ package: PyPIPackage; score: number; sharedClassifiers: string[] }> {
  const targetClassifiers = targetPackage.info.classifiers
  
  // Calculate similarity for each candidate
  const scored = candidatePackages
    .filter(pkg => pkg.info.name.toLowerCase() !== targetPackage.info.name.toLowerCase())
    .map(pkg => {
      const score = calculateClassifierSimilarity(
        targetClassifiers,
        pkg.info.classifiers
      )
      
      // Find shared classifiers
      const sharedClassifiers = targetClassifiers.filter(c => 
        pkg.info.classifiers.includes(c) &&
        CLASSIFIER_PREFIXES.some(prefix => c.startsWith(prefix))
      )
      
      return { package: pkg, score, sharedClassifiers }
    })
    .filter(item => item.score > 0) // Only include if there's some overlap
    .sort((a, b) => b.score - a.score) // Sort by score descending
  
  return scored.slice(0, maxResults)
}

/**
 * Quick check if two packages are comparable (have meaningful classifier overlap)
 */
export function arePackagesComparable(
  package1Classifiers: string[],
  package2Classifiers: string[]
): boolean {
  const score = calculateClassifierSimilarity(package1Classifiers, package2Classifiers)
  return score >= 100 // At least 10% overlap
}
