/**
 * Business Pairing Service
 * Finds complementary businesses within walking distance (0.3-0.5 miles)
 * Helps users plan multi-stop local experiences
 */

const { calculateDistance } = require('./geocoding');

// Complementary business category pairs
// When at a business in key category, suggest businesses from value categories
const COMPLEMENTARY_CATEGORIES = {
  Food: ['Entertainment', 'Retail', 'Services'], // After eating, shop or see a show
  Entertainment: ['Food', 'Retail'], // Before/after a show, grab food or shop
  Retail: ['Food', 'Services'], // While shopping, get coffee or haircut
  Services: ['Food', 'Retail'], // After spa/salon, grab food or shop
  Health: ['Food', 'Retail'], // After health appointment, relax
  Other: ['Food', 'Retail', 'Entertainment'],
};

// Specific pairing recommendations (more granular)
const SPECIFIC_PAIRINGS = {
  cafe: ['book_store', 'art_gallery', 'bakery', 'florist'],
  restaurant: ['movie_theater', 'art_gallery', 'bar', 'night_club'],
  bookstore: ['cafe', 'bakery', 'restaurant'],
  'movie theater': ['restaurant', 'cafe', 'ice cream shop'],
  'hair salon': ['cafe', 'clothing store', 'spa'],
  gym: ['health food store', 'smoothie bar', 'spa'],
  bakery: ['cafe', 'florist', 'gift shop'],
};

/**
 * Find paired businesses near a given business
 * @param {Object} sourceBusiness - The business to find pairs for
 * @param {Array} allBusinesses - All available businesses
 * @param {number} maxDistance - Maximum distance in miles (default 0.5)
 * @returns {Array} Array of paired business suggestions
 */
function findBusinessPairs(sourceBusiness, allBusinesses, maxDistance = 0.5) {
  if (!sourceBusiness.latitude || !sourceBusiness.longitude) {
    return [];
  }

  const minDistance = 0.05; // Minimum 0.05 miles (about 1 block) to avoid same location
  const targetMaxDistance = 0.5; // Maximum 0.5 miles (easy walk)

  // Get complementary categories for source business
  const compatibleCategories = COMPLEMENTARY_CATEGORIES[sourceBusiness.category] || [];

  // Find nearby businesses within distance range
  const nearbyBusinesses = allBusinesses
    .filter(b => {
      // Don't pair with itself
      if (b.id === sourceBusiness.id) return false;

      // Must have location data
      if (!b.latitude || !b.longitude) return false;

      // Calculate distance
      const distance = calculateDistance(
        sourceBusiness.latitude,
        sourceBusiness.longitude,
        b.latitude,
        b.longitude
      );

      // Within our target range
      return distance >= minDistance && distance <= targetMaxDistance;
    })
    .map(b => ({
      ...b,
      distance: calculateDistance(
        sourceBusiness.latitude,
        sourceBusiness.longitude,
        b.latitude,
        b.longitude
      ),
    }));

  // Score and rank pairings
  const scoredPairings = nearbyBusinesses.map(business => {
    let score = 0;

    // Category compatibility (50 points)
    if (compatibleCategories.includes(business.category)) {
      score += 50;
    }

    // Distance scoring (30 points max)
    // Closer = better, but not too close
    if (business.distance <= 0.3) {
      score += 30; // Within 0.3 miles is ideal
    } else if (business.distance <= 0.5) {
      score += 20; // 0.3-0.5 miles is good
    }

    // Rating boost (20 points max)
    score += Math.min(business.averageRating * 4, 20);

    // Specific pairing bonus
    const sourceType = sourceBusiness.name.toLowerCase();
    const targetType = business.name.toLowerCase();
    for (const [type, pairs] of Object.entries(SPECIFIC_PAIRINGS)) {
      if (sourceType.includes(type)) {
        for (const pairType of pairs) {
          if (targetType.includes(pairType)) {
            score += 25;
            break;
          }
        }
      }
    }

    return {
      ...business,
      pairingScore: score,
      pairingReason: generatePairingReason(sourceBusiness, business),
    };
  });

  // Sort by score and return top 5
  return scoredPairings
    .sort((a, b) => b.pairingScore - a.pairingScore)
    .slice(0, 5);
}

/**
 * Generate a friendly reason for pairing
 */
function generatePairingReason(source, target) {
  const distance = target.distance;
  const walkTime = Math.round(distance * 20); // ~20 min per mile walking

  const reasons = {
    'Food-Entertainment': `Grab dinner before your show - just ${walkTime} min walk`,
    'Food-Retail': `Perfect coffee break while shopping - ${walkTime} min away`,
    'Entertainment-Food': `Get food before or after - ${walkTime} min walk`,
    'Retail-Food': `Take a break with coffee nearby - ${walkTime} min away`,
    'Services-Food': `Treat yourself after your appointment - ${walkTime} min walk`,
    'Food-Services': `Pamper yourself after lunch - ${walkTime} min away`,
  };

  const key = `${source.category}-${target.category}`;
  return reasons[key] || `Just ${walkTime} min walk away - great combo!`;
}

/**
 * Find business pairs for multiple businesses at once
 * Useful for pre-computing pairings for a list
 */
function findBatchPairings(businesses, maxDistance = 0.5) {
  const pairings = {};

  businesses.forEach(business => {
    const pairs = findBusinessPairs(business, businesses, maxDistance);
    if (pairs.length > 0) {
      pairings[business.id] = pairs;
    }
  });

  return pairings;
}

/**
 * Find optimal multi-stop route (2-3 businesses in a route)
 * Plans an efficient walking tour
 */
function findOptimalRoute(startBusiness, allBusinesses, maxTotalDistance = 1.0) {
  if (!startBusiness.latitude || !startBusiness.longitude) {
    return [];
  }

  // Find pairs for start business
  const firstStops = findBusinessPairs(startBusiness, allBusinesses, 0.5);

  // For each first stop, find compatible second stops
  const routes = firstStops.map(firstStop => {
    const secondStops = findBusinessPairs(firstStop, allBusinesses, 0.5)
      .filter(second => {
        // Don't return to start
        if (second.id === startBusiness.id) return false;

        // Calculate total distance: start → first → second
        const totalDistance =
          firstStop.distance +
          calculateDistance(
            firstStop.latitude,
            firstStop.longitude,
            second.latitude,
            second.longitude
          );

        return totalDistance <= maxTotalDistance;
      });

    if (secondStops.length === 0) {
      return {
        route: [startBusiness, firstStop],
        totalDistance: firstStop.distance,
        score: firstStop.pairingScore,
      };
    }

    // Return best 2-stop or 3-stop route
    const bestSecond = secondStops[0];
    const totalDistance =
      firstStop.distance +
      calculateDistance(
        firstStop.latitude,
        firstStop.longitude,
        bestSecond.latitude,
        bestSecond.longitude
      );

    return {
      route: [startBusiness, firstStop, bestSecond],
      totalDistance,
      totalWalkTime: Math.round(totalDistance * 20),
      score: firstStop.pairingScore + bestSecond.pairingScore / 2,
      description: `${startBusiness.name} → ${firstStop.name} → ${bestSecond.name}`,
    };
  });

  // Return top 3 routes by score
  return routes.sort((a, b) => b.score - a.score).slice(0, 3);
}

module.exports = {
  findBusinessPairs,
  findBatchPairings,
  findOptimalRoute,
  COMPLEMENTARY_CATEGORIES,
};
