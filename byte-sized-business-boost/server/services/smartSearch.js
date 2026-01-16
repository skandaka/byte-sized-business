/**
 * Smart Search Service
 * Advanced search algorithm that understands context, synonyms, and related terms
 * Expands user queries to find relevant businesses even with indirect matches
 */

// ========== FOOD & CUISINE MAPPINGS ==========
const FOOD_TO_CUISINES = {
  // Foods → Restaurant types that serve them
  'pizza': ['pizzeria', 'italian', 'pizza', 'trattoria', 'neapolitan'],
  'pasta': ['italian', 'trattoria', 'pasta', 'mediterranean'],
  'sushi': ['japanese', 'sushi', 'asian', 'ramen'],
  'ramen': ['japanese', 'ramen', 'noodle', 'asian'],
  'tacos': ['mexican', 'taqueria', 'tex-mex', 'latin'],
  'burritos': ['mexican', 'taqueria', 'tex-mex', 'burrito'],
  'burger': ['burger', 'american', 'grill', 'diner', 'pub'],
  'burgers': ['burger', 'american', 'grill', 'diner', 'pub'],
  'steak': ['steakhouse', 'grill', 'american', 'chophouse'],
  'bbq': ['barbecue', 'bbq', 'smokehouse', 'grill', 'southern'],
  'barbecue': ['barbecue', 'bbq', 'smokehouse', 'grill', 'southern'],
  'wings': ['wings', 'sports bar', 'pub', 'american', 'buffalo'],
  'fried chicken': ['chicken', 'southern', 'soul food', 'american'],
  'pho': ['vietnamese', 'pho', 'asian', 'noodle'],
  'curry': ['indian', 'thai', 'curry', 'asian'],
  'naan': ['indian', 'curry', 'tandoori'],
  'dim sum': ['chinese', 'dim sum', 'cantonese', 'asian'],
  'dumplings': ['chinese', 'dumpling', 'asian', 'dim sum'],
  'pad thai': ['thai', 'asian', 'noodle'],
  'falafel': ['mediterranean', 'middle eastern', 'lebanese', 'greek'],
  'gyro': ['greek', 'mediterranean', 'middle eastern'],
  'shawarma': ['middle eastern', 'mediterranean', 'lebanese'],
  'bagel': ['bagel', 'deli', 'bakery', 'jewish'],
  'sandwich': ['deli', 'sandwich', 'sub', 'cafe'],
  'sub': ['sub', 'sandwich', 'deli', 'hoagie'],
  'soup': ['soup', 'cafe', 'deli', 'bistro'],
  'salad': ['salad', 'healthy', 'cafe', 'mediterranean'],
  'seafood': ['seafood', 'fish', 'oyster', 'crab', 'lobster'],
  'lobster': ['seafood', 'lobster', 'new england'],
  'crab': ['seafood', 'crab', 'maryland'],
  'fish': ['seafood', 'fish', 'fish and chips'],
  'croissant': ['bakery', 'french', 'cafe', 'patisserie'],
  'pastry': ['bakery', 'patisserie', 'cafe', 'dessert'],
  'donut': ['donut', 'bakery', 'breakfast', 'coffee'],
  'doughnut': ['donut', 'bakery', 'breakfast', 'coffee'],
  'ice cream': ['ice cream', 'gelato', 'frozen yogurt', 'dessert'],
  'gelato': ['gelato', 'ice cream', 'italian', 'dessert'],
  'cake': ['bakery', 'cake', 'dessert', 'patisserie'],
  'pie': ['bakery', 'pie', 'dessert', 'diner'],
  'pancakes': ['breakfast', 'diner', 'brunch', 'pancake'],
  'waffles': ['breakfast', 'waffle', 'brunch', 'belgian'],
  'eggs': ['breakfast', 'brunch', 'diner', 'cafe'],
  'brunch': ['brunch', 'breakfast', 'cafe', 'bistro'],
  'breakfast': ['breakfast', 'brunch', 'diner', 'cafe'],
};

