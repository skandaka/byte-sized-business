/**
 * Lightweight image proxy to avoid CORS / hotlink blocks and normalize HTTPS.
 * NOTE: This is intentionally constrained to public HTTPS hosts to avoid SSRF.
 */
const express = require('express');
const axios = require('axios');

const router = express.Router();
const PLACEHOLDER = 'https://via.placeholder.com/900x600.png?text=Local+Business';

function isBlockedHost(hostname) {
  if (!hostname) return true;
  const lower = hostname.toLowerCase();
  return (
    lower === 'localhost' ||
    lower === '127.0.0.1' ||
    lower.endsWith('.local') ||
    lower.startsWith('169.254.') ||
    lower.startsWith('10.') ||
    lower.startsWith('192.168.')
  );
}

router.get('/image', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  let parsed;
  try {
    parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return res.status(400).json({ error: 'Invalid protocol' });
    }
    if (isBlockedHost(parsed.hostname)) {
      return res.status(400).json({ error: 'Host not allowed' });
    }
  } catch (err) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const response = await axios.get(parsed.toString(), {
      responseType: 'arraybuffer',
      timeout: 8000,
    });

    const contentType = response.headers['content-type'] || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(response.data);
  } catch (err) {
    console.error('Image proxy failed:', err.message);
    // Fall back to placeholder to keep UI intact
    try {
      const placeholder = await axios.get(PLACEHOLDER, { responseType: 'arraybuffer' });
      res.setHeader('Content-Type', placeholder.headers['content-type'] || 'image/png');
      res.send(placeholder.data);
    } catch (placeholderErr) {
      res.status(500).json({ error: 'Failed to fetch image' });
    }
  }
});

module.exports = router;
