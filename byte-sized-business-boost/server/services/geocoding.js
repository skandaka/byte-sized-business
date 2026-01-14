/**
 * Geocoding Service
 * Converts addresses to latitude/longitude coordinates
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 */

const axios = require('axios');

const GEOCODING_API = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'ByteSizedBusinessBoost/1.0';

/**
 * Geocode an address to lat/lng coordinates
 * @param {string} address - Full address to geocode
 * @returns {Promise<{lat: number, lng: number, city: string, state: string, zipCode: string} | null>}
 */
async function geocodeAddress(address) {
  if (!address || typeof address !== 'string') {
    console.warn('Invalid address provided to geocoding service');
    return null;
  }

  try {
    const response = await axios.get(GEOCODING_API, {
      params: {
        q: address,
        format: 'json',
        limit: 1,
        addressdetails: 1,
      },
      headers: {
        'User-Agent': USER_AGENT,
      },
      timeout: 5000,
    });

    if (!response.data || response.data.length === 0) {
      console.warn('No geocoding results for address:', address);
      return null;
    }

    const result = response.data[0];
    const addressParts = result.address || {};

    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      city: addressParts.city || addressParts.town || addressParts.village || null,
      state: addressParts.state || null,
      zipCode: addressParts.postcode || null,
      displayName: result.display_name,
    };
  } catch (error) {
    console.error('Geocoding error:', error.message);
    return null;
  }
}

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in miles
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
  const distance = R * c;

  return distance;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Get coordinates for a city name
 * @param {string} cityName - City name (e.g., "Seattle, WA")
 * @returns {Promise<{lat: number, lng: number} | null>}
 */
async function getCityCoordinates(cityName) {
  if (!cityName || typeof cityName !== 'string') {
    return null;
  }

  try {
    const response = await axios.get(GEOCODING_API, {
      params: {
        q: cityName,
        format: 'json',
        limit: 1,
        addressdetails: 1,
      },
      headers: {
        'User-Agent': USER_AGENT,
      },
      timeout: 5000,
    });

    if (!response.data || response.data.length === 0) {
      return null;
    }

    const result = response.data[0];
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    };
  } catch (error) {
    console.error('City geocoding error:', error.message);
    return null;
  }
}

/**
 * Reverse geocode coordinates to an address
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<{address: string, city: string, state: string} | null>}
 */
async function reverseGeocode(lat, lng) {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat,
        lon: lng,
        format: 'json',
        addressdetails: 1,
      },
      headers: {
        'User-Agent': USER_AGENT,
      },
      timeout: 5000,
    });

    if (!response.data) {
      return null;
    }

    const addressParts = response.data.address || {};
    return {
      address: response.data.display_name,
      city: addressParts.city || addressParts.town || addressParts.village || null,
      state: addressParts.state || null,
      zipCode: addressParts.postcode || null,
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error.message);
    return null;
  }
}

module.exports = {
  geocodeAddress,
  calculateDistance,
  getCityCoordinates,
  reverseGeocode,
};
