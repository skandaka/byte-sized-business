/**
 * Live Business Search Service
 * Dynamically fetches businesses from Google Places API based on user location
 * Now with SMART SEARCH - expands queries to related cuisines, synonyms, and types
 */

const axios = require('axios');
const { filterLocalBusinesses, getLocalBusinessQueries } = require('./intelligentLocalFilter');
const { expandSearchQuery, filterBySmartSearch } = require('./smartSearch');

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACES_API_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
const TEXT_SEARCH_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json';

/**
 * Search for LOCAL, SMALL businesses near a location
 * Uses intelligent filtering to exclude chains/hotels/corporate
 * NEW: Uses SMART SEARCH to expand queries (pizza → Italian restaurants, etc.)
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radiusMiles - Radius in miles
 * @param {string} category - Our category filter (optional)
 * @param {string} searchQuery - User search query (optional)
 * @returns {Promise<Array>} Array of LOCAL businesses only
 */
async function searchLiveBusinesses(lat, lng, radiusMiles = 10, category = null, searchQuery = null) {
  if (!GOOGLE_PLACES_API_KEY) {
    console.warn('⚠️  Google Places API key not configured');
    return [];
  }

  try {
    const radiusMeters = Math.min(radiusMiles * 1609.34, 50000);

    // Use SMART SEARCH to expand user query into related terms
    let searchQueries;
    let smartSearchData = null;
    
    if (searchQuery) {
      smartSearchData = expandSearchQuery(searchQuery);
      searchQueries = smartSearchData.googleQueries;
      
      console.log(`🧠 Smart Search: "${searchQuery}" → [${smartSearchData.expanded.slice(0, 5).join(', ')}]`);
      console.log(`   Google queries: ${searchQueries.join(' | ')}`);
      
      if (smartSearchData.corrected) {
        console.log(`   ✓ Spell-corrected: "${smartSearchData.original}" → "${smartSearchData.corrected}"`);
      }
    } else {
      searchQueries = getSmartSearchQueries(category);
    }

    console.log(`🔍 Searching LOCAL businesses: ${lat},${lng} radius=${radiusMiles}mi`);
    const allResults = [];

    for (const query of searchQueries) {
      const params = {
        query: query,
        location: `${lat},${lng}`,
        radius: radiusMeters,
        key: GOOGLE_PLACES_API_KEY,
      };

      try {
        const response = await axios.get(TEXT_SEARCH_URL, { params, timeout: 5000 });

        if (response.data.status === 'OK') {
          allResults.push(...response.data.results);
        }

        // Be nice to API - small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        console.error(`   Error with query "${query}":`, err.message);
      }
    }

    if (allResults.length === 0) {
      console.log('   No businesses found');
      return [];
    }

    // Remove duplicates by place_id
    const uniquePlaces = [];
    const seenIds = new Set();
    for (const place of allResults) {
      if (!seenIds.has(place.place_id)) {
        seenIds.add(place.place_id);
        uniquePlaces.push(place);
      }
    }

    console.log(`   Found ${uniquePlaces.length} unique businesses`);

    // Transform to our format
    const businesses = uniquePlaces.map(place => transformToOurFormat(place, lat, lng));

    // APPLY INTELLIGENT LOCAL FILTER
    let localBusinesses = filterLocalBusinesses(businesses);

    // If user provided a search query, use SMART SEARCH to rank and filter results
    if (searchQuery && searchQuery.trim() && smartSearchData) {
      // Use smart search to filter and rank by relevance
      localBusinesses = filterBySmartSearch(localBusinesses, searchQuery);
      console.log(`   ✓ Smart search matched ${localBusinesses.length} businesses`);
      
      // If smart search found nothing, do a more lenient expanded term search
      if (localBusinesses.length === 0) {
        const expandedTerms = smartSearchData.expanded;
        localBusinesses = filterLocalBusinesses(businesses).filter(b => {
          const combined = `${b.name} ${b.description} ${b.category}`.toLowerCase();
          return expandedTerms.some(term => combined.includes(term));
        });
        console.log(`   ✓ Fallback expanded search matched ${localBusinesses.length} businesses`);
      }
    }

    console.log(`   ✓ Filtered to ${localBusinesses.length} LOCAL businesses`);
    console.log(`   Sample: ${localBusinesses.slice(0, 3).map(b => b.name).join(', ')}`);

    return localBusinesses.slice(0, 50); // Return top 50
  } catch (error) {
    console.error('Error fetching businesses:', error.message);
    return [];
  }
}

