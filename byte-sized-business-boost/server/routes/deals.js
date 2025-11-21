/**
 * Deals Routes
 * Handles coupon and deal management
 */

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const { DB_PATH } = require('../database/init');

const db = new sqlite3.Database(DB_PATH);

/**
 * GET /api/deals
 * Get all active deals
 * Query params: category, active
 */
router.get('/', (req, res) => {
  const { category, active = 'true' } = req.query;

  let query = `
    SELECT
      d.*,
      b.name as business_name,
      b.category,
      b.image_url
    FROM deals d
    JOIN businesses b ON d.business_id = b.id
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

  query += ' ORDER BY d.expiration_date ASC';

  db.all(query, params, (err, deals) => {
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

    res.json(formattedDeals);
  });
});

/**
 * GET /api/deals/business/:businessId
 * Get all deals for a specific business
 */
router.get('/business/:businessId', (req, res) => {
  const { businessId } = req.params;

  const query = `
    SELECT * FROM deals
    WHERE business_id = ? AND is_active = 1 AND expiration_date > datetime("now")
    ORDER BY expiration_date ASC
  `;

  db.all(query, [businessId], (err, deals) => {
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

    res.json(formattedDeals);
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

    // Log successful verification
    db.run(
      'INSERT INTO verification_logs (id, user_id, verification_type, success) VALUES (?, ?, ?, ?)',
      [uuidv4(), userId, 'deal_claim', 1]
    );

    res.json({
      message: 'Deal claimed successfully',
      deal: {
        title: deal.title,
        discount_code: deal.discount_code,
        expiration_date: deal.expiration_date,
        terms: deal.terms
      }
    });
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