// ========== CUISINE SYNONYMS & EXPANSIONS ==========
const CUISINE_EXPANSIONS = {
  'italian': ['italian', 'pizza', 'pasta', 'trattoria', 'ristorante', 'mediterranean'],
  'mexican': ['mexican', 'taqueria', 'tex-mex', 'latin', 'cantina'],
  'chinese': ['chinese', 'dim sum', 'cantonese', 'szechuan', 'asian'],
  'japanese': ['japanese', 'sushi', 'ramen', 'izakaya', 'asian'],
  'thai': ['thai', 'asian', 'pad thai'],
  'vietnamese': ['vietnamese', 'pho', 'banh mi', 'asian'],
  'indian': ['indian', 'curry', 'tandoori', 'masala'],
  'greek': ['greek', 'mediterranean', 'gyro'],
  'french': ['french', 'bistro', 'brasserie', 'patisserie'],
  'korean': ['korean', 'bbq', 'asian', 'kimchi'],
  'mediterranean': ['mediterranean', 'greek', 'lebanese', 'turkish', 'falafel'],
  'american': ['american', 'burger', 'grill', 'diner', 'comfort'],
  'southern': ['southern', 'soul food', 'comfort', 'bbq', 'cajun'],
  'asian': ['asian', 'chinese', 'japanese', 'thai', 'vietnamese', 'korean'],
};

// ========== SERVICE TYPE MAPPINGS ==========
const SERVICE_SYNONYMS = {
  // Retail
  'clothing': ['clothing', 'apparel', 'fashion', 'boutique', 'clothes', 'wear'],
  'clothes': ['clothing', 'apparel', 'fashion', 'boutique', 'clothes', 'wear'],
  'shoes': ['shoes', 'footwear', 'sneakers', 'boots', 'shoe store'],
  'books': ['bookstore', 'books', 'bookshop', 'reading'],
  'flowers': ['florist', 'flowers', 'floral', 'flower shop'],
  'gifts': ['gift shop', 'gifts', 'presents', 'souvenirs'],
  'jewelry': ['jewelry', 'jeweler', 'jewellery', 'accessories'],
  'toys': ['toy store', 'toys', 'games', 'hobby'],
  'electronics': ['electronics', 'tech', 'computer', 'phone'],
  'furniture': ['furniture', 'home', 'decor', 'interior'],
  'antiques': ['antique', 'vintage', 'antiques', 'collectibles'],
  
  // Services
  'haircut': ['barber', 'salon', 'hair', 'haircut', 'stylist'],
  'hair': ['barber', 'salon', 'hair', 'haircut', 'stylist'],
  'barber': ['barber', 'barbershop', 'haircut', 'men\'s grooming'],
  'salon': ['salon', 'beauty', 'hair', 'spa', 'nail'],
  'nails': ['nail salon', 'nails', 'manicure', 'pedicure'],
  'spa': ['spa', 'massage', 'wellness', 'relaxation'],
  'massage': ['massage', 'spa', 'therapy', 'wellness'],
  'gym': ['gym', 'fitness', 'workout', 'exercise', 'health club'],
  'fitness': ['gym', 'fitness', 'workout', 'training', 'crossfit'],
  'yoga': ['yoga', 'pilates', 'wellness', 'studio'],
  'dentist': ['dentist', 'dental', 'orthodontist'],
  'doctor': ['doctor', 'clinic', 'medical', 'physician'],
  'vet': ['veterinarian', 'vet', 'animal', 'pet clinic'],
  'pet': ['pet store', 'pet', 'animal', 'dog', 'cat'],
  'auto': ['auto', 'car', 'mechanic', 'automotive', 'repair'],
  'car': ['auto', 'car', 'mechanic', 'automotive', 'detailing'],
  'laundry': ['laundry', 'dry cleaning', 'cleaners', 'laundromat'],
  'cleaning': ['cleaning', 'dry cleaning', 'laundry', 'cleaners'],
  
  // Entertainment
  'movie': ['theater', 'cinema', 'movie', 'film'],
  'music': ['music', 'concert', 'live music', 'venue', 'record'],
  'art': ['art gallery', 'gallery', 'art', 'museum'],
  'bowling': ['bowling', 'entertainment', 'arcade'],
  'arcade': ['arcade', 'games', 'entertainment', 'fun'],
  'escape room': ['escape room', 'entertainment', 'puzzle'],
  
  // Food & Drink
  'coffee': ['coffee', 'cafe', 'coffeehouse', 'espresso', 'roaster'],
  'tea': ['tea', 'tea house', 'cafe', 'bubble tea', 'boba'],
  'boba': ['boba', 'bubble tea', 'tea', 'asian'],
  'beer': ['brewery', 'beer', 'pub', 'taproom', 'craft beer'],
  'wine': ['wine bar', 'wine', 'winery', 'vineyard'],
  'cocktail': ['cocktail', 'bar', 'lounge', 'speakeasy'],
  'bar': ['bar', 'pub', 'tavern', 'lounge', 'sports bar'],
  'bakery': ['bakery', 'bread', 'pastry', 'cake', 'patisserie'],
  'deli': ['deli', 'delicatessen', 'sandwich', 'sub'],
  'cafe': ['cafe', 'coffee', 'bistro', 'coffeehouse'],
};