/**
 * Get smart search queries based on category
 * Targets family-owned, local businesses
 */
function getSmartSearchQueries(category) {
  const baseQueries = [
    'family owned restaurant',
    'local cafe',
    'independent coffee shop',
    'neighborhood bakery',
    'small business',
  ];

  if (!category || category === 'All') {
    return baseQueries; // Return all base queries for more results
  }

  const categoryQueries = {
    Food: ['family restaurant', 'local cafe', 'neighborhood bakery', 'mom and pop restaurant'],
    Retail: ['local shop', 'boutique', 'independent bookstore', 'family owned store'],
    Services: ['local salon', 'neighborhood barber', 'family owned business', 'local spa'],
    Entertainment: ['independent theater', 'local art gallery', 'community center'],
    Health: ['local pharmacy', 'family practice', 'neighborhood clinic'],
  };

  return categoryQueries[category] || baseQueries;
}

/**
 * Transform Google Place result to our business format
 */
function transformToOurFormat(place, userLat, userLng) {
  const category = mapGoogleTypesToCategory(place.types || []);
  const distance = calculateDistance(
    userLat,
    userLng,
    place.geometry.location.lat,
    place.geometry.location.lng
  );

  return {
    id: `google_${place.place_id}`,
    name: place.name,
    category,
    description: `${category} business in ${place.vicinity || 'the area'}`,
    address: place.vicinity || place.formatted_address || 'Address not available',
    phone: 'Call for info',
    hours: JSON.stringify({
      monday: 'See Google Maps',
      tuesday: 'See Google Maps',
      wednesday: 'See Google Maps',
      thursday: 'See Google Maps',
      friday: 'See Google Maps',
      saturday: 'See Google Maps',
      sunday: 'See Google Maps',
    }),
    email: null,
    website: null,
    // Use Google Places photo if available
    image_url: place.photos && place.photos.length > 0
      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
      : null,
    latitude: place.geometry.location.lat,
    longitude: place.geometry.location.lng,
    city: extractCityFromVicinity(place.vicinity),
    state: null,
    averageRating: parseFloat((place.rating || 0).toFixed(1)),
    reviewCount: place.user_ratings_total || 0,
    distance,
    isExternal: false, // Allow reviews on all businesses
    external_source: 'google_places',
    external_id: place.place_id,
    deliveryOptions: [],
  };
}

/**
 * Map our category to Google Place type
 */
function mapCategoryToGoogleType(category) {
  const map = {
    Food: 'restaurant',
    Retail: 'store',
    Services: 'hair_care',
    Entertainment: 'movie_theater',
    Health: 'spa',
  };
  return map[category] || null;
}

/**
 * Map Google types to our categories
 */
function mapGoogleTypesToCategory(types) {
  const foodTypes = ['restaurant', 'cafe', 'bakery', 'bar', 'food', 'meal_delivery', 'meal_takeaway'];
  const retailTypes = ['store', 'clothing_store', 'shoe_store', 'book_store', 'shopping_mall', 'convenience_store'];
  const serviceTypes = ['hair_care', 'beauty_salon', 'spa', 'gym', 'laundry', 'car_repair'];
  const entertainmentTypes = ['movie_theater', 'art_gallery', 'museum', 'night_club', 'bowling_alley'];
  const healthTypes = ['hospital', 'dentist', 'doctor', 'pharmacy', 'physiotherapist'];

  for (const type of types) {
    if (foodTypes.includes(type)) return 'Food';
    if (retailTypes.includes(type)) return 'Retail';
    if (serviceTypes.includes(type)) return 'Services';
    if (entertainmentTypes.includes(type)) return 'Entertainment';
    if (healthTypes.includes(type)) return 'Health';
  }

  return 'Other';
}

/**
 * Calculate distance using Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

function extractCityFromVicinity(vicinity) {
  if (!vicinity) return null;
  // Try to extract city name from vicinity string
  const parts = vicinity.split(',');
  return parts.length > 1 ? parts[parts.length - 1].trim() : null;
}

module.exports = {
  searchLiveBusinesses,
};
