/**
 * Deals Routes
 * Handles coupon and deal management
 */

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const { DB_PATH } = require('../database/init');
const { getExternalDeals, generateDealsForBusinesses } = require('../services/externalDeals');
const { searchLiveBusinesses } = require('../services/liveBusinessSearch');
const { generateSmartDeals, getDeliveryLinks } = require('../services/dealScraper');

const db = new sqlite3.Database(DB_PATH);

/**
 * GET /api/deals
 * Get all active deals
 * Query params: category, active, lat, lng, radius
 */
router.get('/', async (req, res) => {
  const { category, active = 'true', lat, lng, radius = 10 } = req.query;

  let query = `
    SELECT
      d.*,
      b.name as business_name,
      b.category,
      b.image_url,
      COUNT(dc.id) as claim_count
    FROM deals d
    JOIN businesses b ON d.business_id = b.id
    LEFT JOIN deal_claims dc ON d.id = dc.deal_id
  `;

  const conditions = [];
  const params = [];

  if (active === 'true') {
    conditions.push('d.is_active = 1');
    conditions.push('d.expiration_date > datetime("now")');
  }

  if (category && category !== 'All') {
    conditions.push('b.category = ?');
    params.push(category);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' GROUP BY d.id ORDER BY d.expiration_date ASC';

  db.all(query, params, async (err, deals) => {
    if (err) {
      console.error('Error fetching deals:', err);
      return res.status(500).json({ error: 'Failed to fetch deals' });
    }

    // Calculate days remaining for each deal
    const formattedDeals = deals.map(deal => {
      const expirationDate = new Date(deal.expiration_date);
      const now = new Date();
      const daysRemaining = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));
      const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;

      return {
        ...deal,
        daysRemaining,
        isExpiringSoon,
        isExpired: daysRemaining <= 0
      };
    });

    // Generate deals for live businesses if location provided
    let externalDeals = [];
    if (lat && lng) {
      try {
        const liveBusinesses = await searchLiveBusinesses(parseFloat(lat), parseFloat(lng), parseFloat(radius), category);
        externalDeals = generateDealsForBusinesses(liveBusinesses.slice(0, 30)); // Generate deals for first 30 businesses
      } catch (err) {
        console.error('Error generating external deals:', err);
        externalDeals = [];
      }
    }

    const combined = [...formattedDeals, ...externalDeals];

    // Sort by soonest expiring, keeping external blended
    combined.sort((a, b) => new Date(a.expiration_date) - new Date(b.expiration_date));

    res.json(combined);
  });
});

/**
 * GET /api/deals/business/:businessId
 * Get all deals for a specific business
 */
router.get('/business/:businessId', async (req, res) => {
  const { businessId } = req.params;

  // First check if it's an external/live business (non-numeric ID)
  if (businessId && (businessId.includes('live_') || businessId.includes('google_'))) {
    try {
      // For external businesses, generate smart deals
      const mockBusiness = {
        id: businessId,
        name: req.query.name || 'Business',
        category: req.query.category || 'Food',
        description: req.query.description || '',
        address: req.query.address || ''
      };
      
      const deals = await generateSmartDeals(mockBusiness);
      const deliveryLinks = getDeliveryLinks(mockBusiness);
      
      return res.json({ 
        deals, 
        deliveryLinks,
        source: 'smart_generated'
      });
    } catch (error) {
      console.error('Error generating smart deals:', error);
      return res.json({ deals: [], deliveryLinks: [], source: 'error' });
    }
  }

  // For database businesses, get stored deals + generate smart deals
  const query = `
    SELECT d.*, COUNT(dc.id) as claim_count
    FROM deals d
    LEFT JOIN deal_claims dc ON d.id = dc.deal_id
    WHERE d.business_id = ? AND d.is_active = 1 AND d.expiration_date > datetime("now")
    GROUP BY d.id
    ORDER BY d.expiration_date ASC
  `;

  db.all(query, [businessId], async (err, deals) => {
    if (err) {
      console.error('Error fetching business deals:', err);
      return res.status(500).json({ error: 'Failed to fetch deals' });
    }

    const formattedDeals = deals.map(deal => {
      const expirationDate = new Date(deal.expiration_date);
      const now = new Date();
      const daysRemaining = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));

      return {
        ...deal,
        daysRemaining,
        isExpiringSoon: daysRemaining <= 7
      };
    });

    // Also get business info to generate smart deals
    db.get('SELECT * FROM businesses WHERE id = ?', [businessId], async (err, business) => {
      if (business) {
        try {
          const smartDeals = await generateSmartDeals(business);
          const deliveryLinks = getDeliveryLinks(business);
          
          // Combine stored deals with smart-generated ones
          const allDeals = [...formattedDeals, ...smartDeals];
          
          return res.json({
            deals: allDeals,
            deliveryLinks,
            source: 'combined'
          });
        } catch (e) {
          console.error('Error generating smart deals:', e);
        }
      }
      
      res.json({ 
        deals: formattedDeals, 
        deliveryLinks: [],
        source: 'database_only'
      });
    });
  });
});

