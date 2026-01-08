/**
 * Local Business Detection Algorithm
 * Advanced scoring system to identify and prioritize small, family-owned local businesses
 * Filters out corporate chains, franchises, and large retailers
 * 
 * ALGORITHM COMPONENTS:
 * 1. Chain Detection - Identifies corporate chains using pattern matching
 * 2. Business Size Scoring - Analyzes business characteristics
 * 3. Locality Score - Measures community integration
 * 4. Authenticity Index - Composite score for "localness"
 */

/**
 * Corporate Chain Database
 * List of major chains and franchises to EXCLUDE from local business results
 */
const CORPORATE_CHAINS = [
  // Hotels & Large Chains
  'fairmont', 'trump', 'swissotel', 'royal sonesta', 'four seasons', 'crowne plaza',
  'marriott', 'hilton', 'hyatt', 'sheraton', 'westin', 'doubletree', 'holiday inn',
  
  // Major Retailers
  'target', 'walmart', 'costco', "macy's", 'marshalls', 'nordstrom', 'sears',
  'best buy', 'home depot', "lowe's", 'kohl\'s', 'tj maxx', 'burlington',
  
  // Fast Food & Chain Restaurants
  "mcdonald's", 'burger king', 'wendy\'s', "arby's", 'subway', 'chipotle',
  'panera', 'starbucks', 'dunkin', 'taco bell', 'kfc', 'pizza hut',
  
  // Chain Cafes & Food
  'yolk', 'potbelly', 'jimmy john\'s', 'einstein bros', 'caribou coffee',
  
  // Chain Services
  'la fitness', '24 hour fitness', 'planet fitness', 'anytime fitness',
  'great clips', 'supercuts', 'sport clips', 'fantastic sams',
  'cvs', 'walgreens', 'rite aid',
  
  // Chain Stores
  'barnes & noble', 'books-a-million', 'half price books',
  'ulta beauty', 'sephora', 'sally beauty',
  'petsmart', 'petco',
  
  // Generic indicators
  'hotel', 'resort', 'tower', 'international', 'corporation', 'inc.',
  'llc', 'franchise', 'nationwide', 'multi-location'
];

/**
 * Local Business Indicators
 * Positive signals that a business is locally owned
 */
const LOCAL_INDICATORS = [
  // Family & Local Terms
  'family', 'mom', 'pop', 'local', 'neighborhood', 'community',
  'artisan', 'craft', 'homemade', 'handmade', 'boutique',
  
  // Personal Names (indicates ownership)
  "'s ", "joe's", "maria's", "tony's", "anna's", "mike's",
  
  // Local Descriptors
  'hidden gem', 'authentic', 'original', 'since', 'est.',
  'owned', 'operated', 'independent'
];

/**
 * Chain Detection Score
 * Returns 0-100 score where:
 * - 0 = Definitely a corporate chain (REJECT)
 * - 100 = Definitely local/independent (ACCEPT)
 * 
 * Algorithm weighs multiple factors:
 * - Name matching against chain database
 * - Business type patterns
 * - Description analysis
 */
