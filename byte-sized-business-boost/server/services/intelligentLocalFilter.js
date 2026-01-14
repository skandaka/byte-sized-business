/**
 * Intelligent Local Business Filter
 * Advanced algorithm to identify truly local, small, family-owned businesses
 * Filters out chains, franchises, hotels, and corporate establishments
 */

/**
 * Comprehensive chain/franchise/corporate detection system
 */

// Known corporate chains and franchises (extensive list)
const KNOWN_CHAINS = new Set([
  // Hotels & Hospitality
  'marriott', 'hilton', 'hyatt', 'holiday inn', 'best western', 'comfort inn',
  'doubletree', 'sheraton', 'westin', 'radisson', 'ramada', 'days inn',
  'la quinta', 'super 8', 'motel 6', 'courtyard', 'residence inn', 'hampton inn',
  'fairfield inn', 'springhill suites', 'towneplace suites', 'aloft', 'w hotel',
  'ritz-carlton', 'four seasons', 'waldorf astoria', 'st. regis', 'intercontinental',
  'crowne plaza', 'ihg', 'wyndham', 'choice hotels', 'red roof inn', 'extended stay',
  'homewood suites', 'embassy suites', 'candlewood suites', 'staybridge suites',

  // Fast Food & Restaurants
  'mcdonalds', "mcdonald's", 'burger king', 'wendy\'s', 'wendys', 'taco bell',
  'kfc', 'pizza hut', 'dominos', "domino's", 'subway', 'starbucks', 'dunkin',
  'chipotle', 'panera', 'panda express', 'chick-fil-a', 'chickfila', 'five guys',
  'shake shack', 'in-n-out', 'whataburger', 'sonic', 'arby\'s', 'arbys',
  'popeyes', 'jimmy johns', 'jersey mikes', 'firehouse subs', 'quiznos',
  'papa johns', "papa john's", 'little caesars', 'buffalo wild wings', 'applebees',
  "applebee's", 'chilis', "chili's", 'olive garden', 'red lobster', 'outback',
  'texas roadhouse', 'longhorn steakhouse', 'cracker barrel', 'ihop', 'denny\'s',
  'cheesecake factory', 'california pizza kitchen', 'pf changs', "pf chang's",
  'yard house', 'twin peaks', 'hooters', 'tilted kilt', 'bdubs', 'wing stop',

  // Retail Chains
  'walmart', 'target', 'costco', 'best buy', 'home depot', 'lowes', "lowe's",
  'walgreens', 'cvs', 'rite aid', 'kroger', 'safeway', 'albertsons', 'publix',
  'whole foods', 'trader joes', "trader joe's", 'aldi', '7-eleven', 'circle k',
  'shell', 'exxon', 'chevron', 'bp', 'mobil', 'texaco', 'sunoco',
  'old navy', 'gap', 'banana republic', 'h&m', 'zara', 'forever 21', 'uniqlo',
  'macys', "macy's", 'nordstrom', 'kohls', "kohl's", 'jcpenney', 'sears',
  'dillards', "dillard's", 'neiman marcus', 'saks', 'bloomingdales', "bloomingdale's",

  // Coffee Chains
  'starbucks', 'dunkin', 'dunkin donuts', 'tim hortons', 'peets', "peet's coffee",
  'caribou coffee', 'dutch bros', 'costa coffee', 'second cup',

  // Gyms & Fitness
  'planet fitness', 'la fitness', '24 hour fitness', 'gold\'s gym', 'golds gym',
  'anytime fitness', 'snap fitness', 'crunch fitness', 'equinox', 'lifetime fitness',
  'orangetheory', 'pure barre', 'soulcycle', 'barry\'s bootcamp', 'barrys bootcamp',

  // Banks & Financial
  'bank of america', 'chase bank', 'wells fargo', 'citibank', 'us bank', 'pnc bank',
  'capital one', 'td bank', 'fifth third', 'regions bank', 'suntrust', 'bb&t',

  // Pharmacies
  'cvs', 'walgreens', 'rite aid', 'walmart pharmacy', 'kroger pharmacy',

  // Other Notable Chains
  'amc theaters', 'regal cinemas', 'cinemark', 'tj maxx', 'marshalls', 'ross',
  'dollar tree', 'dollar general', 'family dollar', 'big lots', 'harbor freight',
  'autozone', 'advance auto', 'o\'reilly', "o'reilly auto", 'pep boys', 'napa',
]);

// Corporate/chain indicator words
const CHAIN_INDICATORS = [
  'hotel', 'inn', 'suites', 'lodge', 'resort', 'motel',
  'corporate', 'llc', 'inc', 'corporation', 'group',
  'international', 'worldwide', 'global', 'enterprises',
  'franchise', 'franchisee', 'chain',
];

// Words that indicate a LOCAL business (positive signals)
const LOCAL_INDICATORS = [
  'family', 'owned', 'local', 'neighborhood', 'community',
  'homemade', 'artisan', 'craft', 'boutique', 'indie',
  'mom and pop', 'small batch', 'handcrafted', 'authentic',
  'original', 'established', 'since', 'traditional',
  'house', 'kitchen', 'shop', 'studio', 'parlor',
];

