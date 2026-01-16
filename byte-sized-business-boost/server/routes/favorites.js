/**
 * Favorites Routes
 * Handles user favorites/bookmarking functionality
 * Supports both local and external (Google Places) businesses
 */

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const { DB_PATH } = require('../database/init');

const db = new sqlite3.Database(DB_PATH);

/**
 * Helper: Create external_favorites table if not exists
 * This table stores favorites for external businesses (not in main businesses table)
 */
db.run(`
  CREATE TABLE IF NOT EXISTS external_favorites (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    business_id TEXT NOT NULL,
    business_data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, business_id)
  )
`);

/**
 * GET /api/favorites/:userId
 * Get all favorites for a user (combines local and external)
 */
router.get('/:userId', (req, res) => {
  const { userId } = req.params;

  // First get favorites from businesses table
  const localQuery = `
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

  // Then get external favorites
  const externalQuery = `
    SELECT * FROM external_favorites WHERE user_id = ?
  `;

  db.all(localQuery, [userId], (err, localFavorites) => {
    if (err) {
      console.error('Error fetching local favorites:', err);
      return res.status(500).json({ error: 'Failed to fetch favorites' });
    }

    const formattedLocal = localFavorites.map(fav => ({
      ...fav,
      hours: typeof fav.hours === 'string' ? JSON.parse(fav.hours) : fav.hours,
      averageRating: parseFloat((fav.averageRating || 0).toFixed(1)),
      reviewCount: parseInt(fav.reviewCount || 0),
      isExternal: false
    }));

    // Get external favorites
    db.all(externalQuery, [userId], (err2, externalFavorites) => {
      if (err2) {
        console.error('Error fetching external favorites:', err2);
        // Return local favorites only if external query fails
        return res.json(formattedLocal);
      }

      const formattedExternal = externalFavorites.map(fav => {
        try {
          const businessData = JSON.parse(fav.business_data);
          return {
            ...businessData,
            favorite_id: fav.id,
            favorited_at: fav.created_at,
            isExternal: true
          };
        } catch (e) {
          console.error('Error parsing external favorite:', e);
          return null;
        }
      }).filter(Boolean);

      // Combine and sort by favorited_at
      const allFavorites = [...formattedLocal, ...formattedExternal];
      allFavorites.sort((a, b) => new Date(b.favorited_at || b.created_at) - new Date(a.favorited_at || a.created_at));

      res.json(allFavorites);
    });
  });
});

/**
 * POST /api/favorites
 * Add a business to favorites
 * Body: { userId, businessId, businessData (optional for external) }
 */
router.post('/', (req, res) => {
  const { userId, businessId, businessData } = req.body;

  if (!userId || !businessId) {
    return res.status(400).json({ error: 'User ID and Business ID are required' });
  }

  // First check if business exists in the local database
  db.get('SELECT id FROM businesses WHERE id = ?', [businessId], (err, localBusiness) => {
    if (err) {
      console.error('Error checking business:', err);
      return res.status(500).json({ error: 'Failed to add favorite' });
    }

    if (localBusiness) {
      // Business exists locally - use regular favorites table
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
    } else {
      // External business - store in external_favorites with business data
      db.get(
        'SELECT id FROM external_favorites WHERE user_id = ? AND business_id = ?',
        [userId, businessId],
        (err, existing) => {
          if (err) {
            console.error('Error checking existing external favorite:', err);
            return res.status(500).json({ error: 'Failed to add favorite' });
          }

          if (existing) {
            return res.status(409).json({ error: 'Business already in favorites' });
          }

          const id = uuidv4();
          const dataToStore = JSON.stringify(businessData || { id: businessId, name: 'Unknown Business' });

          db.run(
            'INSERT INTO external_favorites (id, user_id, business_id, business_data) VALUES (?, ?, ?, ?)',
            [id, userId, businessId, dataToStore],
            function(err) {
              if (err) {
                console.error('Error adding external favorite:', err);
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
    }
  });
});

/**
 * DELETE /api/favorites/:userId/:businessId
 * Remove a business from favorites (checks both local and external)
 */
router.delete('/:userId/:businessId', (req, res) => {
  const { userId, businessId } = req.params;

  // Try to delete from local favorites first
  db.run(
    'DELETE FROM favorites WHERE user_id = ? AND business_id = ?',
    [userId, businessId],
    function(err) {
      if (err) {
        console.error('Error removing favorite:', err);
        return res.status(500).json({ error: 'Failed to remove favorite' });
      }

      if (this.changes > 0) {
        return res.json({ message: 'Removed from favorites' });
      }

      // If not found in local, try external favorites
      db.run(
        'DELETE FROM external_favorites WHERE user_id = ? AND business_id = ?',
        [userId, businessId],
        function(err2) {
          if (err2) {
            console.error('Error removing external favorite:', err2);
            return res.status(500).json({ error: 'Failed to remove favorite' });
          }

          if (this.changes === 0) {
            return res.status(404).json({ error: 'Favorite not found' });
          }

          res.json({ message: 'Removed from favorites' });
        }
      );
    }
  );
});

/**
 * GET /api/favorites/:userId/check/:businessId
 * Check if a business is favorited by user (checks both local and external)
 */
router.get('/:userId/check/:businessId', (req, res) => {
  const { userId, businessId } = req.params;

  // Check local favorites
  db.get(
    'SELECT id FROM favorites WHERE user_id = ? AND business_id = ?',
    [userId, businessId],
    (err, localResult) => {
      if (err) {
        console.error('Error checking favorite status:', err);
        return res.status(500).json({ error: 'Failed to check favorite status' });
      }

      if (localResult) {
        return res.json({ isFavorited: true });
      }

      // Check external favorites
      db.get(
        'SELECT id FROM external_favorites WHERE user_id = ? AND business_id = ?',
        [userId, businessId],
        (err2, externalResult) => {
          if (err2) {
            console.error('Error checking external favorite status:', err2);
            return res.status(500).json({ error: 'Failed to check favorite status' });
          }

          res.json({ isFavorited: !!externalResult });
        }
      );
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