function calculateChainScore(business) {
  const name = business.name.toLowerCase();
  const description = (business.description || '').toLowerCase();
  const address = (business.address || '').toLowerCase();
  
  let score = 100; // Start assuming local
  
  // MAJOR PENALTIES for chain indicators
  for (const chain of CORPORATE_CHAINS) {
    if (name.includes(chain)) {
      score -= 80; // Severe penalty - likely a chain
      break;
    }
  }
  
  // Check description for chain indicators
  const chainKeywords = ['chain', 'franchise', 'locations', 'nationwide', 'corporation'];
  for (const keyword of chainKeywords) {
    if (description.includes(keyword)) {
      score -= 30;
    }
  }
  
  // BONUS for local indicators
  for (const indicator of LOCAL_INDICATORS) {
    if (name.includes(indicator) || description.includes(indicator)) {
      score += 15;
    }
  }
  
  // Bonus for having unique address patterns (not generic)
  if (!address.includes('suite') && !address.includes('floor')) {
    score += 5;
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Business Size Score
 * Analyzes characteristics to determine if business is "small"
 * 
 * Factors:
 * - Review count (fewer = smaller/newer/local)
 * - Rating variance (more personal attention = local)
 * - Description length and detail (locals tell their story)
 */
function calculateSizeScore(business) {
  let score = 100;
  
  // Chains tend to have LOTS of reviews
  const reviewCount = business.reviewCount || 0;
  if (reviewCount > 100) score -= 40;
  else if (reviewCount > 50) score -= 20;
  else if (reviewCount > 20) score -= 10;
  else if (reviewCount < 5) score += 10; // Very small, likely local
  
  // Check if description is personal/detailed (local) vs generic (chain)
  const descLength = (business.description || '').length;
  if (descLength > 150) score += 10; // Detailed story = local
  if (descLength < 50) score -= 20; // Generic = chain
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Locality Score
 * Measures community integration and local presence
 * 
 * Factors:
 * - Specific neighborhood mentions
 * - Community involvement language
 * - Personal ownership indicators
 */
function calculateLocalityScore(business) {
  const text = `${business.name} ${business.description || ''}`.toLowerCase();
  let score = 50; // Neutral start
  
  // Chicago neighborhood mentions (indicates local knowledge)
  const neighborhoods = [
    'loop', 'gold coast', 'lincoln park', 'wicker park', 'pilsen',
    'hyde park', 'andersonville', 'bucktown', 'logan square', 'bridgeport',
    'chinatown', 'little italy', 'greektown', 'ukrainian village'
  ];
  
  for (const hood of neighborhoods) {
    if (text.includes(hood)) {
      score += 20;
      break;
    }
  }
  
  // Community language
  const communityTerms = [
    'local', 'neighborhood', 'community', 'family-owned',
    'family operated', 'locally sourced', 'chicago-based',
    'independent', 'small batch', 'homemade'
  ];
  
  for (const term of communityTerms) {
    if (text.includes(term)) {
      score += 15;
    }
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * MASTER ALGORITHM: Local Business Authenticity Index (LBAI)
 * 
 * Composite score combining all factors with weighted importance:
 * - Chain Score (50% weight) - Most important: must not be a chain
 * - Size Score (30% weight) - Important: must be small
 * - Locality Score (20% weight) - Nice to have: community integration
 * 
 * STRICT THRESHOLD: Must score >= 75 AND chainScore >= 70 to be considered "local"
 * This ensures we ONLY show small, independent businesses
 * 
 * Formula: LBAI = (ChainScore × 0.5) + (SizeScore × 0.3) + (LocalityScore × 0.2)
 */
function calculateLocalBusinessScore(business) {
  const chainScore = calculateChainScore(business);
  const sizeScore = calculateSizeScore(business);
  const localityScore = calculateLocalityScore(business);
  
  // Weighted composite score
  const lbai = (chainScore * 0.5) + (sizeScore * 0.3) + (localityScore * 0.2);
  
  // STRICT FILTERING: Must have high chain score (not a chain) AND overall high score
  const isLocal = lbai >= 75 && chainScore >= 70;
  
  return {
    overallScore: Math.round(lbai),
    chainScore,
    sizeScore,
    localityScore,
    isLocal: isLocal,
    confidence: lbai >= 85 && chainScore >= 90 ? 'high' : lbai >= 75 && chainScore >= 70 ? 'medium' : 'low'
  };
}

/**
 * Filter businesses to only show local, small businesses
 * Returns only businesses that pass the local business test
 */
function filterLocalBusinesses(businesses) {
  return businesses
    .map(business => ({
      ...business,
      localScore: calculateLocalBusinessScore(business)
    }))
    .filter(business => business.localScore.isLocal)
    .sort((a, b) => b.localScore.overallScore - a.localScore.overallScore);
}

/**
 * Get detailed analysis of why a business was classified as local or chain
 */
function analyzeBusinessClassification(business) {
  const scores = calculateLocalBusinessScore(business);
  
  return {
    business: business.name,
    classification: scores.isLocal ? 'LOCAL BUSINESS ✓' : 'CHAIN/CORPORATE ✗',
    scores: {
      overall: scores.overallScore,
      chainDetection: scores.chainScore,
      businessSize: scores.sizeScore,
      locality: scores.localityScore
    },
    confidence: scores.confidence,
    reasoning: generateReasoning(business, scores)
  };
}

function generateReasoning(business, scores) {
  const reasons = [];
  
  if (scores.chainScore < 50) {
    reasons.push('⚠️ Name matches known corporate chain');
  } else if (scores.chainScore > 80) {
    reasons.push('✓ No chain indicators found');
  }
  
  if (scores.sizeScore > 70) {
    reasons.push('✓ Small review count suggests local business');
  } else if (scores.sizeScore < 50) {
    reasons.push('⚠️ High review volume typical of chains');
  }
  
  if (scores.localityScore > 70) {
    reasons.push('✓ Strong community/local language');
  }
  
  return reasons;
}

module.exports = {
  calculateLocalBusinessScore,
  filterLocalBusinesses,
  analyzeBusinessClassification,
  calculateChainScore,
  calculateSizeScore,
  calculateLocalityScore
};