// Google Place types to EXCLUDE (corporate/chain types)
const EXCLUDED_TYPES = new Set([
  'lodging',
  'hotel',
  'car_rental',
  'gas_station',
  'convenience_store',
  'department_store',
  'drugstore',
  'pharmacy',
  'supermarket',
  'bank',
  'atm',
  'airport',
  'train_station',
  'bus_station',
  'transit_station',
  'car_dealer',
  'car_wash',
  'storage',
  'parking',
  'funeral_home',
  'cemetery',
]);

// Google Place types to PREFER (likely local)
const PREFERRED_TYPES = new Set([
  'bakery',
  'book_store',
  'cafe',
  'florist',
  'hair_care',
  'beauty_salon',
  'art_gallery',
  'jewelry_store',
  'bicycle_store',
  'pet_store',
  'liquor_store',
  'home_goods_store',
  'furniture_store',
  'electronics_store',
  'gift_shop',
]);

/**
 * Main filtering function - determines if a business is truly local
 * @param {Object} business - Business object from Google Places
 * @returns {Object} { isLocal: boolean, score: number, reasons: string[] }
 */
function analyzeBusinessLocality(business) {
  const name = (business.name || '').toLowerCase();
  const vicinity = (business.vicinity || '').toLowerCase();
  const types = business.types || [];

  let score = 50; // Start neutral
  const reasons = [];
  const warnings = [];

  // HARD FILTERS - Immediate exclusion

  // 1. Check against known chains database
  for (const chain of KNOWN_CHAINS) {
    if (name.includes(chain)) {
      return {
        isLocal: false,
        score: 0,
        reasons: [`Known chain: ${chain}`],
        warnings: []
      };
    }
  }

  // 2. Check for excluded business types
  for (const type of types) {
    if (EXCLUDED_TYPES.has(type)) {
      return {
        isLocal: false,
        score: 0,
        reasons: [`Excluded type: ${type}`],
        warnings: []
      };
    }
  }

  // 3. Filter out anything with 1000+ reviews (likely chain/corporate)
  if (business.user_ratings_total > 1000) {
    score -= 30;
    warnings.push('High review count suggests chain (1000+)');
  }

  // POSITIVE SIGNALS - Boost local score

  // 4. Check for local indicator words in name
  for (const indicator of LOCAL_INDICATORS) {
    if (name.includes(indicator)) {
      score += 20;
      reasons.push(`Local indicator: "${indicator}"`);
    }
  }

  // 5. Check for preferred business types
  for (const type of types) {
    if (PREFERRED_TYPES.has(type)) {
      score += 15;
      reasons.push(`Preferred type: ${type}`);
    }
  }

  // 6. Name patterns that suggest local
  if (name.includes("'s ") || name.includes("s' ")) {
    score += 10;
    reasons.push('Possessive name (family-owned pattern)');
  }

  // 7. Address/vicinity analysis
  if (vicinity && !vicinity.includes('suite') && !vicinity.includes('floor')) {
    score += 5;
    reasons.push('Street-level business');
  }

  // NEGATIVE SIGNALS - Reduce local score

  // 8. Chain indicator words
  for (const indicator of CHAIN_INDICATORS) {
    if (name.includes(indicator)) {
      score -= 15;
      warnings.push(`Chain indicator: "${indicator}"`);
    }
  }

  // 9. Too generic/corporate name
  if (name.split(' ').length < 2) {
    score -= 5;
    warnings.push('Very short name (may be chain)');
  }

  // 10. All caps name (corporate style)
  if (business.name === business.name.toUpperCase() && business.name.length > 5) {
    score -= 10;
    warnings.push('All caps name (corporate style)');
  }

  // 11. Rating is TOO perfect (possibly new franchise)
  if (business.rating === 5.0 && business.user_ratings_total < 10) {
    score -= 5;
    warnings.push('Suspiciously perfect rating');
  }

  // FINAL DECISION
  const isLocal = score >= 40; // Threshold for "local enough"

  return {
    isLocal,
    score,
    reasons,
    warnings,
  };
}

/**
 * Filter an array of businesses to only local ones
 * @param {Array} businesses - Array of business objects
 * @returns {Array} Filtered array of local businesses
 */
function filterLocalBusinesses(businesses) {
  return businesses
    .map(business => ({
      ...business,
      localityAnalysis: analyzeBusinessLocality(business),
    }))
    .filter(business => business.localityAnalysis.isLocal)
    .sort((a, b) => b.localityAnalysis.score - a.localityAnalysis.score);
}

/**
 * Get better search queries for small local businesses
 * @returns {Array} Array of search queries to use
 */
function getLocalBusinessQueries() {
  return [
    'small business',
    'family restaurant',
    'local cafe',
    'independent bookstore',
    'neighborhood shop',
    'boutique',
    'local bakery',
    'family owned',
    'mom and pop',
  ];
}

module.exports = {
  analyzeBusinessLocality,
  filterLocalBusinesses,
  getLocalBusinessQueries,
  KNOWN_CHAINS,
  EXCLUDED_TYPES,
  PREFERRED_TYPES,
};
