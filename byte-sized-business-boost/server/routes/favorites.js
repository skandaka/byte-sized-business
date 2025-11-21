/**
 * Favorites Routes
 * Handles user favorites/bookmarking functionality
 */

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const { DB_PATH } = require('../database/init');

const db = new sqlite3.Database(DB_PATH);

/**
 * GET /api/favorites/:userId
 * Get all favorites for a user
 */
router.get('/:userId', (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT
      f.id as favorite_id,
      f.created_at as favorited_at,
      b.*,
      COALESCE(AVG(r.rating), 0) as averageRating,
      COUNT(DISTINCT r.id) as reviewCount
    FROM favorites f
    JOIN businesses b ON f.business_id = b.id
    LEFT JOIN reviews r ON b.id = r.business_id
    WHERE f.user_id = ?
    GROUP BY b.id
    ORDER BY f.created_at DESC
  `;

  db.all(query, [userId], (err, favorites) => {
    if (err) {
      console.error('Error fetching favorites:', err);
      return res.status(500).json({ error: 'Failed to fetch favorites' });
    }

    const formattedFavorites = favorites.map(fav => ({
      ...fav,
      hours: JSON.parse(fav.hours),
      averageRating: parseFloat(fav.averageRating.toFixed(1)),
      reviewCount: parseInt(fav.reviewCount)
    }));

    res.json(formattedFavorites);
  });
});

/**
 * POST /api/favorites
 * Add a business to favorites
 * Body: { userId, businessId }
 */
router.post('/', (req, res) => {
  const { userId, businessId } = req.body;

  if (!userId || !businessId) {
    return res.status(400).json({ error: 'User ID and Business ID are required' });
  }

  // Check if already favorited
  db.get(
    'SELECT id FROM favorites WHERE user_id = ? AND business_id = ?',
    [userId, businessId],
    (err, existing) => {
      if (err) {
        console.error('Error checking existing favorite:', err);
        return res.status(500).json({ error: 'Failed to add favorite' });
      }

      if (existing) {
        return res.status(409).json({ error: 'Business already in favorites' });
      }

      const id = uuidv4();

      db.run(
        'INSERT INTO favorites (id, user_id, business_id) VALUES (?, ?, ?)',
        [id, userId, businessId],
        function(err) {
          if (err) {
            console.error('Error adding favorite:', err);
            return res.status(500).json({ error: 'Failed to add favorite' });
          }

          res.status(201).json({
            id,
            user_id: userId,
            business_id: businessId,
            message: 'Added to favorites'
          });
        }
      );
    }
  );
});

/**
 * DELETE /api/favorites/:userId/:businessId
 * Remove a business from favorites
 */
router.delete('/:userId/:businessId', (req, res) => {
  const { userId, businessId } = req.params;

  db.run(
    'DELETE FROM favorites WHERE user_id = ? AND business_id = ?',
    [userId, businessId],
    function(err) {
      if (err) {
        console.error('Error removing favorite:', err);
        return res.status(500).json({ error: 'Failed to remove favorite' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Favorite not found' });
      }

      res.json({ message: 'Removed from favorites' });
    }
  );
});

/**
 * GET /api/favorites/:userId/check/:businessId
 * Check if a business is favorited by user
 */
router.get('/:userId/check/:businessId', (req, res) => {
  const { userId, businessId } = req.params;

  db.get(
    'SELECT id FROM favorites WHERE user_id = ? AND business_id = ?',
    [userId, businessId],
    (err, result) => {
      if (err) {
        console.error('Error checking favorite status:', err);
        return res.status(500).json({ error: 'Failed to check favorite status' });
      }

      res.json({ isFavorited: !!result });
    }
  );
});

/**
 * GET /api/favorites/:userId/export
 * Export user's favorites as CSV data
 */
router.get('/:userId/export', (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT
      b.name,
      b.category,
      b.address,
      b.phone,
      COALESCE(AVG(r.rating), 0) as rating
    FROM favorites f
    JOIN businesses b ON f.business_id = b.id
    LEFT JOIN reviews r ON b.id = r.business_id
    WHERE f.user_id = ?
    GROUP BY b.id
    ORDER BY b.name
  `;

  db.all(query, [userId], (err, favorites) => {
    if (err) {
      console.error('Error fetching favorites for export:', err);
      return res.status(500).json({ error: 'Failed to export favorites' });
    }

    // Format as CSV
    let csv = 'Business Name,Category,Rating,Address,Phone\n';
    favorites.forEach(fav => {
      csv += `"${fav.name}","${fav.category}",${fav.rating.toFixed(1)},"${fav.address}","${fav.phone}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=favorites.csv');
    res.send(csv);
  });
});

module.exports = router;