// ========== COMMON MISSPELLINGS & VARIATIONS ==========
const SPELLING_CORRECTIONS = {
  'resturant': 'restaurant',
  'restraunt': 'restaurant',
  'restaraunt': 'restaurant',
  'resteraunt': 'restaurant',
  'coffe': 'coffee',
  'cofee': 'coffee',
  'expresso': 'espresso',
  'sandwhich': 'sandwich',
  'sandwitch': 'sandwich',
  'buger': 'burger',
  'burgar': 'burger',
  'chineese': 'chinese',
  'japaneese': 'japanese',
  'italain': 'italian',
  'mexcian': 'mexican',
  'breakfest': 'breakfast',
  'breakfat': 'breakfast',
  'deserts': 'desserts',
  'desert': 'dessert',
  'barbar': 'barber',
  'saloon': 'salon',
  'jewerley': 'jewelry',
  'jewlery': 'jewelry',
};

// ========== CATEGORY KEYWORDS ==========
const CATEGORY_KEYWORDS = {
  'Food': ['restaurant', 'cafe', 'food', 'eat', 'dining', 'cuisine', 'kitchen', 'bistro', 'grill', 'bakery', 'deli', 'pizzeria', 'taqueria'],
  'Retail': ['shop', 'store', 'boutique', 'market', 'mall', 'retail', 'buy', 'shopping'],
  'Services': ['salon', 'barber', 'spa', 'repair', 'cleaning', 'service', 'dentist', 'doctor', 'clinic', 'mechanic'],
  'Entertainment': ['theater', 'cinema', 'museum', 'gallery', 'bowling', 'arcade', 'entertainment', 'fun', 'games'],
  'Health': ['gym', 'fitness', 'yoga', 'wellness', 'health', 'medical', 'clinic', 'therapy'],
  'Other': [],
};

/**
 * Main smart search function
 * Expands a user query into multiple related search terms
 * @param {string} query - Original user search query
 * @returns {Object} - Expanded search terms and metadata
 */
function expandSearchQuery(query) {
  if (!query || typeof query !== 'string') {
    return { original: '', expanded: [], googleQueries: [], category: null };
  }

  const originalQuery = query.trim().toLowerCase();
  
  // Correct common misspellings
  let correctedQuery = originalQuery;
  for (const [misspelling, correction] of Object.entries(SPELLING_CORRECTIONS)) {
    correctedQuery = correctedQuery.replace(new RegExp(misspelling, 'gi'), correction);
  }

  const expanded = new Set([correctedQuery]);
  let inferredCategory = null;

  // Check if it's a food item → expand to cuisines
  if (FOOD_TO_CUISINES[correctedQuery]) {
    FOOD_TO_CUISINES[correctedQuery].forEach(term => expanded.add(term));
    inferredCategory = 'Food';
  }

  // Check if it's a cuisine → expand to related terms
  if (CUISINE_EXPANSIONS[correctedQuery]) {
    CUISINE_EXPANSIONS[correctedQuery].forEach(term => expanded.add(term));
    inferredCategory = 'Food';
  }

  // Check if it's a service type
  if (SERVICE_SYNONYMS[correctedQuery]) {
    SERVICE_SYNONYMS[correctedQuery].forEach(term => expanded.add(term));
    // Infer category from service type
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (SERVICE_SYNONYMS[correctedQuery].some(term => keywords.includes(term))) {
        inferredCategory = cat;
        break;
      }
    }
  }

  // Multi-word query handling - check each word
  const words = correctedQuery.split(/\s+/);
  if (words.length > 1) {
    words.forEach(word => {
      if (FOOD_TO_CUISINES[word]) {
        FOOD_TO_CUISINES[word].forEach(term => expanded.add(term));
        inferredCategory = inferredCategory || 'Food';
      }
      if (CUISINE_EXPANSIONS[word]) {
        CUISINE_EXPANSIONS[word].forEach(term => expanded.add(term));
        inferredCategory = inferredCategory || 'Food';
      }
      if (SERVICE_SYNONYMS[word]) {
        SERVICE_SYNONYMS[word].forEach(term => expanded.add(term));
      }
    });
  }

  // Determine category from query if not already set
  if (!inferredCategory) {
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(kw => correctedQuery.includes(kw) || expanded.has(kw))) {
        inferredCategory = cat;
        break;
      }
    }
  }

  // Build Google search queries (prioritized, specific to general)
  const googleQueries = buildGoogleQueries(correctedQuery, Array.from(expanded), inferredCategory);

  return {
    original: originalQuery,
    corrected: correctedQuery !== originalQuery ? correctedQuery : null,
    expanded: Array.from(expanded),
    googleQueries,
    category: inferredCategory,
  };
}

