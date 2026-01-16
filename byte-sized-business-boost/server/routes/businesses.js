/**
 * Business Routes
 * Handles all business-related API endpoints
 * Features advanced local business filtering algorithm
 */

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const { DB_PATH } = require('../database/init');
const { filterLocalBusinesses, analyzeBusinessClassification } = require('../services/localBusinessAlgorithm');
const { buildDeliveryOptions } = require('../services/deliveryMeta');
const { getExternalBusinesses, findExternalBusinessById } = require('../services/externalBusinesses');
const { calculateDistance } = require('../services/geocoding');
const { searchLiveBusinesses } = require('../services/liveBusinessSearch');

const db = new sqlite3.Database(DB_PATH);

/**
 * GET /api/businesses
 * Retrieve businesses with optional filters
 * Query params: category, minRating, search, sort, lat, lng, radius (in miles)
 * NEW: If lat/lng provided, fetches LIVE businesses from Google Places API
 */
router.get('/', async (req, res) => {
  const { category, minRating, search, sort, external, lat, lng, radius } = req.query;

  // NEW: If location provided, try to fetch LIVE businesses from Google Places API
  if (lat && lng) {
    try {
      const liveBusinesses = await searchLiveBusinesses(
        parseFloat(lat),
        parseFloat(lng),
        parseFloat(radius) || 10,
        category
      );

      // Only use live results if we actually got some businesses
      if (liveBusinesses && liveBusinesses.length > 0) {
        // Sort businesses
        let sortedBusinesses = [...liveBusinesses];
        switch (sort) {
          case 'highest-rated':
            sortedBusinesses.sort((a, b) => b.averageRating - a.averageRating);
            break;
          case 'most-reviews':
            sortedBusinesses.sort((a, b) => b.reviewCount - a.reviewCount);
            break;
          case 'lowest-rated':
            sortedBusinesses.sort((a, b) => a.averageRating - b.averageRating);
            break;
          case 'a-z':
            sortedBusinesses.sort((a, b) => a.name.localeCompare(b.name));
            break;
          default:
            // Already sorted by distance from API
            break;
        }

        return res.json(sortedBusinesses);
      }
      // If no live businesses found, fall through to database
      console.log('⚠️ No live businesses found, falling back to database');
    } catch (error) {
      console.error('Error fetching live businesses:', error);
      // Fall through to database query
    }
  }

  // FALLBACK: Query local database businesses
  const { category: _cat, minRating: _min, search: _search, sort: _sort, external: _ext, lat: _lat, lng: _lng, radius: _radius } = req.query;

  let query = `
    SELECT
      b.*,
      COALESCE(AVG(r.rating), 0) as averageRating,
      COUNT(DISTINCT r.id) as reviewCount
    FROM businesses b
    LEFT JOIN reviews r ON b.id = r.business_id
  `;

  const conditions = [];
  const params = [];

  // Apply filters
  if (category && category !== 'All') {
    conditions.push('b.category = ?');
    params.push(category);
  }

  if (search) {
    conditions.push('(b.name LIKE ? OR b.description LIKE ? OR b.category LIKE ?)');
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' GROUP BY b.id';

  // Apply rating filter after GROUP BY
  if (minRating) {
    query += ' HAVING averageRating >= ?';
    params.push(parseFloat(minRating));
  }

  // Apply sorting
  switch (sort) {
    case 'highest-rated':
      query += ' ORDER BY averageRating DESC, reviewCount DESC';
      break;
    case 'most-reviews':
      query += ' ORDER BY reviewCount DESC, averageRating DESC';
      break;
    case 'lowest-rated':
      query += ' ORDER BY averageRating ASC';
      break;
    case 'most-recent':
      query += ' ORDER BY b.created_at DESC';
      break;
    case 'a-z':
      query += ' ORDER BY b.name ASC';
      break;
    default:
      query += ' ORDER BY averageRating DESC, b.name ASC';
  }

  db.all(query, params, (err, businesses) => {
    if (err) {
      console.error('Error fetching businesses:', err);
      return res.status(500).json({ error: 'Failed to fetch businesses' });
    }

    // Parse hours JSON for each business
    const formattedBusinesses = businesses.map(business => ({
      ...business,
      hours: JSON.parse(business.hours),
      averageRating: parseFloat(business.averageRating.toFixed(1)),
      reviewCount: parseInt(business.reviewCount)
    }));

    // ✨ APPLY LOCAL BUSINESS ALGORITHM ✨
    // Filter out corporate chains and only show small, local businesses
    let localBusinesses = filterLocalBusinesses(formattedBusinesses).map((b) => ({
      ...b,
      deliveryOptions: buildDeliveryOptions(b.name, b.category),
      isExternal: false,
    }));

    // Apply location-based filtering if coordinates provided
    if (lat && lng && radius) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const maxRadius = parseFloat(radius);

      localBusinesses = localBusinesses
        .map((b) => {
          if (b.latitude && b.longitude) {
            const distance = calculateDistance(userLat, userLng, b.latitude, b.longitude);
            return { ...b, distance };
          }
          return { ...b, distance: null };
        })
        .filter((b) => b.distance === null || b.distance <= maxRadius)
        .sort((a, b) => {
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });

      console.log(`📍 Location filter: ${localBusinesses.length} businesses within ${maxRadius} miles`);
    }

    console.log(`🏪 Filtered: ${businesses.length} total → ${localBusinesses.length} local businesses`);

    // Optionally blend in mocked external providers (Yelp/Google style)
    let results = localBusinesses;
    if (external === 'true') {
      const extras = getExternalBusinesses(category).map((ext) => ({
        ...ext,
        hours: typeof ext.hours === 'string' ? JSON.parse(ext.hours) : ext.hours,
        averageRating: ext.averageRating || 4.5,
        reviewCount: ext.reviewCount || 0,
        deliveryOptions: buildDeliveryOptions(ext.name, ext.category),
        isExternal: true,
      }));
      results = [...localBusinesses, ...extras];
    }

    res.json(results);
  });
});

