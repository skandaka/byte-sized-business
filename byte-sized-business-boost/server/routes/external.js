/**
 * External discovery routes (mocked Yelp/Google style responses).
 * This is a safe stub that can be wired to real providers when API keys are added.
 */
const express = require('express');
const { getExternalBusinesses } = require('../services/externalBusinesses');
const { getExternalDeals } = require('../services/externalDeals');

const router = express.Router();

router.get('/search', (req, res) => {
  const { category = 'All' } = req.query;
  res.json({
    businesses: getExternalBusinesses(category),
    deals: getExternalDeals(category),
    meta: {
      providers: ['Yelp (mock)', 'Google Places (mock)', 'Uber Eats (mock)', 'DoorDash (mock)'],
    },
  });
});

module.exports = router;
