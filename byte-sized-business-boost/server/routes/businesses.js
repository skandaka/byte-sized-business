/**
 * Business Routes
 * Handles all business-related API endpoints
 */

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const { DB_PATH } = require('../database/init');

const db = new sqlite3.Database(DB_PATH);

/**
 * GET /api/businesses
 * Retrieve businesses with optional filters
 * Query params: category, minRating, search, sort
 */
router.get('/', (req, res) => {
  const { category, minRating, search, sort } = req.query;

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

    res.json(formattedBusinesses);
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
 * GET /api/businesses/:id
 * Retrieve single business by ID with full details
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;

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
          deals: deals || []
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

module.exports = router;