/**
 * GET /api/businesses/categories/count
 * Get count of businesses per category
 * NOTE: This must come BEFORE /:id route to prevent "categories" being treated as an ID
 */
router.get('/categories/count', (req, res) => {
  const query = `
    SELECT category, COUNT(*) as count
    FROM businesses
    GROUP BY category
    ORDER BY category
  `;

  db.all(query, [], (err, results) => {
    if (err) {
      console.error('Error fetching category counts:', err);
      return res.status(500).json({ error: 'Failed to fetch category counts' });
    }

    res.json(results);
  });
});

/**
 * GET /api/businesses/:id/pairings
 * Find complementary businesses within walking distance (0.3-0.5 miles)
 * Returns 3-5 suggested business pairings
 * NOTE: This must come BEFORE /:id route to avoid conflicts
 */
router.get('/:id/pairings', async (req, res) => {
  const { id } = req.params;
  const { lat, lng, radius, name, category } = req.query;

  try {
    const { findBusinessPairs } = require('../services/businessPairing');

    // Get the source business
    let sourceBusiness;

    if (id.startsWith('google_')) {
      // For Google Places businesses, we need full details
      const placeId = id.replace('google_', '');
      sourceBusiness = {
        id,
        name: name || 'Unknown Business',
        category: category || 'Other',
        external_id: placeId,
        isExternal: true,
      };

      // If we have lat/lng in query, use those
      if (lat && lng) {
        sourceBusiness.latitude = parseFloat(lat);
        sourceBusiness.longitude = parseFloat(lng);
      } else {
        return res.status(400).json({ error: 'Lat/lng required for external businesses' });
      }
    } else {
      // Database business
      const query = 'SELECT * FROM businesses WHERE id = ?';
      sourceBusiness = await new Promise((resolve, reject) => {
        db.get(query, [id], (err, business) => {
          if (err) reject(err);
          else resolve(business);
        });
      });

      if (!sourceBusiness) {
        return res.status(404).json({ error: 'Business not found' });
      }
    }

    // Get all nearby businesses to pair with
    let nearbyBusinesses = [];

    if (sourceBusiness.latitude && sourceBusiness.longitude) {
      // Fetch live businesses in the area
      nearbyBusinesses = await searchLiveBusinesses(
        sourceBusiness.latitude,
        sourceBusiness.longitude,
        parseFloat(radius) || 1, // 1 mile radius
        null // All categories
      );
    }

    // Find pairings
    const pairings = findBusinessPairs(sourceBusiness, nearbyBusinesses, 0.5);

    res.json({
      sourceBusiness: {
        id: sourceBusiness.id,
        name: sourceBusiness.name,
        category: sourceBusiness.category,
      },
      pairings,
      totalFound: pairings.length,
    });
  } catch (error) {
    console.error('Error finding business pairings:', error);
    res.status(500).json({ error: 'Failed to find business pairings' });
  }
});