/**
 * GET /api/deals/:id
 * Get a specific deal by ID
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT
      d.*,
      b.name as business_name,
      b.category,
      b.image_url,
      b.address,
      b.phone
    FROM deals d
    JOIN businesses b ON d.business_id = b.id
    WHERE d.id = ?
  `;

  db.get(query, [id], (err, deal) => {
    if (err) {
      console.error('Error fetching deal:', err);
      return res.status(500).json({ error: 'Failed to fetch deal' });
    }

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    const expirationDate = new Date(deal.expiration_date);
    const now = new Date();
    const daysRemaining = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));

    res.json({
      ...deal,
      daysRemaining,
      isExpiringSoon: daysRemaining <= 7,
      isExpired: daysRemaining <= 0
    });
  });
});

/**
 * POST /api/deals
 * Create a new deal (admin only)
 * Body: { businessId, title, description, discountCode, expirationDate, terms }
 */
router.post('/', (req, res) => {
  const {
    businessId,
    title,
    description,
    discountCode,
    expirationDate,
    terms
  } = req.body;

  // Validation
  if (!businessId || !title || !description || !expirationDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate expiration date is in the future
  const expDate = new Date(expirationDate);
  if (expDate <= new Date()) {
    return res.status(400).json({ error: 'Expiration date must be in the future' });
  }

  const id = uuidv4();

  const query = `
    INSERT INTO deals (id, business_id, title, description, discount_code, expiration_date, terms)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [id, businessId, title, description, discountCode, expirationDate, terms],
    function(err) {
      if (err) {
        console.error('Error creating deal:', err);
        return res.status(500).json({ error: 'Failed to create deal' });
      }

      res.status(201).json({
        id,
        business_id: businessId,
        title,
        description,
        discount_code: discountCode,
        expiration_date: expirationDate,
        terms,
        is_active: 1
      });
    }
  );
});

/**
 * POST /api/deals/:id/claim
 * Claim a deal (requires verification)
 * Body: { userId, verificationToken }
 */
router.post('/:id/claim', (req, res) => {
  const { id } = req.params;
  const { userId, verificationToken } = req.body;

  if (!userId || !verificationToken) {
    return res.status(400).json({ error: 'User ID and verification required' });
  }

  // Get deal details
  db.get('SELECT * FROM deals WHERE id = ?', [id], (err, deal) => {
    if (err) {
      console.error('Error fetching deal:', err);
      return res.status(500).json({ error: 'Failed to claim deal' });
    }

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    // Check if deal is still valid
    const expirationDate = new Date(deal.expiration_date);
    if (expirationDate <= new Date()) {
      return res.status(400).json({ error: 'Deal has expired' });
    }

    if (!deal.is_active) {
      return res.status(400).json({ error: 'Deal is no longer active' });
    }

    // Record deal claim
    const claimId = uuidv4();
    db.run(
      'INSERT INTO deal_claims (id, deal_id, user_id) VALUES (?, ?, ?)',
      [claimId, id, userId],
      function(claimErr) {
        if (claimErr) {
          console.error('Error recording deal claim:', claimErr);
          // Don't fail if claim tracking fails - still show the deal
        }

        // Log successful verification
        db.run(
          'INSERT INTO verification_logs (id, user_id, verification_type, success) VALUES (?, ?, ?, ?)',
          [uuidv4(), userId, 'deal_claim', 1]
        );

        // Get updated claim count
        db.get(
          'SELECT COUNT(*) as claim_count FROM deal_claims WHERE deal_id = ?',
          [id],
          (countErr, result) => {
            res.json({
              message: 'Deal claimed successfully',
              deal: {
                title: deal.title,
                discount_code: deal.discount_code,
                expiration_date: deal.expiration_date,
                terms: deal.terms
              },
              claim_count: result ? result.claim_count : 0
            });
          }
        );
      }
    );
  });
});

/**
 * DELETE /api/deals/:id
 * Deactivate a deal (admin only)
 */
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run(
    'UPDATE deals SET is_active = 0 WHERE id = ?',
    [id],
    function(err) {
      if (err) {
        console.error('Error deactivating deal:', err);
        return res.status(500).json({ error: 'Failed to deactivate deal' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Deal not found' });
      }

      res.json({ message: 'Deal deactivated successfully' });
    }
  );
});

module.exports = router;
