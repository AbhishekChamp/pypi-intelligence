// Test file for fuzzy matching functionality
import { 
  findSimilarPackages, 
  getPackageSuggestions, 
  isLikelyTypo, 
  getCorrectedPackageName,
  POPULAR_PACKAGES,
  PACKAGE_ALIASES
} from './packageNames'

// Test cases for typo detection
const testCases = [
  // Exact matches (should return empty suggestions)
  { query: 'requests', expectedLength: 0, description: 'Exact match' },
  { query: 'django', expectedLength: 0, description: 'Exact match' },
  
  // Common typos
  { query: 'reqeusts', expectedLength: 1, shouldInclude: 'requests', description: 'requests typo' },
  { query: 'djnago', expectedLength: 1, shouldInclude: 'django', description: 'django typo' },
  { query: 'numy', expectedLength: 1, shouldInclude: 'numpy', description: 'numpy typo' },
  { query: 'pands', expectedLength: 1, shouldInclude: 'pandas', description: 'pandas typo' },
  { query: 'flsk', expectedLength: 1, shouldInclude: 'flask', description: 'flask typo' },
  { query: 'fastpi', expectedLength: 1, shouldInclude: 'fastapi', description: 'fastapi typo' },
  
  // Fuzzy matches
  { query: 'req', expectedLength: 1, shouldInclude: 'requests', description: 'requests prefix' },
  { query: 'djang', expectedLength: 1, shouldInclude: 'django', description: 'django prefix' },
  
  // Aliases
  { query: 'sklearn', expectedLength: 1, shouldInclude: 'scikit-learn', description: 'sklearn alias' },
  { query: 'cv2', expectedLength: 1, shouldInclude: 'opencv-python', description: 'cv2 alias' },
  { query: 'bs4', expectedLength: 1, shouldInclude: 'beautifulsoup4', description: 'bs4 alias' },
]

console.log('Running fuzzy matching tests...\n')

let passed = 0
let failed = 0

testCases.forEach((test, index) => {
  const suggestions = getPackageSuggestions(test.query)
  const success = suggestions.length === test.expectedLength && 
    (!test.shouldInclude || suggestions.includes(test.shouldInclude))
  
  if (success) {
    passed++
    console.log(`✓ Test ${index + 1}: ${test.description}`)
    console.log(`  Query: "${test.query}" → Suggestions: [${suggestions.join(', ')}]`)
  } else {
    failed++
    console.log(`✗ Test ${index + 1}: ${test.description}`)
    console.log(`  Query: "${test.query}"`)
    console.log(`  Expected: ${test.expectedLength} suggestion(s)${test.shouldInclude ? ` including "${test.shouldInclude}"` : ''}`)
    console.log(`  Got: [${suggestions.join(', ')}]`)
  }
  console.log()
})

console.log(`\nResults: ${passed} passed, ${failed} failed`)

// Test isLikelyTypo
console.log('\n\nTesting isLikelyTypo():')
console.log(`isLikelyTypo('requests'): ${isLikelyTypo('requests')}`) // false
console.log(`isLikelyTypo('reqeusts'): ${isLikelyTypo('reqeusts')}`) // true
console.log(`isLikelyTypo('xyzabc'): ${isLikelyTypo('xyzabc')}`) // false (no close matches)

// Test getCorrectedPackageName
console.log('\n\nTesting getCorrectedPackageName():')
console.log(`getCorrectedPackageName('sklearn'): ${getCorrectedPackageName('sklearn')}`) // scikit-learn
console.log(`getCorrectedPackageName('django'): ${getCorrectedPackageName('django')}`) // null (exact match)

// Check popular packages count
console.log(`\n\nTotal popular packages: ${POPULAR_PACKAGES.length}`)
console.log(`Total aliases: ${Object.keys(PACKAGE_ALIASES).length}`)