/**
 * GET /api/businesses/:id
 * Retrieve single business by ID with full details
 * NOW SUPPORTS: Google Places businesses (IDs starting with "google_")
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  // Check if this is a Google Places business
  if (id.startsWith('google_')) {
    const placeId = id.replace('google_', '');

    try {
      const axios = require('axios');
      const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

      if (!GOOGLE_PLACES_API_KEY) {
        return res.status(500).json({ error: 'Google Places API not configured' });
      }

      // Fetch full details from Google Places Details API
      const detailsUrl = 'https://maps.googleapis.com/maps/api/place/details/json';
      const response = await axios.get(detailsUrl, {
        params: {
          place_id: placeId,
          fields: 'name,formatted_address,formatted_phone_number,opening_hours,website,rating,user_ratings_total,photos,geometry,types,vicinity,reviews',
          key: GOOGLE_PLACES_API_KEY,
        },
        timeout: 5000,
      });

      if (response.data.status !== 'OK' || !response.data.result) {
        console.error('Google Places API error:', response.data.status);
        return res.status(404).json({ error: 'Business not found' });
      }

      const place = response.data.result;

      // Transform to our format
      const business = {
        id: `google_${placeId}`,
        name: place.name,
        category: mapGoogleTypesToCategory(place.types || []),
        description: `${place.name} is located at ${place.vicinity || place.formatted_address}`,
        address: place.formatted_address || place.vicinity || 'Address not available',
        phone: place.formatted_phone_number || 'Call for info',
        hours: place.opening_hours?.weekday_text
          ? {
              monday: place.opening_hours.weekday_text[0] || 'See Google Maps',
              tuesday: place.opening_hours.weekday_text[1] || 'See Google Maps',
              wednesday: place.opening_hours.weekday_text[2] || 'See Google Maps',
              thursday: place.opening_hours.weekday_text[3] || 'See Google Maps',
              friday: place.opening_hours.weekday_text[4] || 'See Google Maps',
              saturday: place.opening_hours.weekday_text[5] || 'See Google Maps',
              sunday: place.opening_hours.weekday_text[6] || 'See Google Maps',
            }
          : {
              monday: 'Hours not available',
              tuesday: 'Hours not available',
              wednesday: 'Hours not available',
              thursday: 'Hours not available',
              friday: 'Hours not available',
              saturday: 'Hours not available',
              sunday: 'Hours not available',
            },
        email: null,
        website: place.website || null,
        image_url: place.photos && place.photos.length > 0
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
          : 'https://via.placeholder.com/800x600/cccccc/666666?text=No+Image',
        latitude: place.geometry?.location?.lat || null,
        longitude: place.geometry?.location?.lng || null,
        city: extractCityFromAddress(place.formatted_address),
        state: null,
        averageRating: parseFloat((place.rating || 0).toFixed(1)),
        reviewCount: place.user_ratings_total || 0,
        deals: [], // Google Places businesses don't have our deals
        deliveryOptions: buildDeliveryOptions(place.name, mapGoogleTypesToCategory(place.types || [])),
        isExternal: true,
        external_source: 'google_places',
        external_id: placeId,
      };

      return res.json(business);
    } catch (error) {
      console.error('Error fetching Google Place details:', error.message);
      return res.status(500).json({ error: 'Failed to fetch business details' });
    }
  }

  // Original database business logic
  const query = `
    SELECT
      b.*,
      COALESCE(AVG(r.rating), 0) as averageRating,
      COUNT(DISTINCT r.id) as reviewCount
    FROM businesses b
    LEFT JOIN reviews r ON b.id = r.business_id
    WHERE b.id = ?
    GROUP BY b.id
  `;

  db.get(query, [id], (err, business) => {
    if (err) {
      console.error('Error fetching business:', err);
      return res.status(500).json({ error: 'Failed to fetch business' });
    }

    if (!business) {
      const external = findExternalBusinessById(id);
      if (external) {
        return res.json({
          ...external,
          hours: typeof external.hours === 'string' ? JSON.parse(external.hours) : external.hours,
          averageRating: external.averageRating || 4.5,
          reviewCount: external.reviewCount || 0,
          deals: [],
          isExternal: true,
        });
      }

      return res.status(404).json({ error: 'Business not found' });
    }

    // Get deals for this business
    db.all(
      'SELECT * FROM deals WHERE business_id = ? AND is_active = 1 ORDER BY expiration_date ASC',
      [id],
      (err, deals) => {
        if (err) {
          console.error('Error fetching deals:', err);
          deals = [];
        }

        res.json({
          ...business,
          hours: JSON.parse(business.hours),
          averageRating: parseFloat(business.averageRating.toFixed(1)),
          reviewCount: parseInt(business.reviewCount),
          deals: deals || [],
          deliveryOptions: buildDeliveryOptions(business.name, business.category),
          isExternal: false,
        });
      }
    );
  });
});

/**
 * POST /api/businesses
 * Create a new business (admin only in production)
 */
