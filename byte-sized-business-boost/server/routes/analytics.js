/**
 * Analytics Routes
 * Provides data for analytics dashboard and insights
 */

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const { DB_PATH } = require('../database/init');

const db = new sqlite3.Database(DB_PATH);

/**
 * GET /api/analytics/overview
 * Get overall platform statistics
 */
router.get('/overview', (req, res) => {
  const queries = {
    totalBusinesses: 'SELECT COUNT(*) as count FROM businesses',
    totalReviews: 'SELECT COUNT(*) as count FROM reviews',
    totalUsers: 'SELECT COUNT(*) as count FROM users',
    averageRating: 'SELECT AVG(rating) as average FROM reviews',
    categoryDistribution: 'SELECT category, COUNT(*) as count FROM businesses GROUP BY category',
    recentReviews: `
      SELECT
        r.*,
        b.name as business_name,
        b.category
      FROM reviews r
      JOIN businesses b ON r.business_id = b.id
      ORDER BY r.created_at DESC
      LIMIT 10
    `
  };

  const results = {};

  // Execute all queries
  db.get(queries.totalBusinesses, [], (err, row) => {
    results.totalBusinesses = row ? row.count : 0;

    db.get(queries.totalReviews, [], (err, row) => {
      results.totalReviews = row ? row.count : 0;

      db.get(queries.totalUsers, [], (err, row) => {
        results.totalUsers = row ? row.count : 0;

        db.get(queries.averageRating, [], (err, row) => {
          results.averageRating = row && row.average ? parseFloat(row.average.toFixed(2)) : 0;

          db.all(queries.categoryDistribution, [], (err, rows) => {
            results.categoryDistribution = rows || [];

            db.all(queries.recentReviews, [], (err, rows) => {
              results.recentReviews = rows || [];

              res.json(results);
            });
          });
        });
      });
    });
  });
});

/**
 * GET /api/analytics/top-rated
 * Get top-rated businesses
 */
router.get('/top-rated', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  const query = `
    SELECT
      b.*,
      COALESCE(AVG(r.rating), 0) as averageRating,
      COUNT(DISTINCT r.id) as reviewCount
    FROM businesses b
    LEFT JOIN reviews r ON b.id = r.business_id
    GROUP BY b.id
    HAVING reviewCount > 0
    ORDER BY averageRating DESC, reviewCount DESC
    LIMIT ?
  `;

  db.all(query, [limit], (err, businesses) => {
    if (err) {
      console.error('Error fetching top-rated businesses:', err);
      return res.status(500).json({ error: 'Failed to fetch top-rated businesses' });
    }

    const formatted = businesses.map(b => ({
      id: b.id,
      name: b.name,
      category: b.category,
      image_url: b.image_url,
      averageRating: parseFloat(b.averageRating.toFixed(1)),
      reviewCount: parseInt(b.reviewCount)
    }));

    res.json(formatted);
  });
});

/**
 * GET /api/analytics/trending
 * Get trending businesses (most reviewed in last 30 days)
 */
router.get('/trending', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  const query = `
    SELECT
      b.*,
      COUNT(r.id) as recentReviewCount,
      COALESCE(AVG(r.rating), 0) as averageRating
    FROM businesses b
    LEFT JOIN reviews r ON b.id = r.business_id
      AND r.created_at >= datetime('now', '-30 days')
    GROUP BY b.id
    HAVING recentReviewCount > 0
    ORDER BY recentReviewCount DESC, averageRating DESC
    LIMIT ?
  `;

  db.all(query, [limit], (err, businesses) => {
    if (err) {
      console.error('Error fetching trending businesses:', err);
      return res.status(500).json({ error: 'Failed to fetch trending businesses' });
    }

    const formatted = businesses.map(b => ({
      id: b.id,
      name: b.name,
      category: b.category,
      image_url: b.image_url,
      recentReviewCount: parseInt(b.recentReviewCount),
      averageRating: parseFloat(b.averageRating.toFixed(1))
    }));

    res.json(formatted);
  });
});

/**
 * GET /api/analytics/reviews-over-time
 * Get review count grouped by date for last N days
 */