/**
 * Build optimized Google Places search queries
 * @param {string} query - Corrected query
 * @param {Array} expandedTerms - Expanded search terms
 * @param {string} category - Inferred category
 * @returns {Array} - Array of search queries for Google Places
 */
function buildGoogleQueries(query, expandedTerms, category) {
  const queries = [];
  
  // Primary: Direct query with "local" prefix
  queries.push(`local ${query}`);
  queries.push(query);
  
  // Add expanded term queries (limit to top 3 most relevant)
  const relevantExpanded = expandedTerms
    .filter(term => term !== query)
    .slice(0, 3);
  
  relevantExpanded.forEach(term => {
    queries.push(`local ${term}`);
  });

  // If food category, add specific food establishment queries
  if (category === 'Food') {
    queries.push(`family owned ${query} restaurant`);
    queries.push(`independent ${query}`);
  }

  // Deduplicate while preserving order
  return [...new Set(queries)].slice(0, 6);
}

/**
 * Score how well a business matches the search query
 * Returns a relevance score from 0-100
 * @param {Object} business - Business object
 * @param {Object} searchData - Expanded search data from expandSearchQuery
 * @returns {number} - Relevance score
 */
function scoreBusinessMatch(business, searchData) {
  if (!business || !searchData) return 0;

  const { original, corrected, expanded, category } = searchData;
  const query = corrected || original;
  
  // Normalize business data for comparison
  const name = (business.name || '').toLowerCase();
  const description = (business.description || '').toLowerCase();
  const businessCategory = (business.category || '').toLowerCase();
  const address = (business.address || '').toLowerCase();
  const combined = `${name} ${description} ${businessCategory} ${address}`;

  let score = 0;

  // Exact name match (highest priority)
  if (name.includes(query)) {
    score += 50;
  }

  // Partial word match in name
  const queryWords = query.split(/\s+/);
  queryWords.forEach(word => {
    if (word.length > 2 && name.includes(word)) {
      score += 20;
    }
  });

  // Expanded term matches
  expanded.forEach(term => {
    if (name.includes(term)) {
      score += 15;
    } else if (description.includes(term)) {
      score += 10;
    } else if (combined.includes(term)) {
      score += 5;
    }
  });

  // Category match bonus
  if (category && businessCategory === category.toLowerCase()) {
    score += 10;
  }

  // Cap score at 100
  return Math.min(100, score);
}

/**
 * Filter and sort businesses by search relevance
 * @param {Array} businesses - Array of business objects
 * @param {string} query - User search query
 * @returns {Array} - Filtered and sorted businesses
 */
function filterBySmartSearch(businesses, query) {
  if (!query || !businesses || businesses.length === 0) {
    return businesses;
  }

  const searchData = expandSearchQuery(query);
  
  // Score each business
  const scored = businesses.map(business => ({
    ...business,
    relevanceScore: scoreBusinessMatch(business, searchData),
  }));

  // Filter to those with any relevance
  const relevant = scored.filter(b => b.relevanceScore > 0);

  // If no direct matches, return all with some basic matching
  if (relevant.length === 0) {
    // Fallback: basic substring match on any expanded term
    const fallback = scored.filter(b => {
      const combined = `${b.name} ${b.description} ${b.category}`.toLowerCase();
      return searchData.expanded.some(term => combined.includes(term));
    });
    
    if (fallback.length > 0) {
      return fallback;
    }
    
    // Ultimate fallback: return original list (Google already filtered by query)
    return businesses;
  }

  // Sort by relevance score (highest first)
  return relevant.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Get search suggestions based on partial input
 * @param {string} partial - Partial search input
 * @returns {Array} - Array of suggested search terms
 */
function getSearchSuggestions(partial) {
  if (!partial || partial.length < 2) return [];

  const lower = partial.toLowerCase();
  const suggestions = new Set();

  // Check food items
  Object.keys(FOOD_TO_CUISINES).forEach(food => {
    if (food.startsWith(lower)) suggestions.add(food);
  });

  // Check cuisines
  Object.keys(CUISINE_EXPANSIONS).forEach(cuisine => {
    if (cuisine.startsWith(lower)) suggestions.add(cuisine);
  });

  // Check services
  Object.keys(SERVICE_SYNONYMS).forEach(service => {
    if (service.startsWith(lower)) suggestions.add(service);
  });

  return Array.from(suggestions).slice(0, 5);
}

module.exports = {
  expandSearchQuery,
  scoreBusinessMatch,
  filterBySmartSearch,
  getSearchSuggestions,
  FOOD_TO_CUISINES,
  CUISINE_EXPANSIONS,
  SERVICE_SYNONYMS,
};
