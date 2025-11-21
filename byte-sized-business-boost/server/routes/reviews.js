/**
 * Review Routes
 * Handles review creation, retrieval, and management
 */

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const { DB_PATH } = require('../database/init');

const db = new sqlite3.Database(DB_PATH);

/**
 * GET /api/reviews/:businessId
 * Get all reviews for a specific business
 */
router.get('/:businessId', (req, res) => {
  const { businessId } = req.params;
  const { sort = 'recent' } = req.query;

  let orderBy = 'created_at DESC';
  if (sort === 'highest') orderBy = 'rating DESC, created_at DESC';
  else if (sort === 'lowest') orderBy = 'rating ASC, created_at DESC';
  else if (sort === 'helpful') orderBy = 'helpful_count DESC, created_at DESC';

  const query = `
    SELECT * FROM reviews
    WHERE business_id = ?
    ORDER BY ${orderBy}
  `;

  db.all(query, [businessId], (err, reviews) => {
    if (err) {
      console.error('Error fetching reviews:', err);
      return res.status(500).json({ error: 'Failed to fetch reviews' });
    }

    res.json(reviews);
  });
});

/**
 * POST /api/reviews
 * Create a new review
 * Body: { businessId, userId, username, rating, comment, verificationToken }
 */
router.post('/', (req, res) => {
  const { businessId, userId, username, rating, comment, verificationToken } = req.body;

  // Validation
  if (!businessId || !userId || !username || !rating || !comment) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  if (comment.length > 500) {
    return res.status(400).json({ error: 'Comment must be 500 characters or less' });
  }

  if (!verificationToken) {
    return res.status(400).json({ error: 'Bot verification required' });
  }

  // Sanitize comment to prevent XSS
  const sanitizedComment = comment
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  const id = uuidv4();

  const query = `
    INSERT INTO reviews (id, business_id, user_id, username, rating, comment)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [id, businessId, userId, username, parseInt(rating), sanitizedComment],
    function(err) {
      if (err) {
        console.error('Error creating review:', err);
        return res.status(500).json({ error: 'Failed to create review' });
      }

      // Log successful verification
      db.run(
        'INSERT INTO verification_logs (id, user_id, verification_type, success) VALUES (?, ?, ?, ?)',
        [uuidv4(), userId, 'review', 1]
      );

      // Return the created review
      db.get(
        'SELECT * FROM reviews WHERE id = ?',
        [id],
        (err, review) => {
          if (err) {
            return res.status(500).json({ error: 'Review created but failed to retrieve' });
          }
          res.status(201).json(review);
        }
      );
    }
  );
});

/**
 * PUT /api/reviews/:id/helpful
 * Increment helpful count for a review
 */
router.put('/:id/helpful', (req, res) => {
  const { id } = req.params;

  const query = 'UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = ?';

  db.run(query, [id], function(err) {
    if (err) {
      console.error('Error updating helpful count:', err);
      return res.status(500).json({ error: 'Failed to update helpful count' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    db.get('SELECT helpful_count FROM reviews WHERE id = ?', [id], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to retrieve updated count' });
      }
      res.json({ helpful_count: result.helpful_count });
    });
  });
});

/**
 * DELETE /api/reviews/:id
 * Delete a review (owner or admin only)
 */
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID required' });
  }

  // Check if user owns this review
  db.get('SELECT user_id FROM reviews WHERE id = ?', [id], (err, review) => {
    if (err) {
      console.error('Error checking review ownership:', err);
      return res.status(500).json({ error: 'Failed to verify review ownership' });
    }

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    db.run('DELETE FROM reviews WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('Error deleting review:', err);
        return res.status(500).json({ error: 'Failed to delete review' });
      }

      res.json({ message: 'Review deleted successfully' });
    });
  });
});

/**
 * GET /api/reviews/user/:userId
 * Get all reviews by a specific user
 */
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT r.*, b.name as business_name, b.category, b.image_url
    FROM reviews r
    JOIN businesses b ON r.business_id = b.id
    WHERE r.user_id = ?
    ORDER BY r.created_at DESC
  `;

  db.all(query, [userId], (err, reviews) => {
    if (err) {
      console.error('Error fetching user reviews:', err);
      return res.status(500).json({ error: 'Failed to fetch user reviews' });
    }

    res.json(reviews);
  });
});

module.exports = router;