router.get('/reviews-over-time', (req, res) => {
  const days = parseInt(req.query.days) || 30;

  const query = `
    SELECT
      DATE(created_at) as date,
      COUNT(*) as count
    FROM reviews
    WHERE created_at >= datetime('now', '-${days} days')
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;

  db.all(query, [], (err, results) => {
    if (err) {
      console.error('Error fetching reviews over time:', err);
      return res.status(500).json({ error: 'Failed to fetch review trends' });
    }

    res.json(results);
  });
});

/**
 * GET /api/analytics/rating-distribution
 * Get distribution of ratings (1-5 stars)
 */
router.get('/rating-distribution', (req, res) => {
  const query = `
    SELECT
      rating,
      COUNT(*) as count
    FROM reviews
    GROUP BY rating
    ORDER BY rating DESC
  `;

  db.all(query, [], (err, results) => {
    if (err) {
      console.error('Error fetching rating distribution:', err);
      return res.status(500).json({ error: 'Failed to fetch rating distribution' });
    }

    // Ensure all ratings 1-5 are represented
    const distribution = [1, 2, 3, 4, 5].map(rating => {
      const found = results.find(r => r.rating === rating);
      return {
        rating,
        count: found ? found.count : 0
      };
    });

    res.json(distribution);
  });
});

/**
 * GET /api/analytics/user/:userId
 * Get analytics for a specific user
 */
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;

  const queries = {
    reviewCount: 'SELECT COUNT(*) as count FROM reviews WHERE user_id = ?',
    favoriteCount: 'SELECT COUNT(*) as count FROM favorites WHERE user_id = ?',
    averageRating: 'SELECT AVG(rating) as average FROM reviews WHERE user_id = ?',
    categoryPreferences: `
      SELECT b.category, COUNT(*) as count
      FROM favorites f
      JOIN businesses b ON f.business_id = b.id
      WHERE f.user_id = ?
      GROUP BY b.category
      ORDER BY count DESC
    `
  };

  const results = {};

  db.get(queries.reviewCount, [userId], (err, row) => {
    results.reviewCount = row ? row.count : 0;

    db.get(queries.favoriteCount, [userId], (err, row) => {
      results.favoriteCount = row ? row.count : 0;

      db.get(queries.averageRating, [userId], (err, row) => {
        results.averageRatingGiven = row && row.average ? parseFloat(row.average.toFixed(2)) : 0;

        db.all(queries.categoryPreferences, [userId], (err, rows) => {
          results.categoryPreferences = rows || [];

          res.json(results);
        });
      });
    });
  });
});

/**
 * GET /api/analytics/business/:businessId
 * Get detailed analytics for a specific business
 */
router.get('/business/:businessId', (req, res) => {
  const { businessId } = req.params;

  const queries = {
    overview: `
      SELECT
        b.*,
        COALESCE(AVG(r.rating), 0) as averageRating,
        COUNT(DISTINCT r.id) as reviewCount,
        COUNT(DISTINCT f.id) as favoriteCount
      FROM businesses b
      LEFT JOIN reviews r ON b.id = r.business_id
      LEFT JOIN favorites f ON b.id = f.business_id
      WHERE b.id = ?
      GROUP BY b.id
    `,
    ratingDistribution: `
      SELECT rating, COUNT(*) as count
      FROM reviews
      WHERE business_id = ?
      GROUP BY rating
      ORDER BY rating DESC
    `,
    recentReviews: `
      SELECT * FROM reviews
      WHERE business_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `,
    reviewsOverTime: `
      SELECT
        DATE(created_at) as date,
        COUNT(*) as count
      FROM reviews
      WHERE business_id = ? AND created_at >= datetime('now', '-90 days')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `
  };

  db.get(queries.overview, [businessId], (err, overview) => {
    if (err || !overview) {
      return res.status(404).json({ error: 'Business not found' });
    }

    db.all(queries.ratingDistribution, [businessId], (err, ratingDist) => {
      db.all(queries.recentReviews, [businessId], (err, recentReviews) => {
        db.all(queries.reviewsOverTime, [businessId], (err, reviewTrend) => {
          res.json({
            ...overview,
            hours: JSON.parse(overview.hours),
            averageRating: parseFloat(overview.averageRating.toFixed(1)),
            ratingDistribution: ratingDist || [],
            recentReviews: recentReviews || [],
            reviewsOverTime: reviewTrend || []
          });
        });
      });
    });
  });
});

module.exports = router;