router.post('/', (req, res) => {
  const {
    name,
    category,
    description,
    address,
    phone,
    hours,
    email,
    website,
    image_url
  } = req.body;

  // Validation
  if (!name || !category || !description || !address || !phone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const validCategories = ['Food', 'Retail', 'Services', 'Entertainment', 'Health', 'Other'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  const id = uuidv4();
  const hoursJson = JSON.stringify(hours);

  const query = `
    INSERT INTO businesses (id, name, category, description, address, phone, hours, email, website, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [id, name, category, description, address, phone, hoursJson, email, website, image_url],
    function(err) {
      if (err) {
        console.error('Error creating business:', err);
        return res.status(500).json({ error: 'Failed to create business' });
      }

      res.status(201).json({
        id,
        name,
        category,
        description,
        address,
        phone,
        hours,
        email,
        website,
        image_url,
        averageRating: 0,
        reviewCount: 0
      });
    }
  );
});

/**
 * GET /api/businesses/algorithm/analysis
 * Debug endpoint: Shows how the local business algorithm scored each business
 * Useful for demonstrating the algorithm during competition presentation
 */
router.get('/algorithm/analysis', (req, res) => {
  const query = `
    SELECT
      b.*,
      COALESCE(AVG(r.rating), 0) as averageRating,
      COUNT(DISTINCT r.id) as reviewCount
    FROM businesses b
    LEFT JOIN reviews r ON b.id = r.business_id
    GROUP BY b.id
    ORDER BY b.name ASC
  `;

  db.all(query, [], (err, businesses) => {
    if (err) {
      console.error('Error fetching businesses for analysis:', err);
      return res.status(500).json({ error: 'Failed to analyze businesses' });
    }

    const formattedBusinesses = businesses.map(business => ({
      ...business,
      hours: JSON.parse(business.hours),
      averageRating: parseFloat(business.averageRating.toFixed(1)),
      reviewCount: parseInt(business.reviewCount)
    }));

    // Analyze each business
    const analysis = formattedBusinesses.map(business => 
      analyzeBusinessClassification(business)
    );

    const summary = {
      totalBusinesses: analysis.length,
      localBusinesses: analysis.filter(a => a.classification.includes('LOCAL')).length,
      chains: analysis.filter(a => a.classification.includes('CHAIN')).length,
      averageScore: Math.round(analysis.reduce((sum, a) => sum + a.scores.overall, 0) / analysis.length)
    };

    res.json({
      summary,
      algorithm: {
        name: 'Local Business Authenticity Index (LBAI)',
        description: 'Advanced composite scoring system to identify small, local businesses',
        components: {
          chainDetection: '50% weight - Identifies corporate chains',
          businessSize: '30% weight - Analyzes business scale',
          localityScore: '20% weight - Measures community integration'
        },
        threshold: 'Businesses must score ≥60 to be classified as local'
      },
      businessAnalysis: analysis
    });
  });
});

/**
 * Helper function: Map Google Place types to our categories
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
 * Helper function: Extract city from formatted address
 */
function extractCityFromAddress(address) {
  if (!address) return null;
  // Format is usually: "123 Street, City, State ZIP, Country"
  const parts = address.split(',');
  if (parts.length >= 2) {
    return parts[parts.length - 3]?.trim() || null;
  }
  return null;
}

module.exports = router;
