/**
 * Image Proxy Routes
 * Proxies external images through our server to avoid CORS issues
 * Provides fallback image search for businesses without photos
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const GOOGLE_SEARCH_API_KEY = process.env.GOOGLE_SEARCH_API_KEY;
const GOOGLE_SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;

/**
 * GET /api/images/places-photo/:photoReference
 * Proxy Google Places photos through our server
 */
router.get('/places-photo/:photoReference', async (req, res) => {
  const { photoReference } = req.params;
  const { maxwidth = 800 } = req.query;

  const PLACEHOLDER = 'https://via.placeholder.com/800x600.png?text=Local+Business';

  if (!GOOGLE_PLACES_API_KEY) {
    // Redirect to placeholder if no API key
    return res.redirect(PLACEHOLDER);
  }

  try {
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth}&photo_reference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;

    const response = await axios.get(photoUrl, {
      responseType: 'stream',
      timeout: 10000,
    });

    // Forward the content type
    res.setHeader('Content-Type', response.headers['content-type']);

    // Cache for 7 days
    res.setHeader('Cache-Control', 'public, max-age=604800');

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    // Pipe the image data to the response
    response.data.pipe(res);
  } catch (error) {
    console.error('Error proxying image:', error.message);
    // Redirect to placeholder on error
    res.redirect(PLACEHOLDER);
  }
});

/**
 * GET /api/images/search
 * Search for business images using Google Custom Search API
 * Fallback when Google Places doesn't have photos
 */
router.get('/search', async (req, res) => {
  const { businessName, category, city } = req.query;

  if (!businessName) {
    return res.status(400).json({ error: 'businessName is required' });
  }

  // Try Google Custom Search API if configured
  if (GOOGLE_SEARCH_API_KEY && GOOGLE_SEARCH_ENGINE_ID) {
    try {
      const searchQuery = `${businessName} ${category || ''} ${city || ''}`.trim();

      const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: GOOGLE_SEARCH_API_KEY,
          cx: GOOGLE_SEARCH_ENGINE_ID,
          q: searchQuery,
          searchType: 'image',
          num: 1,
          imgSize: 'large',
          safe: 'active',
        },
        timeout: 5000,
      });

      if (response.data.items && response.data.items.length > 0) {
        return res.json({
          imageUrl: response.data.items[0].link,
          thumbnail: response.data.items[0].image.thumbnailLink,
          source: 'google_custom_search',
        });
      }
    } catch (error) {
      console.error('Error searching for image:', error.message);
    }
  }

  // Return placeholder if no API keys or search failed
  res.json({
    imageUrl: null,
    placeholder: true,
    source: 'none',
  });
});

/**
 * GET /api/images/proxy
 * Generic image proxy for any external URL
 */
router.get('/proxy', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'url parameter is required' });
  }

  try {
    const response = await axios.get(url, {
      responseType: 'stream',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ByteSizedBusinessBoost/1.0)',
      },
    });

    // Forward the content type
    res.setHeader('Content-Type', response.headers['content-type']);

    // Cache for 1 day
    res.setHeader('Cache-Control', 'public, max-age=86400');

    // Pipe the image data to the response
    response.data.pipe(res);
  } catch (error) {
    console.error('Error proxying image:', error.message);
    res.status(500).json({ error: 'Failed to load image' });
  }
});

module.exports = router;
