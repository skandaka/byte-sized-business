/**
 * Feature Flags Routes
 * API endpoints for feature flag management
 */

const express = require('express');
const router = express.Router();
const { getAllFlags } = require('../services/featureFlags');

/**
 * GET /api/feature-flags
 * Retrieve all feature flags (public endpoint for client)
 */
router.get('/', (req, res) => {
  const flags = getAllFlags();
  res.json({
    flags,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
