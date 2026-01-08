/**
 * Google Places API Integration Service
 * Fetches real business data from Google Places API for Chicago area
 */

const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const BASE_URL = 'https://maps.googleapis.com/maps/api/place';

// Chicago coordinates
const CHICAGO_LAT = 41.8781;
const CHICAGO_LNG = -87.6298;
const RADIUS = 10000; // 10km radius

/**
 * Search for businesses by type in Chicago area
 */
async function searchBusinesses(type, maxResults = 10) {
  try {
    const url = `${BASE_URL}/nearbysearch/json`;
    const params = {
      location: `${CHICAGO_LAT},${CHICAGO_LNG}`,
      radius: RADIUS,
      type: type,
      key: API_KEY
    };

    const response = await axios.get(url, { params });
    
    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      console.error(`API Error: ${response.data.status}`);
      return [];
    }

    return response.data.results.slice(0, maxResults);
  } catch (error) {
    console.error(`Error fetching businesses of type ${type}:`, error.message);
    return [];
  }
}

/**
 * Get detailed information about a specific place
 */
async function getPlaceDetails(placeId) {
  try {
    const url = `${BASE_URL}/details/json`;
    const params = {
      place_id: placeId,
      fields: 'name,formatted_address,formatted_phone_number,opening_hours,website,rating,reviews,photos,types',
      key: API_KEY
    };

    const response = await axios.get(url, { params });
    
    if (response.data.status === 'OK') {
      return response.data.result;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching place details for ${placeId}:`, error.message);
    return null;
  }
}

/**
 * Get photo URL from photo reference
 */
function getPhotoUrl(photoReference, maxWidth = 800) {
  if (!photoReference) return null;
  return `${BASE_URL}/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${API_KEY}`;
}

/**
 * Map Google Place type to our app categories
 */
function mapTypeToCategory(types) {
  const typeMapping = {
    'restaurant': 'Food',
    'cafe': 'Food',
    'bakery': 'Food',
    'bar': 'Food',
    'meal_delivery': 'Food',
    'meal_takeaway': 'Food',
    'store': 'Retail',
    'clothing_store': 'Retail',
    'shopping_mall': 'Retail',
    'book_store': 'Retail',
    'jewelry_store': 'Retail',
    'shoe_store': 'Retail',
    'hair_care': 'Services',
    'beauty_salon': 'Services',
    'spa': 'Services',
    'laundry': 'Services',
    'car_repair': 'Services',
    'gym': 'Health',
    'doctor': 'Health',
    'dentist': 'Health',
    'pharmacy': 'Health',
    'hospital': 'Health',
    'movie_theater': 'Entertainment',
    'night_club': 'Entertainment',
    'bowling_alley': 'Entertainment',
    'amusement_park': 'Entertainment',
    'museum': 'Entertainment'
  };

  for (const type of types) {
    if (typeMapping[type]) {
      return typeMapping[type];
    }
  }
  
  return 'Other';
}

/**
 * Format opening hours for our database
 */
function formatOpeningHours(openingHours) {
  if (!openingHours || !openingHours.weekday_text) {
    return {
      monday: { open: '9:00 AM', close: '5:00 PM' },
      tuesday: { open: '9:00 AM', close: '5:00 PM' },
      wednesday: { open: '9:00 AM', close: '5:00 PM' },
      thursday: { open: '9:00 AM', close: '5:00 PM' },
      friday: { open: '9:00 AM', close: '5:00 PM' },
      saturday: { open: '10:00 AM', close: '4:00 PM' },
      sunday: { open: 'Closed', close: 'Closed' }
    };
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const hours = {};

  openingHours.weekday_text.forEach((text, index) => {
    const parts = text.split(': ');
    const dayName = days[index];
    
    if (parts[1] === 'Closed') {
      hours[dayName] = { open: 'Closed', close: 'Closed' };
    } else {
      const times = parts[1].split(' – ');
      hours[dayName] = {
        open: times[0] || '9:00 AM',
        close: times[1] || '5:00 PM'
      };
    }
  });

  return hours;
}

/**
 * Fetch real businesses from Google Places for all categories
 */
async function fetchChicagoBusinesses() {
  console.log('🔍 Fetching real Chicago businesses from Google Places API...\n');
  
  const searchTypes = [
    { type: 'restaurant', category: 'Food', count: 8 },
    { type: 'cafe', category: 'Food', count: 4 },
    { type: 'store', category: 'Retail', count: 5 },
    { type: 'clothing_store', category: 'Retail', count: 3 },
    { type: 'hair_care', category: 'Services', count: 4 },
    { type: 'spa', category: 'Services', count: 2 },
    { type: 'gym', category: 'Health', count: 3 },
    { type: 'pharmacy', category: 'Health', count: 2 },
    { type: 'movie_theater', category: 'Entertainment', count: 2 },
    { type: 'museum', category: 'Entertainment', count: 3 }
  ];

  const allBusinesses = [];

  for (const search of searchTypes) {
    console.log(`Fetching ${search.count} ${search.category} businesses (${search.type})...`);
    const results = await searchBusinesses(search.type, search.count);
    
    for (const place of results) {
      // Get detailed information
      const details = await getPlaceDetails(place.place_id);
      
      if (details) {
        const business = {
          name: details.name,
          category: mapTypeToCategory(details.types || []),
          description: `${details.name} is a popular ${search.type} in Chicago. ` +
                      (details.rating ? `Rated ${details.rating} stars by Google users.` : ''),
          address: details.formatted_address || place.vicinity,
          phone: details.formatted_phone_number || '(312) 555-0000',
          hours: formatOpeningHours(details.opening_hours),
          website: details.website || null,
          image_url: details.photos && details.photos[0] 
            ? getPhotoUrl(details.photos[0].photo_reference) 
            : null
        };

        allBusinesses.push(business);
        console.log(`  ✓ ${business.name}`);
      }
      
      // Rate limiting - wait between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('');
  }

  console.log(`\n✅ Successfully fetched ${allBusinesses.length} real businesses!\n`);
  return allBusinesses;
}

module.exports = {
  searchBusinesses,
  getPlaceDetails,
  getPhotoUrl,
  fetchChicagoBusinesses,
  mapTypeToCategory,
  formatOpeningHours
};
